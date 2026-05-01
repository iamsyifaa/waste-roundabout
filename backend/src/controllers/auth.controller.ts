import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../utils/zod.schema';
import { prisma } from '../utils/prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    if (role === Role.ADMIN) {
      return res.status(403).json({ error: 'Cannot register as ADMIN' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};
