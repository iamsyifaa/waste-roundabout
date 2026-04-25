import { Request, Response } from 'express';
import { PrismaClient, Role, WastePostStatus } from '@prisma/client';
import { wasteSchema } from '../utils/zod.schema';

const prisma = new PrismaClient();

// Corrected the role to FARMER as per your schema
const FARMER_ROLE = Role.FARMER;

export const createWaste = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== FARMER_ROLE) {
      return res
        .status(403)
        .json({ message: `Forbidden: Only ${FARMER_ROLE}s can create waste entries.` });
    }

    const validation = wasteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { title, description, weight, categoryId, imageUrl } = validation.data;

    const wastePost = await prisma.wastePost.create({
      data: {
        title,
        description,
        weight,
        imageUrl,
        postedBy: {
          connect: { id: req.user.id },
        },
        category: {
          connect: { id: categoryId },
        },
        // The status defaults to AVAILABLE from the schema
      },
    });

    res.status(201).json(wastePost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllWastes = async (_req: Request, res: Response) => {
  try {
    const wastes = await prisma.wastePost.findMany({
      // Corrected the where clause to use the status enum
      where: { status: WastePostStatus.AVAILABLE },
      include: {
        category: true,
        // Corrected the relation name from 'farmer' to 'postedBy'
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    res.status(200).json(wastes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.wasteCategory.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
