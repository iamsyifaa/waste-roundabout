import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Sekam Padi' },
    { name: 'Kulit Kopi' },
    { name: 'Jerami' },
    { name: 'Batang Jagung' },
    { name: 'Kulit Kakao' },
  ];

  for (const category of categories) {
    await prisma.wasteCategory.create({
      data: category,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
