import {execSync} from 'child_process'

function checkIfDatabaseExists(): boolean {
    try {
        const output = execSync('npx prisma migrate status --schema=prisma/schema.prisma', {
            encoding: 'utf8',
        })

        return !output.includes('The current database is not managed by Prisma Migrate')
    } catch (err) {
        console.warn('⚠️ Could not determine migration status. Assuming database does not exist.')
        return false
    }
}

try {
    const exists = checkIfDatabaseExists()

    console.log('📦 Running prisma migrate deploy...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })

    if (!exists) {
        console.log('🌱 Running seed script (first-time only)...')
        execSync('node prisma/seed.js', { stdio: 'inherit' })
    } else {
        console.log('✅ Skipping seed: database already exists.')
    }
} catch (err) {
    console.error('❌ Database initialization failed:', err)
    process.exit(1)
}
