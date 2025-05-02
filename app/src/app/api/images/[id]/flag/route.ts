// app/api/images/[id]/flag/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        await prisma.captionedImage.update({
            where: { id, adminApproved: false },
            data: { flaggedAbusive: true },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
}
