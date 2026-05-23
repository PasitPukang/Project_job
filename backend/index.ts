// ===================================================
// 🚀 หางาน.com — Backend API Server
// ===================================================
// ไฟล์นี้คือจุดเริ่มต้นของ Server ฝั่งหลังบ้าน
// ทำหน้าที่รับ-ส่งข้อมูลระหว่าง Frontend (React) กับ Database (PostgreSQL)
//
// 📌 คำอธิบายแบบง่าย:
// - Express   = ตัวจัดการเส้นทาง (Routes) รับ Request จาก Frontend
// - Prisma    = ตัวช่วยคุยกับ Database แทนการเขียน SQL ดิบ
// - CORS      = อนุญาตให้ Frontend (port 5173) เรียก API (port 5000) ข้ามพอร์ตได้
// ===================================================

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// สร้างตัวแปรหลักของแอป
const app = express();           // สร้าง Express app

// สร้าง Prisma Client ด้วย PG Adapter (Prisma 7 style)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const PORT = 5000;                // กำหนดพอร์ตที่ Server จะรัน

// --- JWT Utilities (0-dependency token signature) ---
const JWT_SECRET = process.env.JWT_SECRET || 'jobportal_super_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

function signToken(payload: { id: number; username: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { id: number; username: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSig) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

// --- Auth Middlewares ---
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'ไม่พบ Token ยืนยันตัวตน' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    return;
  }

  req.user = decoded;
  next();
};

const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้' });
      return;
    }
    next();
  };
};

// --- Middleware (ตัวช่วยที่ทำงานก่อนทุก Request) ---
app.use(express.json());  // ให้ Express อ่านข้อมูล JSON จาก body ได้
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));           // เปิดให้เฉพาะ Frontend ยิง API เข้ามาได้


// ===================================================
// 📡 API ROUTES (เส้นทาง API ที่ Frontend จะเรียกใช้)
// ===================================================

// --------------------------------------------------
// 1️⃣ GET /api/jobs — ดึงข้อมูลงานทั้งหมด
// --------------------------------------------------
// Frontend จะเรียก API นี้เพื่อแสดงรายการงานในหน้า Dashboard และ History
// เรียงลำดับจากใหม่ไปเก่า (ด้วย orderBy: createdAt: 'desc')
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { employer: true },
      orderBy: { createdAt: 'desc' }  // เรียงจากใหม่สุด
    });
    res.json(jobs);
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน' });
  }
});

// --------------------------------------------------
// 2️⃣ GET /api/jobs/:id — ดึงข้อมูลงานตาม ID
// --------------------------------------------------
// ใช้เมื่อต้องการดูรายละเอียดของงานใดงานหนึ่ง
app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: { employer: true }
    });
    if (!job) {
      res.status(404).json({ error: 'ไม่พบข้อมูลงานนี้' });
      return;
    }
    res.json(job);
  } catch (error) {
    console.error('❌ Error fetching job:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// --------------------------------------------------
// 3️⃣ POST /api/jobs — สร้างประกาศงานใหม่ (เฉพาะนายจ้าง)
// --------------------------------------------------
app.post('/api/jobs', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, location, department, workType, description, requirements, salaryMin, salaryMax, status } = req.body;
    
    // ตรวจสอบข้อมูลนำเข้าเบื้องต้น (Input Validation)
    if (!title || !category || !location || !description) {
      res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อตำแหน่งงาน, หมวดหมู่, สถานที่, รายละเอียดงาน)' });
      return;
    }

    const newJob = await prisma.job.create({
      data: {
        title: String(title).trim(),
        category: String(category).trim(),
        location: String(location).trim(),
        department: department ? String(department).trim() : '',
        workType: workType ? String(workType).trim() : 'On-site',
        description: String(description).trim(),
        requirements: requirements ? String(requirements).trim() : '',
        salaryMin: salaryMin ? Number(salaryMin) : 0,
        salaryMax: salaryMax ? Number(salaryMax) : 0,
        status: status ? String(status).trim() : 'Draft',
        employerId: req.user!.id // ผูกกับผู้ใช้ที่ล็อกอินอยู่จาก token
      }
    });

    console.log(`✅ สร้างงานสำเร็จ: ${newJob.title}`);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างงาน' });
  }
});

