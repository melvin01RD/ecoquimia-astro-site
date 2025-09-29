// src/content/config.ts
import { defineCollection, z } from "astro:content";

const plagas = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),             
      excerpt: z.string().optional(),
      cover: z.string().optional(),
      tags: z.array(z.string()).default([]),
      updated: z.string().or(z.date()).optional(),
      draft: z.boolean().default(false),
    })
    .passthrough(), // permite campos extra sin romper el build
});

export const collections = { plagas };
