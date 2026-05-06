import {z} from 'zod'

export const GymCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  city: z.string().trim().max(100).optional().nullable(),
})

export const GymUpdateSchema = GymCreateSchema.extend({
  id: z.string().min(1),
})

export const GymDeleteSchema = z.object({
  id: z.string().min(1),
})

export type GymCreateInput = z.infer<typeof GymCreateSchema>
export type GymUpdateInput = z.infer<typeof GymUpdateSchema>
export type GymDeleteInput = z.infer<typeof GymDeleteSchema>