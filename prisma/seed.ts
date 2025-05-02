import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

const names = ['Buddy', 'Luna', 'Milo', 'Cleo', 'Charlie', 'Bella', 'Max', 'Simba', 'Nala', 'Oliver']
const captions = [
    'Plotting my next nap.',
    'Did someone say walk?',
    'You may feed me now.',
    'This is my happy face.',
    'Mondays, am I right?',
    'Living my best life.',
    'No thoughts, just vibes.',
    'What do you mean “off the couch”?',
    'Judging you silently.',
    'Zoomies incoming!',
]

async function getRandomImage(animal: 'cat' | 'dog'): Promise<string | null> {
    try {
        if (animal === 'cat') {
            const res = await fetch('https://api.thecatapi.com/v1/images/search')
            const data = await res.json()
            return (data as {url: string}[])[0]?.url || null
        } else {
            const res = await fetch('https://dog.ceo/api/breeds/image/random')
            const data = await res.json()
            return (data as {message: string})?.message || null
        }
    } catch {
        return null
    }
}

async function main() {
    console.log('🌱 Seeding 20 random images...')

    const entries = []

    for (let i = 0; i < 20; i++) {
        const animal = Math.random() < 0.5 ? 'cat' : 'dog'
        const imageUrl = await getRandomImage(animal)

        if (!imageUrl) continue

        const username = names[Math.floor(Math.random() * names.length)]
        const caption = captions[Math.floor(Math.random() * captions.length)]

        entries.push({
            imageUrl,
            caption,
            username,
            animal,
            adminApproved: true,
        })
    }

    await prisma.captionedImage.createMany({
        data: entries,
    })

    console.log(`✅ Seeded ${entries.length} images.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
