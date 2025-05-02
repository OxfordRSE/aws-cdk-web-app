'use client'

import { useState} from 'react'
import { CaptionedImage } from '@prisma/client'
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from '@/components/ui/dialog'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AnimalCard({ image }: { image: CaptionedImage }) {
    const [flagged, setFlagged] = useState(image.flaggedAbusive)
    const [imageStatus, setImageStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')

    if (imageStatus === 'invalid') {
        console.error("Cannot load image", image)
        return null
    }

    const handleFlag = async () => {
        if (flagged) return
        const res = await fetch(`/api/images/${image.id}/flag`, { method: 'POST' })
        if (res.ok) setFlagged(true)
    }

    if (flagged) {
        return null;
    }

    return (
        <div className="border rounded-xl p-3 shadow-sm space-y-2 bg-white relative pb-8">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="space-y-2">
                        <img
                            src={image.imageUrl}
                            alt={image.caption}
                            onError={() => setImageStatus('invalid')}
                            onLoad={() => setImageStatus('valid')}
                            className="rounded-md w-full object-cover max-h-48"
                        />
                        {imageStatus === 'loading' && "Loading..."}
                        <DialogTitle className="space-y-1">
                            <p className="text-gray-800 italic font-normal">"{image.caption}"</p>
                            {image.username && (
                                <p className="text-xs text-gray-500 text-end">– {image.username}</p>
                            )}
                        </DialogTitle>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                    <img
                        src={image.imageUrl}
                        alt={image.caption}
                        className="rounded-md w-full object-contain max-h-[80vh]"
                    />
                    <p className="text-sm text-gray-800 italic">"{image.caption}"</p>
                    {image.username && (
                        <p className="text-xs text-gray-500">– {image.username}</p>
                    )}
                </DialogContent>
            </Dialog>

            {!image.adminApproved && <Button
                variant="ghost"
                size="sm"
                disabled={flagged}
                onClick={handleFlag}
                className="bottom-0 end-0 absolute"
                title="This is absuive content"
            >
                <Flag size={18} className='hover:text-red-500' />
            </Button>}
        </div>
    )
}
