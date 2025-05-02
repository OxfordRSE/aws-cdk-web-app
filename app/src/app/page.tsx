// app/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { AnimalCard } from '@/components/AnimalCard'
import { AnimalModal } from '@/components/AnimalModal'
import {Filter, SearchBar} from '@/components/SearchBar'
import { CaptionedImage } from '@prisma/client'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function Home() {
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [perPage, setPerPage] = useState(12)

    const [images, setImages] = useState<CaptionedImage[]>([])
    const [filteredImages, setFilteredImages] = useState<CaptionedImage[]>([])
    const [filter, setFilter] = useState<Filter>({ query: '', animal: 'all' })
    const [modalAnimal, setModalAnimal] = useState<'cat' | 'dog' | 'random' | null>(null)
    const [searchKey, setSearchKey] = useState(0)

    const fetchPage = useCallback(async (pageToFetch: number) => {
        const res = await fetch(`/api/images?page=${pageToFetch}&perPage=${perPage}`)
        const { images: newImages, total } = await res.json()

        if (pageToFetch === 1) {
            setImages(newImages)
        } else {
            setImages(prev => [...prev, ...newImages])
        }

        const maxPage = Math.ceil(total / perPage)
        setHasMore(pageToFetch < maxPage)
    }, [perPage])

    useEffect(() => {
        setPage(1)
        fetchPage(1);
    }, [perPage])

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
                <>
                    <AnimalModal
                        animal={modalAnimal}
                        onClose={() => setModalAnimal(null)}
                        onSubmit={newImage => {
                            setImages(prev => [newImage, ...prev])
                            setSearchKey(prev => prev + 1) // force SearchBar to reset
                        }}
                    />
                </>
            )}
            <div className="flex w-full justify-between items-center">
                {hasMore && (
                    <div className="text-center mt-6">
                        <Button onClick={() => {
                            const next = page + 1
                            setPage(next)
                            fetchPage(next)
                        }}>
                            Load more
                        </Button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <label htmlFor="perPage" className="text-sm text-gray-600">Images per page:</label>
                    <Select
                        value={perPage.toString()}
                        onValueChange={(value) => {
                            setPerPage(Number(value))
                        }}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[12, 24, 48, 96].map(size => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </main>
    )
}
