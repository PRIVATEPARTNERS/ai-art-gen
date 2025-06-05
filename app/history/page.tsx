'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function HistoryPage() {
    const [images, setImages] = useState([])

    useEffect(() => {
        const fetchImages = async () => {
            const { data, error } = await supabase
            .from('images')
            .select('*')
            .order('created_at', { ascending: false })

            if (!error) setImages(data)
        }

        fetchImages()
    }, [])

    return (
        <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Your AI Art History</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img: any) => (
            <div key={img.id} className="bg-white p-4 rounded shadow">
            <img src={img.image_url} className="rounded mb-2" />
            <p className="text-sm text-gray-600">{img.prompt}</p>
            <p className="text-xs text-gray-400 mt-1">{img.type} • {new Date(img.created_at).toLocaleString()}</p>
            </div>
        ))}
        </div>
        </div>
    )
}
