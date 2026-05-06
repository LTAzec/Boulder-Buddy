import type {Prisma} from '@/generated/prisma/client'

export const profileOmit = {
  password: true,
} satisfies Prisma.UserOmit

export type Profile = Prisma.UserGetPayload<{omit: typeof profileOmit}>

export const sessionWithProfileInclude = {
  user: {
    omit: profileOmit,
  },
} satisfies Prisma.SessionInclude

export type SessionWithProfile = Prisma.SessionGetPayload<{include: typeof sessionWithProfileInclude}>