// --------------------------------------------------
// 3.5️⃣ GET /api/jobs/employer/:employerId — ดึงงานของนายจ้างคนนี้
// --------------------------------------------------
app.get('/api/jobs/employer/:employerId', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { employerId } = req.params;
    
    // ป้องกันนายจ้างดึงข้อมูลของผู้อื่น
    if (Number(employerId) !== req.user!.id) {
      res.status(403).json({ error: 'ไม่มีสิทธิ์ดึงข้อมูลของผู้ประกอบการรายอื่น' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { employerId: Number(employerId) },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('❌ Error fetching employer jobs:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประกาศงาน' });
  }
});

// --------------------------------------------------
// 4️⃣ PUT /api/jobs/:id — อัปเดตข้อมูลงาน (Mass Assignment Prevention + Auth)
// --------------------------------------------------
// ใช้เมื่อต้องการแก้ไขรายละเอียดงาน หรือเปลี่ยนสถานะ (เช่น Draft → Active)
app.put('/api/jobs/:id', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // ค้นหางานเพื่อเช็คว่ามีอยู่จริงและเป็นของนายจ้างท่านนี้หรือไม่
    const existingJob = await prisma.job.findUnique({
      where: { id: Number(id) }
    });
    if (!existingJob) {
      res.status(404).json({ error: 'ไม่พบข้อมูลประกาศงานนี้' });
      return;
    }
    if (existingJob.employerId !== req.user!.id) {
      res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขประกาศงานนี้' });
      return;
    }

    // Mass Assignment Prevention: เลือกรับเฉพาะฟิลด์ที่กำหนด
    const { title, category, location, department, workType, description, requirements, salaryMin, salaryMax, status } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (location !== undefined) updateData.location = String(location).trim();
    if (department !== undefined) updateData.department = String(department).trim();
    if (workType !== undefined) updateData.workType = String(workType).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (requirements !== undefined) updateData.requirements = String(requirements).trim();
    if (salaryMin !== undefined) updateData.salaryMin = Number(salaryMin);
    if (salaryMax !== undefined) updateData.salaryMax = Number(salaryMax);
    if (status !== undefined) updateData.status = String(status).trim();

    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: updateData
    });

    console.log(`✅ อัปเดตงานสำเร็จ: ${updatedJob.title}`);
    res.json(updatedJob);
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตงาน' });
  }
});

// --------------------------------------------------
// 5️⃣ DELETE /api/jobs/:id — ลบงาน (Auth + Ownership Check)
// --------------------------------------------------
app.delete('/api/jobs/:id', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบความมีอยู่ของงานและความเป็นเจ้าของ
    const existingJob = await prisma.job.findUnique({
      where: { id: Number(id) }
    });
    if (!existingJob) {
      res.status(404).json({ error: 'ไม่พบข้อมูลงานนี้' });
      return;
    }
    if (existingJob.employerId !== req.user!.id) {
      res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบประกาศงานนี้' });
      return;
    }

    // ลบใบสมัครที่ผูกกับงานนี้ก่อนเพื่อป้องกัน Foreign Key Constraint Error
    await prisma.application.deleteMany({
      where: { jobId: Number(id) }
    });

    await prisma.job.delete({
      where: { id: Number(id) }
    });
    console.log(`🗑️ ลบงาน ID: ${id} สำเร็จ`);
    res.json({ message: 'ลบงานสำเร็จ' });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบงาน' });
  }
});

// --------------------------------------------------
// 7️⃣ GET /api/applications/job/:jobId — ดึงข้อมูลผู้สมัครตามงาน (เฉพาะนายจ้างที่เป็นเจ้าของงาน)
// --------------------------------------------------
app.get('/api/applications/job/:jobId', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) }
    });
    if (!job) {
      res.status(404).json({ error: 'ไม่พบข้อมูลประกาศงานนี้' });
      return;
    }
    if (job.employerId !== req.user!.id) {
      res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงรายชื่อผู้สมัครงานนี้' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId: Number(jobId) },
      include: {
        user: {
          select: { 
            name: true, 
            email: true,
            resume: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้สมัคร' });
  }
});

// --------------------------------------------------
// 7.5️⃣ POST /api/applications — สมัครงาน (เฉพาะผู้สมัครงาน + ป้องกัน User Spoofing)
// --------------------------------------------------
app.post('/api/applications', authMiddleware, requireRole('seeker'), async (req: AuthRequest, res: Response) => {
  try {
    console.log("POST /api/applications BODY:", req.body);
    const { jobId, resumeUrl } = req.body;
    const userId = req.user!.id; // ใช้ User ID จาก JWT Token เสมอ เพื่อความปลอดภัย

    if (!jobId) {
      res.status(400).json({ error: 'กรุณาระบุ Job ID' });
      return;
    }

    // ตรวจสอบว่าผู้ใช้เคยสมัครงานนี้หรือยัง
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: Number(jobId),
        userId: Number(userId)
      }
    });

    if (existingApplication) {
      res.status(400).json({ error: 'คุณเคยสมัครงานนี้ไปแล้ว' });
      return;
    }

    const application = await prisma.application.create({
      data: {
        jobId: Number(jobId),
        userId: Number(userId),
        resumeUrl: resumeUrl || '',
        status: 'Pending'
      }
    });

    // อัปเดตจำนวนผู้สมัครใน Job Table
    await prisma.job.update({
      where: { id: Number(jobId) },
      data: { applicants: { increment: 1 } }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งใบสมัคร' });
  }
});

