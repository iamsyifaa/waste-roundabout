import { Role } from '@prisma/client';
import { z } from 'zod';

// --- Auth Schemas ---

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.nativeEnum(Role),
}).strict();

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
}).strict();

// --- Waste Schemas ---

export const wasteSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  weight: z.number().positive('Berat harus lebih dari 0'),
  categoryId: z.string().uuid('Format category ID tidak valid'),
  imageUrl: z.string().url('Format URL tidak valid').optional(),
}).strict();

export const updateWasteSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi').optional(),
  description: z.string().min(1, 'Deskripsi wajib diisi').optional(),
  weight: z.number().positive('Berat harus lebih dari 0').optional(),
  categoryId: z.string().uuid('Format category ID tidak valid').optional(),
  imageUrl: z.string().url('Format URL tidak valid').optional().nullable(),
}).strict();

// --- Transaction Schemas ---

export const createTransactionSchema = z.object({
  waste_post_id: z.string().uuid('Format waste post ID tidak valid'),
}).strict();

// --- Query Schemas ---

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'weight_asc', 'weight_desc']).default('newest'),
  categoryId: z.string().uuid().optional(),
  farmerId: z.string().uuid().optional(),
});

// --- AI Schema ---

export const aiClassifySchema = z.object({
  description: z.string().min(10, 'Deskripsi limbah minimal 10 karakter'),
  imageUrl: z.string().url('Format URL tidak valid').optional(),
}).strict();
