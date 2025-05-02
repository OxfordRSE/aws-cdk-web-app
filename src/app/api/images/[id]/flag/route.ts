// app/api/images/[id]/flag/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params

    try {
        await prisma.captionedImage.update({
            where: { id },
            data: { flaggedAbusive: true },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
}
