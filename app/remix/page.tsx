'use client'
import { useState } from 'react'

export default function RemixPage() {
    const [file, setFile] = useState<File | null>(null)
    const [prompt, setPrompt] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!file) return
            setLoading(true)

            const formData = new FormData()
            formData.append('image', file)
                formData.append('prompt', prompt)

                    const res = await fetch('/api/remix', {
                        method: 'POST',
                        body: formData,
                    })

                    const data = await res.json()
                    setImageUrl(data.output)
                    setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Remix an Image with AI</h1>

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4" />
        <input
        type="text"
        placeholder="Describe the remix..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 border w-full max-w-md rounded mb-4"
        />

        <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
        {loading ? 'Remixing...' : 'Generate Remix'}
        </button>

        {imageUrl && (
            <div className="mt-6">
            <img src={imageUrl} alt="AI Remix" className="rounded shadow-md max-w-md" />
            </div>
        )}
        </div>
    )
}
