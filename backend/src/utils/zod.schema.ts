import { Role } from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Updated schema to match prisma/schema.prisma
export const wasteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    weight: z.number().positive("Weight must be a positive number"),
    categoryId: z.string().uuid("Invalid category ID"),
    imageUrl: z.string().url("Invalid URL format").optional(),
});
