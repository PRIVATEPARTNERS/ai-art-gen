'use client'
import { useState } from 'react'

export default function GeneratePage() {
    const [prompt, setPrompt] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const generateImage = async () => {
        setLoading(true)
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })
        const data = await response.json()
        setImageUrl(data.output)
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">AI Art Generator</h1>
        <input
        type="text"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 w-full max-w-md border rounded mb-4"
        />
        <button
        onClick={generateImage}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
        {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {imageUrl && (
            <div className="mt-6">
            <img src={imageUrl} alt="Generated" className="rounded shadow-md max-w-md" />
            </div>
        )}
        </div>
    )
}
