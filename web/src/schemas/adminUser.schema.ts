import { z } from 'zod'
import { Role } from '@/generated/prisma/enums'

export const AdminUserCreateSchema = z.object({
  email: z.string().email(),
  username: z.string().trim().min(2).max(50),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional().default(Role.User),
})

export const AdminUserUpdateSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  username: z.string().trim().min(2).max(50).optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(6).optional(),
})

export const AdminUserDeleteSchema = z.object({
  id: z.string().uuid(),
})
