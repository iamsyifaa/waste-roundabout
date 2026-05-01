import { WastePostStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { wasteSchema, updateWasteSchema, paginationSchema } from '../utils/zod.schema';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

/**
 * Creates a new waste post.
 * Only FARMER role is allowed.
 */
export const createWastePost = async (userId: string, userRole: string, data: unknown) => {
  if (userRole !== Role.FARMER) {
    throw new ForbiddenError('Hanya Farmer yang bisa posting limbah.');
  }

  const validated = wasteSchema.parse(data);

  // Verify category exists
  const category = await prisma.wasteCategory.findUnique({ where: { id: validated.categoryId } });
  if (!category) {
    throw new NotFoundError('Kategori limbah');
  }

  const newPost = await prisma.wastePost.create({
    data: {
      ...validated,
      postedById: userId,
      status: WastePostStatus.AVAILABLE,
    },
    include: { category: true },
  });

  return newPost;
};

/**
 * Gets all waste posts with pagination, search, sort, and filter.
 */
export const getAllWastePosts = async (query: unknown) => {
  const { page, limit, search, sort, categoryId } = paginationSchema.parse(query);

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: WastePostStatus.AVAILABLE,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  const orderByMap: Record<string, any> = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    weight_asc: { weight: 'asc' },
    weight_desc: { weight: 'desc' },
  };
  const orderBy = orderByMap[sort] || { createdAt: 'desc' };

  const [wastes, total] = await Promise.all([
    prisma.wastePost.findMany({
      where,
      include: {
        category: true,
        postedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.wastePost.count({ where }),
  ]);

  return {
    data: wastes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Gets a single waste post by ID.
 */
export const getWastePostById = async (id: string) => {
  const wastePost = await prisma.wastePost.findUnique({
    where: { id },
    include: {
      category: true,
      postedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!wastePost) {
    throw new NotFoundError('Postingan limbah');
  }

  return wastePost;
};

/**
 * Updates a waste post. Only the owning FARMER can update it.
 */
export const updateWastePost = async (userId: string, postId: string, data: unknown) => {
  const validated = updateWasteSchema.parse(data);

  const post = await prisma.wastePost.findUnique({ where: { id: postId } });
  if (!post) {
    throw new NotFoundError('Postingan limbah');
  }

  if (post.postedById !== userId) {
    throw new ForbiddenError('Anda hanya bisa mengedit postingan milik Anda sendiri.');
  }

  if (post.status !== WastePostStatus.AVAILABLE) {
    throw new BadRequestError('Hanya postingan berstatus AVAILABLE yang bisa diedit.');
  }

  // If categoryId is being updated, verify it exists
  if (validated.categoryId) {
    const category = await prisma.wasteCategory.findUnique({ where: { id: validated.categoryId } });
    if (!category) {
      throw new NotFoundError('Kategori limbah');
    }
  }

  const updated = await prisma.wastePost.update({
    where: { id: postId },
    data: validated,
    include: { category: true },
  });

  return updated;
};

/**
 * Deletes a waste post. Only the owning FARMER can delete it, and only if AVAILABLE.
 */
export const deleteWastePost = async (userId: string, postId: string) => {
  const post = await prisma.wastePost.findUnique({ where: { id: postId } });
  if (!post) {
    throw new NotFoundError('Postingan limbah');
  }

  if (post.postedById !== userId) {
    throw new ForbiddenError('Anda hanya bisa menghapus postingan milik Anda sendiri.');
  }

  if (post.status !== WastePostStatus.AVAILABLE) {
    throw new BadRequestError('Hanya postingan berstatus AVAILABLE yang bisa dihapus.');
  }

  await prisma.wastePost.delete({ where: { id: postId } });
  return { message: 'Postingan limbah berhasil dihapus.' };
};

/**
 * Gets all waste categories.
 */
export const getCategories = async () => {
  return prisma.wasteCategory.findMany({
    orderBy: { name: 'asc' },
  });
};
