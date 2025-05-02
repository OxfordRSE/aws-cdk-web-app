// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AnimalCard } from '@/components/AnimalCard'
import { AnimalModal } from '@/components/AnimalModal'
import {Filter, SearchBar} from '@/components/SearchBar'
import { CaptionedImage } from '@prisma/client'

export default function Home() {
    const [images, setImages] = useState<CaptionedImage[]>([])
    const [filteredImages, setFilteredImages] = useState<CaptionedImage[]>([])
    const [filter, setFilter] = useState<Filter>({ query: '', animal: 'all' })
    const [modalAnimal, setModalAnimal] = useState<'cat' | 'dog' | 'random' | null>(null)
    const [searchKey, setSearchKey] = useState(0)

    useEffect(() => {
        const fetchAndUpdate = async () => {
            if (modalAnimal) return
            const res = await fetch('/api/images')
            const data = await res.json() as CaptionedImage[]
            const current_ids = images.map(i => i.id);
            const new_data = data.filter(d => !current_ids.includes(d.id));
            setImages([...images, ...new_data]);
        }

        // Fetch on focus
        const handleFocus = () => {
            fetchAndUpdate()
        }

        window.addEventListener('focus', handleFocus)

        const interval = setInterval(fetchAndUpdate, 15_000)

        if (!images.length) {
            fetchAndUpdate()
        }

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    useEffect(() => {
        const { query, animal } = filter
        const lower = query.toLowerCase()
        const filtered = images.filter(img =>
            (animal === 'all' || img.animal === animal) &&
            (!query || img.caption.toLowerCase().includes(lower) || img.username?.toLowerCase().includes(lower))
        )
        setFilteredImages(filtered)
    }, [filter, images])

    return (
        <main className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">🐾 Rainy Day Animal Captions</h1>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 justify-between">
                <div className="flex gap-2">
                    <Button onClick={() => setModalAnimal('cat')}>Add Cat</Button>
                    <Button onClick={() => setModalAnimal('dog')}>Add Dog</Button>
                    <Button onClick={() => setModalAnimal('random')}>Surprise Me</Button>
                </div>
                <SearchBar
                    key={searchKey}
                    filter={{ query: '', animal: 'all' }}
                    setFilter={setFilter}
                />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {filteredImages.map(img => (
                    <AnimalCard key={img.id} image={img} />
                ))}
            </div>

            {modalAnimal && (
                <AnimalModal
                    animal={modalAnimal}
                    onClose={() => setModalAnimal(null)}
                    onSubmit={newImage => {
                        setImages(prev => [newImage, ...prev])
                        setSearchKey(prev => prev + 1) // force SearchBar to reset
                    }}
                />
            )}
        </main>
    )
}
