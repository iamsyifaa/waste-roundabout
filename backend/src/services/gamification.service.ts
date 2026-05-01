import { prisma } from '../utils/prisma';

// Force TS Server reload

/**
 * Checks and awards badges to a user after a transaction is completed.
 * Badges logic:
 * - FIRST_SALE: Awarded on the first completed transaction.
 * - ECO_WARRIOR: Awarded after 10 completed transactions.
 * - CLUB_100KG: Awarded when total waste sold reaches 100kg.
 */
export const checkAndAwardBadges = async (userId: string) => {
  const [userTxCount, userTotalWeightResult, existingBadges] = await Promise.all([
    prisma.transaction.count({
      where: { wastePost: { postedById: userId }, status: 'COMPLETED' },
    }),
    prisma.wastePost.aggregate({
      _sum: { weight: true },
      where: { postedById: userId, status: 'SOLD' },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { code: true } } },
    }),
  ]);

  const totalWeight = userTotalWeightResult._sum.weight || 0;
  const userBadgeCodes = existingBadges.map((ub) => ub.badge.code);
  const newlyAwardedBadges: string[] = [];

  const allBadges = await prisma.badge.findMany();
  const badgeMap = allBadges.reduce((acc, badge) => {
    acc[badge.code] = badge.id;
    return acc;
  }, {} as Record<string, string>);

  const awardBadge = async (code: string) => {
    if (!userBadgeCodes.includes(code) && badgeMap[code]) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badgeMap[code] },
      });
      newlyAwardedBadges.push(code);
    }
  };

  // Logic for badges
  if (userTxCount >= 1) {
    await awardBadge('FIRST_SALE');
  }
  if (userTxCount >= 10) {
    await awardBadge('ECO_WARRIOR');
  }
  if (totalWeight >= 100) {
    await awardBadge('CLUB_100KG');
  }

  return newlyAwardedBadges;
};