// --------------------------------------------------
// 7.6️⃣ PATCH /api/applications/:id/status — อัปเดตสถานะผู้สมัคร (เฉพาะนายจ้างที่เป็นเจ้าของ)
// --------------------------------------------------
app.patch('/api/applications/:id/status', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'กรุณาระบุสถานะ' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { job: true }
    });
    
    if (!application) {
      res.status(404).json({ error: 'ไม่พบประวัติการสมัครงานนี้' });
      return;
    }
    
    if (application.job.employerId !== req.user!.id) {
      res.status(403).json({ error: 'คุณไม่มีสิทธิ์เปลี่ยนสถานะใบสมัครงานนี้' });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: Number(id) },
      data: { status }
    });

    // อัปเดตสถิตินัดสัมภาษณ์ในตาราง Job หากปรับสถานะเป็น Interview
    if (status === 'Interview' && application.status !== 'Interview') {
      await prisma.job.update({
        where: { id: application.jobId },
        data: { interviews: { increment: 1 } }
      });
    }

    res.json(updatedApplication);
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะผู้สมัคร' });
  }
});

// --------------------------------------------------
// 7.7️⃣5️⃣ GET /api/applications/seeker — ดึงประวัติการสมัครงานทั้งหมดของผู้สมัครที่ล็อกอินอยู่
// --------------------------------------------------
app.get('/api/applications/seeker', authMiddleware, requireRole('seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const applications = await prisma.application.findMany({
      where: { userId: Number(userId) },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                company: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    console.error('❌ Error fetching seeker applications:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการสมัครงาน' });
  }
});

// --------------------------------------------------
// 7.8️⃣ GET /api/resumes/user/:userId — ดึงข้อมูลเรซูเม่ของผู้สมัคร (อนุญาตเฉพาะเจ้าของ หรือ นายจ้าง)
// --------------------------------------------------
app.get('/api/resumes/user/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user!.role !== 'employer' && Number(userId) !== req.user!.id) {
      res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงประวัติเรซูเม่นี้' });
      return;
    }

    const resume = await prisma.resume.findUnique({
      where: { userId: Number(userId) }
    });
    
    if (!resume) {
      res.status(404).json({ error: 'ยังไม่มีข้อมูลเรซูเม่' });
      return;
    }
    
    res.json(resume);
  } catch (error) {
    console.error('❌ Error fetching resume:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเรซูเม่' });
  }
});

// --------------------------------------------------
// 7.9️⃣ POST /api/resumes — สร้างหรืออัปเดตเรซูเม่ (เฉพาะผู้สมัครงาน + ป้องกัน User Spoofing)
// --------------------------------------------------
app.post('/api/resumes', authMiddleware, requireRole('seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id; // ป้องกันการสร้างเรซูเม่แทนผู้อื่น
    const {
      fullName,
      targetedJobTitle,
      aboutMe,
      photoUrl,
      phone,
      address,
      email,
      linkedin,
      github,
      experiences,
      educations,
      skills,
      languages
    } = req.body;

    // ข้อมูลติดต่อและฟิลด์ที่จำเป็น (Input Validation)
    if (!fullName || !targetedJobTitle || !phone || !email || !address) {
      res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อจริง, ตำแหน่งงานที่ต้องการ, เบอร์โทร, อีเมล, ที่อยู่)' });
      return;
    }

    if (!email.includes('@')) {
      res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }

    const resumeData = {
      fullName: String(fullName).trim(),
      targetedJobTitle: String(targetedJobTitle).trim(),
      aboutMe: aboutMe ? String(aboutMe).trim() : '',
      photoUrl: photoUrl ? String(photoUrl).trim() : '',
      phone: String(phone).trim(),
      address: String(address).trim(),
      email: String(email).trim(),
      linkedin: linkedin ? String(linkedin).trim() : '',
      github: github ? String(github).trim() : '',
      experiences: experiences || [],
      educations: educations || [],
      skills: skills || { technical: [], soft: [] },
      languages: languages || []
    };

    // อัปเดตถ้ามีอยู่แล้ว หรือสร้างใหม่ถ้ายังไม่มี (upsert)
    const resume = await prisma.resume.upsert({
      where: { userId: Number(userId) },
      update: resumeData,
      create: {
        userId: Number(userId),
        ...resumeData
      }
    });

    // อัปเดตชื่อในตาราง User ด้วยให้ตรงกับเรซูเม่
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { name: fullName }
    });

    console.log(`✅ บันทึกเรซูเม่สำเร็จสำหรับ User ID: ${userId}`);
    res.status(200).json(resume);
  } catch (error) {
    console.error('❌ Error saving resume:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกเรซูเม่' });
  }
});

