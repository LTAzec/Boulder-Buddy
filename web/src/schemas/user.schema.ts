import {z} from 'zod'
import {Role} from '@/generated/prisma/enums'

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  password: z
    .string()
    .min(8, {message: 'The password must be at least 8 characters long.'})
    .max(100, {message: "The password can't be longer than 100 characters."}),
  username: z.string().min(3, {message: 'The username must be at least 3 characters long.'}),
  role: z.enum(Role),
})

export const signInSchema = userSchema.omit({id: true, role: true, username: true})

export const registerSchema = userSchema
  .omit({id: true, role: true})
  // Via extend kunnen we een bestaand schema uitbreiden met extra velden.
  .extend({
    passwordConfirmation: z.string(),
  })
  // De refine methode, die beschikbaar is op properties en het schema zelf, kan gebruikt worden om extra validatie toe
  // te voegen die niet standaard aanwezig is in Zod.
  .refine(data => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'The password and confirmation do not match.',
  })

export const updateUserSchema = userSchema.pick({username: true})
export const updateRoleSchema = userSchema.pick({role: true, id: true})
