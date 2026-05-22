import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const jobs = await prisma.job.findMany({
    include: { employer: true, applications: true }
  });
  console.log("All Jobs details:");
  console.log(jobs.map(j => ({
    id: j.id,
    title: j.title,
    employerId: j.employerId,
    employerUsername: j.employer?.username,
    applicantsCount: j.applications.length
  })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
