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

const devlogs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/devlogs" }),
  schema: z.object({
    title: z.string(),
    project: z.string(),     // e.g., "Dumpster Fire"
    logNumber: z.number(),   // e.g., 1, 2, 3
    date: z.string(),        // e.g., "2026-10-13"
    description: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

export const collections = { projects, devlogs };