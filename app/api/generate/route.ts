import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { prompt } = await req.json()

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: "db21e45a3b0e0706d12e54baf7d79fba7d8b4a8df1aa87e258f0c30c3f9b7b7c", // Stable Diffusion 1.5
            input: { prompt },
        }),
    })

    const prediction = await response.json()

    if (prediction.error) {
        return NextResponse.json({ error: prediction.error }, { status: 500 })
    }

    // Poll until complete
    let output = null
    while (!output) {
        const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
        })
        const result = await poll.json()

        if (result.status === 'succeeded') {
            output = result.output[0]
        } else if (result.status === 'failed') {
            return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
        }

        await new Promise((r) => setTimeout(r, 1000))
    }

    return NextResponse.json({ output })
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data: sessionData } = await supabase.auth.getSession()
const user_id = sessionData?.session?.user?.id

await supabase.from('images').insert({
    user_id,
    prompt,
    image_url: output,
    type: 'text-to-image',
})
