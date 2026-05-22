# 🏗️ PROJECT_CONTEXT.md — หางาน.com Job Portal

> **⚠️ AI Agent: อ่านไฟล์นี้ก่อนทุกครั้ง เพื่อประหยัด Token และไม่ต้องถามซ้ำ**

---

## 1. ภาพรวมโปรเจกต์

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ** | หางาน.com Job Portal |
| **วัตถุประสงค์** | เว็บหางานสำหรับผู้สมัครงาน (Seeker) และนายจ้าง (Employer) |
| **GitHub** | https://github.com/PasitPukang/Project_job |
| **Branch หลัก** | `main` = stable, `develop` = พัฒนา, `backup/initial-release` = backup ฉุกเฉิน |

---

## 2. Tech Stack

### Frontend (Port 5173)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (utility classes)
- **Router:** React Router DOM v6
- **Icons:** Lucide React
- **State:** React Context API (`LanguageContext`)
- **Auth Storage:** `localStorage` key = `"user"` (object มี `id, username, role, token, email, name, company`)

### Backend (Port 5000)
- **Runtime:** Node.js + TypeScript (`ts-node`)
- **Framework:** Express.js v5
- **ORM:** Prisma v7 + `@prisma/adapter-pg`
- **Database:** PostgreSQL (connection string ใน `backend/.env`)
- **Auth:** Custom JWT (Node.js `crypto` built-in — ไม่ใช้ `jsonwebtoken` library)
- **Password:** `bcryptjs`

### รัน Development Servers
```bash
# Backend
cd backend
npx ts-node index.ts

# Frontend (terminal อีกตัว)
cd d:\jobreserch
npm run dev
```

---

## 3. โครงสร้างโฟลเดอร์สำคัญ

```
d:\jobreserch\
├── backend/
│   ├── index.ts          ← API ทั้งหมดอยู่ที่นี่ (828 บรรทัด)
│   ├── prisma/schema.prisma
│   └── .env              ← DATABASE_URL, JWT_SECRET (ไม่อยู่ใน Git)
├── src/
│   ├── App.jsx           ← Routes ทั้งหมด + ProtectedRoute
│   ├── components/
│   │   ├── ProtectedRoute.jsx   ← Guard สำหรับ employer/seeker routes
│   │   ├── LanguageContext.jsx  ← TH/EN toggle context
│   │   └── layout/             ← Navbar, Footer, EmployerLayout
│   └── pages/
│       ├── Home.jsx
│       ├── Search.jsx           ← ค้นหางาน + Salary Filter
│       ├── JobDetails.jsx
│       ├── CompanyDetails.jsx
│       ├── ApplyWizard.jsx      ← กรอกใบสมัคร 3 ขั้นตอน
│       ├── LoginSeeker.jsx / LoginEmployer.jsx
│       ├── RegisterSeeker.jsx / RegisterEmployer.jsx
│       └── employer/
│           ├── Dashboard.jsx
│           ├── CreateJob.jsx
│           ├── History.jsx
│           ├── Applications.jsx ← ดูใบสมัคร + Resume Modal
│           └── Pricing.jsx
```

---

## 4. API Endpoints (backend/index.ts)

| Method | Path | Auth | หน้าที่ |
|--------|------|------|--------|
| GET | `/api/jobs` | ❌ | ดึงงานทั้งหมด |
| GET | `/api/jobs/:id` | ❌ | ดึงงานตาม ID |
| GET | `/api/jobs/employer/:employerId` | ✅ employer | ดึงงานของนายจ้าง |
| POST | `/api/jobs` | ✅ employer | สร้างงานใหม่ |
| PUT | `/api/jobs/:id` | ✅ employer | แก้ไขงาน (Mass Assignment Protected) |
| DELETE | `/api/jobs/:id` | ✅ employer | ลบงาน |
| GET | `/api/applications/job/:jobId` | ✅ employer | ดูผู้สมัครของงาน |
| POST | `/api/applications` | ✅ seeker | สมัครงาน |
| PATCH | `/api/applications/:id/status` | ✅ employer | อัปเดตสถานะผู้สมัคร |
| GET | `/api/resumes/user/:userId` | ✅ any | ดึงเรซูเม่ |
| POST | `/api/resumes` | ✅ seeker | บันทึกเรซูเม่ |
| GET | `/api/company/:id` | ❌ | ดูข้อมูลบริษัท |
| GET | `/api/dashboard/stats/:employerId` | ✅ employer | สถิติ dashboard |
| POST | `/api/auth/register` | ❌ | สมัครสมาชิก |
| POST | `/api/auth/login` | ❌ | ล็อกอิน |
| POST | `/api/auth/google` | ❌ | ล็อกอิน Google |

---

## 5. Security ที่ implement แล้ว

- ✅ **CORS** → รับเฉพาะ `http://localhost:5173`
- ✅ **JWT Auth** → Custom HMAC SHA256 (7 วัน หมดอายุ)
- ✅ **Mass Assignment Prevention** → `PUT /api/jobs/:id` destructure เฉพาะ field ที่อนุญาต
- ✅ **Global Error Handling** → Express error middleware
- ✅ **Input Validation** → register, job create, resume save
- ✅ **Route Protection (Frontend)** → `ProtectedRoute.jsx` ตรวจ role
- ✅ **Ownership Check** → นายจ้างแก้/ลบได้เฉพาะงานของตัวเอง
- ✅ **User Spoofing Prevention** → `userId` มาจาก JWT token เสมอ

---

## 6. Database Models (Prisma)

```
User      → id, username, email, password, role (seeker/employer), name, company
Job       → id, title, category, location, description, status, employerId
Application → id, jobId, userId, resumeUrl, status (Pending/Interview/Accepted/Rejected)
Resume    → id, userId, fullName, experiences[], educations[], skills{}, languages[]
```

---

## 7. Features ที่ยังไม่ได้ทำ (Roadmap)

- [ ] Notification เมื่อมีคนสมัคร
- [ ] Email ยืนยันการสมัครสมาชิก
- [ ] Refresh Token (ตอนนี้ใช้ 7 วัน fixed)
- [ ] Upload รูปภาพ/เอกสาร (ตอนนี้ใช้ URL)
- [ ] Chat ระหว่าง Employer ↔ Seeker
- [ ] Pagination สำหรับ job list
- [ ] Admin panel

---

## 8. คำแนะนำสำหรับ AI Agent (ประหยัด Token)

1. **อ่านเฉพาะไฟล์ที่เกี่ยวข้อง** — ไม่ต้อง scan ทั้งโปรเจกต์ทุกครั้ง
2. **Frontend Auth Pattern:** ทุก API call ที่ต้อง auth ให้ใส่ `headers: { 'Authorization': \`Bearer ${user.token}\` }`  โดย `user = JSON.parse(localStorage.getItem('user'))`
3. **Backend Auth Pattern:** ใส่ `authMiddleware` และ/หรือ `requireRole('employer'/'seeker')` ก่อน handler
4. **ห้ามแตะ:** `backend/.env`, `node_modules/`
5. **Styling:** ใช้ Tailwind CSS classes เท่านั้น (ไม่ใช้ plain CSS ยกเว้นจำเป็น)