// --------------------------------------------------
// 7.7️⃣ GET /api/company/:id — ดึงข้อมูลบริษัทและประกาศงาน
// --------------------------------------------------
app.get('/api/company/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { jobs: { orderBy: { createdAt: 'desc' } } }
    });

    if (!company || company.role !== 'employer') {
      res.status(404).json({ error: 'ไม่พบข้อมูลบริษัท' });
      return;
    }
    
    // ไม่ส่งรหัสผ่านกลับไป
    const { password, ...companyData } = company;
    res.json(companyData);
  } catch (error) {
    console.error('❌ Error fetching company details:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท' });
  }
});

// --------------------------------------------------
// 8️⃣ GET /api/dashboard/stats/:employerId — ดึงสถิติสำหรับ Dashboard (เฉพาะเจ้าของแดชบอร์ด)
// --------------------------------------------------
app.get('/api/dashboard/stats/:employerId', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { employerId } = req.params;
    
    if (Number(employerId) !== req.user!.id) {
      res.status(403).json({ error: 'ไม่มีสิทธิ์ดึงข้อมูลสถิติของผู้อื่น' });
      return;
    }

    // นับจำนวนงานที่สถานะ Active
    const activeJobs = await prisma.job.count({ 
      where: { 
        status: 'Active',
        employerId: Number(employerId)
      } 
    });

    // ดึงงานทั้งหมดของผู้ประกอบการนี้
    const jobs = await prisma.job.findMany({
      where: { employerId: Number(employerId) },
      include: {
        applications: true
      }
    });

    let totalApplicants = 0;
    jobs.forEach(job => {
      totalApplicants += job.applications.length;
    });

    const totalInterviews = await prisma.job.aggregate({
      where: { employerId: Number(employerId) },
      _sum: { interviews: true }
    });

    res.json({
      activeJobs,
      totalApplicants,
      totalInterviews: totalInterviews._sum.interviews || 0,
      unreadMessages: 3  // จำลองข้อมูลไว้
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// --------------------------------------------------
// 9️⃣ GET /api/notifications/count/:employerId — นับใบสมัครใหม่ (Pending) ทั้งหมดของนายจ้าง
// --------------------------------------------------
// ใช้สำหรับแสดง Badge จำนวนในแถบนำทาง (Navbar) เพื่อแจ้งให้นายจ้างทราบ
app.get('/api/notifications/count/:employerId', authMiddleware, requireRole('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { employerId } = req.params;

    // ป้องกันการดึงข้อมูลของนายจ้างรายอื่น
    if (Number(employerId) !== req.user!.id) {
      res.status(403).json({ error: 'ไม่มีสิทธิ์ดึงข้อมูลของผู้ประกอบการรายอื่น' });
      return;
    }

    // นับใบสมัครที่สถานะ Pending ในงานทั้งหมดของนายจ้างคนนี้
    const pendingCount = await prisma.application.count({
      where: {
        status: 'Pending',
        job: {
          employerId: Number(employerId)
        }
      }
    });

    res.json({ pendingCount });
  } catch (error) {
    console.error('❌ Error fetching notification count:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล notification' });
  }
});

// ===================================================
// 🔐 AUTH ROUTES (จัดการล็อกอิน/สมัครสมาชิก)
// ===================================================

// สมัครสมาชิก (พร้อมระบบ Validate ข้อมูลและแนบ JWT Token)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, password, email, name, role, company } = req.body;

  try {
    // 1. ตรวจสอบข้อมูลนำเข้าเบื้องต้น (Input Validation)
    if (!username || !password || !email) {
      res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้งาน รหัสผ่าน และอีเมล' });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    if (!email.includes('@')) {
      res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
      res.status(400).json({ error: 'ชื่อผู้ใช้งานหรืออีเมลนี้มีในระบบแล้ว' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name: name || "",
        role: role || "seeker",
        company: company || ""
      }
    });

    // สร้าง JWT Token หลังสมัครสมาชิกสำเร็จทันที
    const token = signToken({ id: user.id, username: user.username, role: user.role });

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        company: user.company,
        token // ส่งกลับไปเพื่อให้ frontend จัดเก็บใน localStorage
      }
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// เข้าสู่ระบบ (พร้อมระบบ Validate และออก JWT Token)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    if (!user.password) {
      res.status(401).json({ error: 'กรุณาเข้าสู่ระบบด้วย Google' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    // สร้าง JWT Token หลังเข้าสู่ระบบสำเร็จ
    const token = signToken({ id: user.id, username: user.username, role: user.role });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        company: user.company,
        token
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// เข้าสู่ระบบด้วย Google (พร้อมระบบออก JWT Token)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { accessToken, role } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'Access token is required' });
      return;
    }

    // ขอข้อมูลผู้ใช้จาก Google API ด้วย accessToken
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!googleResponse.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const googleUser: any = await googleResponse.json();
    const { email, name } = googleUser;

    // ตรวจสอบว่ามีผู้ใช้นี้ในระบบหรือยัง
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // ถ้ายังไม่มี ให้สร้างใหม่โดยไม่มี password
      user = await prisma.user.create({
        data: {
          username: email.split('@')[0] + Math.floor(Math.random() * 1000), // สร้าง username อัตโนมัติจาก email
          email,
          name: name || '',
          role: role || 'seeker',
          authProvider: 'google',
          company: '' // สำหรับ employer จะว่างไว้ก่อน
        }
      });
    }

    // สร้าง JWT Token
    const token = signToken({ id: user.id, username: user.username, role: user.role });

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        company: user.company,
        token
      }
    });
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// --------------------------------------------------
// 🛡️ PUT /api/users/profile — อัปเดตข้อมูลผู้ใช้งาน (อีเมล, ชื่อ, รหัสผ่าน)
// --------------------------------------------------
app.put('/api/users/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, username, password } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !email) {
      res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้งานและอีเมล' });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
      return;
    }

    if (!email.includes('@')) {
      res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }

    // เช็คว่า username หรือ email ซ้ำกับผู้อื่นหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'ชื่อผู้ใช้งานหรืออีเมลนี้ถูกใช้งานโดยผู้อื่นแล้ว' });
      return;
    }

    // เตรียมข้อมูลอัปเดต
    const updateData: any = {
      username: username.trim(),
      email: email.trim(),
      name: name ? name.trim() : ""
    };

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
        return;
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // อัปเดตตาราง User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // หากเป็น Seeker อัปเดต fullName และ email ในตาราง Resume ด้วยถ้ามีข้อมูลอยู่แล้ว
    if (updatedUser.role === 'seeker') {
      const resumeExists = await prisma.resume.findUnique({
        where: { userId }
      });
      if (resumeExists) {
        await prisma.resume.update({
          where: { userId },
          data: {
            fullName: updatedUser.name,
            email: updatedUser.email
          }
        });
      }
    }

    // สร้าง JWT Token ใหม่เผื่อว่าข้อมูลสำคัญเปลี่ยน
    const token = signToken({ id: updatedUser.id, username: updatedUser.username, role: updatedUser.role });

    res.json({
      message: 'อัปเดตข้อมูลสำเร็จ',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        email: updatedUser.email,
        name: updatedUser.name,
        company: updatedUser.company,
        token
      }
    });
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน' });
  }
});

// ===================================================
// 🛡️ GLOBAL ERROR HANDLING MIDDLEWARE
// ===================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global Error handler caught:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'เกิดข้อผิดพลาดภายในระบบ'
  });
});

// ===================================================
// 🟢 เริ่มรัน Server!
// ===================================================
app.listen(PORT, () => {
  console.log('');
  console.log('===================================');
  console.log(`🚀 หางาน.com Backend Server`);
  console.log(`📡 API พร้อมใช้งานที่: http://localhost:${PORT}`);
  console.log(`📋 ดูรายการงาน: http://localhost:${PORT}/api/jobs`);
  console.log(`📊 ดูสถิติ:     http://localhost:${PORT}/api/dashboard/stats`);
  console.log('===================================');
  console.log('');
});
