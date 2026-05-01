import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Seed Categories with Prices
  const categories = [
    { name: 'Sekam Padi', description: 'Cocok untuk pakan ternak atau media tanam.', basePricePerKg: 1500 },
    { name: 'Kulit Kopi', description: 'Bagus untuk pupuk organik kompos.', basePricePerKg: 2000 },
    { name: 'Jerami', description: 'Sering digunakan untuk alas ternak atau mulsa.', basePricePerKg: 1000 },
    { name: 'Batang Jagung', description: 'Dapat diolah menjadi pakan ternak ruminansia.', basePricePerKg: 1200 },
    { name: 'Kulit Kakao', description: 'Kaya nutrisi untuk campuran pakan ternak.', basePricePerKg: 2500 },
  ];

  for (const category of categories) {
    await prisma.wasteCategory.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        basePricePerKg: category.basePricePerKg,
      },
      create: category,
    });
  }
  console.log('✅ Categories seeded');

  // 2. Seed Badges
  const badges = [
    { code: 'FIRST_SALE', name: 'Pecah Telor!', description: 'Berhasil menyelesaikan transaksi pertama.', icon: '🥚' },
    { code: 'ECO_WARRIOR', name: 'Eco Warrior', description: 'Berhasil menyelesaikan 10 transaksi.', icon: '🦸‍♂️' },
    { code: 'CLUB_100KG', name: '100kg Club', description: 'Berhasil menjual total 100kg limbah.', icon: '💯' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      },
      create: badge,
    });
  }
  console.log('✅ Badges seeded');

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
