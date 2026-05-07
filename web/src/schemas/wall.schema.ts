import { z } from 'zod'

const UuidSchema = z.string().uuid()

export const WallIdSchema = z.object({
  id: UuidSchema,
})

export const WallCreateSchema = z.object({
  name: z.string().min(2).max(50),
  gymId: UuidSchema,
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
})

export const WallUpdateSchema = z.object({
  id: UuidSchema,
  name: z.string().min(2).max(50).optional(),
  gymId: UuidSchema.optional(),
  imageUrl: z
    .string()
    .url()
    .or(z.literal(''))
    .transform((v) => (v === '' ? null : v))
    .optional(),
})

export const WallDeleteSchema = WallIdSchema

export type WallCreateInput = z.infer<typeof WallCreateSchema>
export type WallUpdateInput = z.infer<typeof WallUpdateSchema>
