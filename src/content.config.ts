import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    date: z.string(), 
    categories: z.array(z.enum(['game', 'audio', 'other'])).min(1),
    badge: z.string().optional(),
    description: z.string().optional(),
    externalUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    gallery: z.array(z.string()).optional(),
  }),
});

export const collections = { projects };