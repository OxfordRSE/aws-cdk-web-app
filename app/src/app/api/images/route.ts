// app/api/images/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '12')
    const skip = (page - 1) * perPage

    const [images, total] = await Promise.all([
        prisma.captionedImage.findMany({
            where: { flaggedAbusive: false },
            orderBy: { createdAt: 'desc' },
            skip,
            take: perPage,
        }),
        prisma.captionedImage.count({ where: { adminApproved: true } }),
    ])

    return NextResponse.json({ images, total, page, perPage })
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
