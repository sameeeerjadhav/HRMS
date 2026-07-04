const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: 'postgresql://postgres:Sameer%4030020101@localhost:5432/hrms_portal' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const depts = [
    { name: 'Engineering', description: 'Software Development & Engineering' },
    { name: 'Human Resources', description: 'HR & Talent Acquisition' },
    { name: 'Finance', description: 'Finance & Accounting' },
    { name: 'Marketing', description: 'Marketing & PR' },
    { name: 'Sales', description: 'Sales & Business Development' },
    { name: 'Operations', description: 'Operations & Logistics' }
  ];

  for (const dept of depts) {
    await prisma.departments.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name }
    });
  }

  console.log('Seeded departments successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
