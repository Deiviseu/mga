import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts do blog técnico em /content/blog/*.md. draft: true = não publicado
// (aparece só em `npm run dev`).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    category: z.enum(['tecnico', 'meio-ambiente']),
    lang: z.enum(['pt', 'en', 'es']).default('pt'),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    author: z.string().optional(),
    image: z.string().url().optional(),
  }),
});

export const collections = { blog };
