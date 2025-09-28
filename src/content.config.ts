// src/content.config.ts
import { defineCollection, z } from "astro:content";

const plagas = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    image: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const collections = { plagas };
