import {Role} from '@/generated/prisma/enums'

export const SessionDuration = {
  [Role.User]: 1000 * 60 * 60 * 24, // 24 uur
  [Role.Setter]: 1000 * 60 * 60 * 24, // 24 uur
  [Role.Admin]: 1000 * 60 * 60 * 24, // 24 uur
  [Role.SuperAdmin]: 1000 * 60 * 60 * 24, //24 uur
} satisfies Record<Role, number>
