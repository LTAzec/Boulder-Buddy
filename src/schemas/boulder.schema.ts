import { z } from 'zod'
import { BoulderColor, BoulderGrade } from '@/generated/prisma/enums'

export const BoulderCreateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional().nullable(),

  color: z.nativeEnum(BoulderColor),
  grade: z.nativeEnum(BoulderGrade),

  sectorId: z.string().uuid(),
  setByUserId: z.string().uuid().optional().nullable(),

  setDate: z.coerce.date().default(() => new Date()),

  isActive: z.coerce.boolean().optional().default(true),

  imageUrl: z.string().min(1).optional().nullable(),
  videoUrl: z.string().min(1).optional().nullable(),

//als het een lege string is, dan undefined maken, hij verwacht een number
  posX: z.preprocess(v => (v === '' || v === undefined ? undefined : v), z.coerce.number().int().min(0)).optional(), 
  posY: z.preprocess(v => (v === '' || v === undefined ? undefined : v), z.coerce.number().int().min(0)).optional(),


  tagIds: z.array(z.string().uuid()).optional(),
})

export const BoulderUpdateSchema = BoulderCreateSchema.extend({
  id: z.string().uuid(),
})


export const BoulderDeleteSchema = z.object({
  id: z.string().uuid(),
})
