import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { registerSchema, loginSchema } from '../utils/zod.schema';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../utils/errors';

const SALT_ROUNDS = 10;

/**
 * Registers a new user.
 * Validates input, hashes password, and creates the user in the database.
 */
export const registerUser = async (data: unknown) => {
  const { name, email, password, role } = registerSchema.parse(data);

  // ADMIN registration is forbidden via API
  if (role === Role.ADMIN) {
    throw new ForbiddenError('Registrasi sebagai ADMIN tidak diizinkan.');
  }

  // Check if email already exists (prevents Prisma P2002 with a clearer message)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Email sudah terdaftar.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Authenticates a user and returns a JWT token.
 */
export const loginUser = async (data: unknown) => {
  const { email, password } = loginSchema.parse(data);

  const user = await prisma.user.findUnique({ where: { email } });

  // Use same generic message for both "user not found" and "wrong password"
  // to prevent user enumeration attacks
  if (!user) {
    throw new UnauthorizedError('Email atau password salah.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Email atau password salah.');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
