import {z} from 'zod';


export const TagBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tag naam moet minstens 2 karakters lang zijn")
    .max(25, "Tag naam mag maximaal 25 karakters lang zijn"),
});

export const TagCreateSchema = TagBaseSchema;

export const TagUpdateSchema = TagBaseSchema.extend({
  id: z.string().uuid(),
});

export const TagDeleteSchema = z.object({
  id: z.string().uuid(),
})

export type TagCreateInput = z.infer<typeof TagCreateSchema>;
export type TagUpdateInput = z.infer<typeof TagUpdateSchema>;
export type TagDeleteInput = z.infer<typeof TagDeleteSchema>;