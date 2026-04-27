import { Request, Response } from 'express';
import { PrismaClient, Role, WastePostStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createWaste = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.FARMER) {
    return res.status(403).json({ message: 'Hanya Farmer yang bisa posting limbah.' });
  }

  const { title, description, weight, categoryId, imageUrl } = req.body;

  if (weight <= 0) {
    return res.status(400).json({ message: 'Berat limbah harus lebih dari 0 kg.' });
  }

  try {
    const newPost = await prisma.wastePost.create({
      data: {
        title,
        description,
        weight,
        imageUrl,
        categoryId,
        postedById: req.user.id,
        status: WastePostStatus.AVAILABLE,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat postingan limbah.' });
  }
};

export const getAllWastes = async (req: Request, res: Response) => {
  const { categoryId, lat, long } = req.query;

  const where: any = {
    status: WastePostStatus.AVAILABLE,
  };

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  // Note: Proximity filtering with lat/long requires a more advanced setup
  // with geospatial database features (e.g., PostGIS) and raw SQL queries.
  // This is a basic implementation for filtering by categoryId.

  try {
    const wastes = await prisma.wastePost.findMany({
      where,
      include: { category: true, postedBy: { select: { name: true, email: true } } },
    });
    res.status(200).json(wastes);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.wasteCategory.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil kategori.' });
  }
};
