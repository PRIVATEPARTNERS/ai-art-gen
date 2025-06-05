import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { Readable } from 'stream'
import { IncomingForm } from 'formidable'

export const config = {
    api: {
        bodyParser: false,
    },
}

async function parseForm(req: any): Promise<{ fields: any; files: any }> {
    const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true })
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err)
                else resolve({ fields, files })
        })
    })
}

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const prompt = formData.get('prompt') as string

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const base64Image = buffer.toString('base64')

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: "ab594abbadf6f71deaf021a288d4ed4f98a2a2d7a1fc6a05f642a1e7c13bb5ea", // Example: ControlNet for image-to-image
            input: {
                image: `data:image/png;base64,${base64Image}`,
                prompt,
            },
        }),
    })

    const prediction = await response.json()
    if (prediction.error) return NextResponse.json({ error: prediction.error }, { status: 500 })

        // Wait for generation
        let output = null
        while (!output) {
            const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
            })
            const result = await poll.json()

            if (result.status === 'succeeded') output = result.output[0]
                else if (result.status === 'failed') return NextResponse.json({ error: 'Remix failed' }, { status: 500 })

                    await new Promise((r) => setTimeout(r, 1000))
        }

        return NextResponse.json({ output })
}import { createClient } from '@supabase/supabase-js'

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


