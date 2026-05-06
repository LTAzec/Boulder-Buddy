/* eslint-disable @typescript-eslint/no-unused-vars */

import type { PrismaClient } from '@/generated/prisma/client'
import { Role, BoulderColor, BoulderGrade, LogStatus } from '@/generated/prisma/client'
import bcrypt from 'bcryptjs'
import {hashPassword} from '@/lib/passwordUtils'

export const seedDev = async (prisma: PrismaClient) => {
  console.log('Starting DEV seed...')

  // --- Alles leegmaken ---
  await prisma.comment.deleteMany()
  await prisma.boulderLike.deleteMany()
  await prisma.boulderLog.deleteMany()
  await prisma.boulderTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.boulder.deleteMany()
  await prisma.sector.deleteMany()
  await prisma.wall.deleteMany()
  await prisma.gym.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // --- 1. Test user ---
  const plainPassword = 'Password123!'

  const user = await prisma.user.create({
    data: {
      email: 'user@test.com',
      username: 'User',
      password: hashPassword(plainPassword),
      role: Role.User,
    },
  })

  const setter = await prisma.user.create({
    data: {
      email: 'setter@test.com',
      username: 'Setter',
      password: hashPassword(plainPassword),
      role: Role.Setter,
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      username: 'Admin',
      password: hashPassword(plainPassword),
      role: Role.Admin,
    },
  })

  const superAdmin = await prisma.user.create({
  data: {
    email: 'superadmin@test.com', 
    username: 'SuperAdmin',
    password: hashPassword(plainPassword),
    role: Role.SuperAdmin,
  },
})




  console.log('Created user, setter, admin and superadmin')

  // --- 2. Eén gym: Gustaaf ---
  const gym = await prisma.gym.create({
    data: {
      name: 'Gustaaf Bouldering Gym',
      city: 'Turnhout',
    },
  })

  console.log('Created gym Gustaaf')

  // --- 3. Walls (4 stuks) ---
  const mainWall = await prisma.wall.create({
    data: {
      name: 'Main Wall',
      gymId: gym.id,
      imageUrl: null,
    },
  })

  const overhangWall = await prisma.wall.create({
    data: {
      name: 'Training Wall',
      gymId: gym.id,
      imageUrl: null,
    },
  })

  const slabWall = await prisma.wall.create({
    data: {
      name: 'Slab Wall',
      gymId: gym.id,
      imageUrl: null,
    },
  })

  const inkomWall = await prisma.wall.create({
    data: {
      name: 'Inkom Wall',
      gymId: gym.id,
      imageUrl: null,
    },
  })

  const walls = [mainWall, overhangWall, slabWall, inkomWall]

  console.log('Created 4 walls')

  // --- 4. Sectors (10 stuks) ---
  const sectors = []
  for (let i = 0; i < 10; i++) {
    const sector = await prisma.sector.create({
      data: {
        name: `Sector ${i + 1}`,
        wallId: walls[i % walls.length].id,
        order: i + 1,
      },
    })
    sectors.push(sector)
  }

  console.log('Created 10 sectors')

  // --- 5. Tags (10 stuks) ---
  const tagNames = [
    'Slopers',
    'Crimps',
    'Overhang',
    'Technical',
    'Dyno',
    'Compression',
    'Power',
    'Endurance',
    'Balance',
    'Footwork',
  ].slice(0, 10)

  const tags = []
  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: { name },
    })
    tags.push(tag)
  }

  console.log('Created 10 tags')

  // --- 6. Boulders (10 stuks) ---
  const boulders = []
  const colors = Object.values(BoulderColor) as  BoulderColor[]
  const grades = Object.values(BoulderGrade) as BoulderGrade[]

  for (let i = 0; i < 10; i++) {
    const boulder = await prisma.boulder.create({
      data: {
        name: `Boulder ${i + 1}`,
        color: colors[i % colors.length],
        grade: grades[i % grades.length],
        sectorId: sectors[i % sectors.length].id,
        setByUserId: setter.id,
        setDate: new Date(),
        isActive: true,
        imageUrl: null,
        videoUrl: null,
        posX: Math.floor(Math.random() * 100),
        posY: Math.floor(Math.random() * 100),
      },
    })
    boulders.push(boulder)
  }

  console.log('Created 10 boulders')

  // --- 7. Relaties per boulder ---
  for (const boulder of boulders) {
    // 2 random tags
    const tag1 = tags[Math.floor(Math.random() * tags.length)]
    let tag2 = tags[Math.floor(Math.random() * tags.length)]
    if (tag2.id === tag1.id) {
      tag2 = tags[(tags.indexOf(tag1) + 1) % tags.length]
    }

    await prisma.boulderTag.create({
      data: {
        boulderId: boulder.id,
        tagId: tag1.id,
      },
    })

    await prisma.boulderTag.create({
      data: {
        boulderId: boulder.id,
        tagId: tag2.id,
      },
    })

    await prisma.boulderLog.create({
      data: {
        userId: user.id,
        boulderId: boulder.id,
        status: LogStatus.PROJECT,
        attempts: 1,
        note: `Eerste poging op ${boulder.name}`,
      },
    })

    await prisma.boulderLike.create({
      data: {
        userId: user.id,
        boulderId: boulder.id,
      },
    })

    await prisma.comment.create({
      data: {
        userId: user.id,
        boulderId: boulder.id,
        body: `Leuke boulder: ${boulder.name}`,
      },
    })
  }

  console.log('DEV seeding completed!')
}
