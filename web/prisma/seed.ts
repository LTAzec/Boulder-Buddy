import {seedDev} from './seedDev'
import {seedProd} from './seedProd'
import {env} from 'process'
import {PrismaClient} from '@/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const runtimeEnv = env.NODE_ENV ?? 'development'
const client = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})})

const seedFunction = runtimeEnv === 'development' ? seedDev : seedProd

seedFunction(client)
  .then(async () => {
    await client.$disconnect()
    console.log('Successfully seeded')
  })
  .catch(async error => {
    console.error(error)
    await client.$disconnect()
    process.exit(1)
  })
