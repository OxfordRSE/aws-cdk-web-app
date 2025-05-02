'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CaptionedImage } from '@prisma/client'

type Animal = 'cat' | 'dog' | 'random'

export function AnimalModal({
                                animal,
                                onClose,
                                onSubmit,
                            }: {
    animal: Animal
    onClose: () => void
    onSubmit: (img: CaptionedImage) => void
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [username, setUsername] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchImage = async () => {
            let url = ''
            if (animal === 'cat' || animal === 'random' && Math.random() < 0.5) {
                const res = await fetch('https://api.thecatapi.com/v1/images/search', {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_CAT_API_KEY ?? '',
                    },
                })
                const data = await res.json()
                url = data[0]?.url
            } else {
                const res = await fetch('https://dog.ceo/api/breeds/image/random')
                const data = await res.json()
                url = data?.message
            }
            setImageUrl(url)
        }
        fetchImage()
    }, [animal])

    const handleSubmit = async () => {
        if (!caption || !imageUrl) return
        setSubmitting(true)

        const res = await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl,
                caption,
                username,
                animal: imageUrl.includes('thecatapi') ? 'cat' : 'dog',
            }),
        })

        if (res.ok) {
            const data = await res.json()
            onSubmit(data)
            onClose()
        } else {
            alert('Failed to submit caption.')
        }

        setSubmitting(false)
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md space-y-4">
                <h2 className="text-xl font-bold">Add a Caption</h2>

                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="animal"
                        className="w-full rounded-md max-h-64 object-contain"
                    />
                ) : (
                    <p>Loading image...</p>
                )}

                <div className="space-y-2">
                    <Label htmlFor="username">Name (optional)</Label>
                    <Input
                        id="username"
                        placeholder="e.g. Alex"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Textarea
                        id="caption"
                        placeholder="What’s this animal thinking?"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full"
                    disabled={!caption || submitting}
                    onClick={handleSubmit}
                >
                    {submitting ? 'Submitting...' : 'Submit Caption'}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
