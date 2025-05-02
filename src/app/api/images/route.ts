// app/api/images/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const images = await prisma.captionedImage.findMany({
        where: { flaggedAbusive: false },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(images)
}

export async function POST(req: Request) {
    const { imageUrl, caption, username, animal } = await req.json()

    if (!imageUrl || !caption || !animal) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newImage = await prisma.captionedImage.create({
        data: {
            imageUrl,
            caption,
            username: username?.trim() || null,
            animal
        },
    })

    return NextResponse.json(newImage, { status: 201 })
}
