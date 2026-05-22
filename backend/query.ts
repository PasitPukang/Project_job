import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  const jobs = await prisma.job.findMany({ include: { employer: true } });
  const resumes = await prisma.resume.findMany();
  const applications = await prisma.application.findMany();

  console.log("=== USERS ===");
  console.log(users.map(u => ({ id: u.id, username: u.username, role: u.role, company: u.company })));

  console.log("=== JOBS ===");
  console.log(jobs.map(j => ({ id: j.id, title: j.title, salaryMin: j.salaryMin, salaryMax: j.salaryMax, employer: j.employer?.company })));

  console.log("=== RESUMES ===");
  console.log(resumes.map(r => ({ id: r.id, userId: r.userId, fullName: r.fullName })));

  console.log("=== APPLICATIONS ===");
  console.log(applications.map(a => ({ id: a.id, userId: a.userId, jobId: a.jobId, status: a.status })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
