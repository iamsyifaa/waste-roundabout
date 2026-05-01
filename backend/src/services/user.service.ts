import { prisma } from '../utils/prisma';
import { NotFoundError } from '../utils/errors';

/**
 * Gets the profile of the currently logged-in user.
 * Includes points, total transactions, and recent point logs.
 */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      points: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          wastePosts: true,
          transactions: true,
          pointLogs: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

/**
 * Gets the leaderboard — top Farmers ranked by points.
 */
export const getLeaderboard = async (limit: number = 10) => {
  const topFarmers = await prisma.user.findMany({
    where: { role: 'FARMER' },
    select: {
      id: true,
      name: true,
      points: true,
      _count: {
        select: {
          wastePosts: true,
        },
      },
    },
    orderBy: { points: 'desc' },
    take: limit,
  });

  return topFarmers.map((farmer, index) => ({
    rank: index + 1,
    ...farmer,
  }));
};

/**
 * Gets dashboard statistics.
 */
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalFarmers,
    totalCollectors,
    totalWastePosts,
    totalTransactions,
    completedTransactions,
    totalWasteWeight,
    categoryStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'FARMER' } }),
    prisma.user.count({ where: { role: 'COLLECTOR' } }),
    prisma.wastePost.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.wastePost.aggregate({ _sum: { weight: true } }),
    prisma.wasteCategory.findMany({
      select: {
        id: true,
        name: true,
        basePricePerKg: true,
        _count: { select: { wastePosts: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      farmers: totalFarmers,
      collectors: totalCollectors,
    },
    wastePosts: {
      total: totalWastePosts,
      totalWeightKg: totalWasteWeight._sum.weight || 0,
    },
    transactions: {
      total: totalTransactions,
      completed: completedTransactions,
    },
    categories: categoryStats,
  };
};
