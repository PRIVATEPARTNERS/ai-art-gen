import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('image') as File
        const prompt = formData.get('prompt') as string

        if (!file || !prompt) {
            return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString('base64')

        // Send to Replicate
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: "ab594abbadf6f71deaf021a288d4ed4f98a2a2d7a1fc6a05f642a1e7c13bb5ea",
                input: {
                    image: `data:image/png;base64,${base64Image}`,
                    prompt,
                },
            }),
        })

        const prediction = await response.json()
        if (prediction.error) {
            return NextResponse.json({ error: prediction.error }, { status: 500 })
        }

        // Poll for result
        let output = null
        while (!output) {
            const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
            })
            const result = await poll.json()

            if (result.status === 'succeeded') {
                output = result.output[0]
            } else if (result.status === 'failed') {
                return NextResponse.json({ error: 'Remix failed' }, { status: 500 })
            }

            await new Promise((res) => setTimeout(res, 1000))
        }

        // Save to Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: sessionData } = await supabase.auth.getSession()
        const user_id = sessionData?.session?.user?.id

        if (user_id) {
            await supabase.from('images').insert({
                user_id,
                prompt,
                image_url: output,
                type: 'text-to-image',
            })
        }

        return NextResponse.json({ output })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

