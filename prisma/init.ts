import { execSync } from 'child_process'

try {
    console.log('🔍 Checking Prisma migration status...')
    const output = execSync('npx prisma migrate status --schema=prisma/schema.prisma', {
        encoding: 'utf8'
    })

    if (output.includes('have not yet been applied')) {
        console.log('📦 Running migrations...')
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })

        console.log('🌱 Running seed script...')
        execSync('node prisma/seed.js', { stdio: 'inherit' })
    } else {
        console.log('✅ No migrations needed.')
    }
} catch (err) {
    console.error('❌ Database initialization failed:', err)
    process.exit(1)
}
