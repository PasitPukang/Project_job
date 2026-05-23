# Job Portal - Project Context

## 1. Product Overview

**Product Name:** Job Portal (Employer Dashboard)
**Vision:** A fast, professional, and minimalist job recruitment platform dashboard for employers.
**Target Audience:** Employers, Recruiters, and HR Managers.

## 2. Tech Stack

- **Frontend:** React 18 (Vite), Tailwind CSS, React Router DOM, Lucide React, Context API
- **Backend:** Node.js, Express.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma

## 3. Core Features (MVP)

1. **Employer Dashboard (`/`):**
   - Overview statistics (Total Active Jobs, Applicants, Interviews, Unread Messages)
   - Recent Applicants table
   - Active Postings summary
   - Hiring Funnel (Applied, Screened, Interviewed, Offered)
2. **Job Posting History (`/history`):**
   - Table view of all job postings (Active, Draft, Closed status)
   - Search and filter functionalities
   - Applicant counts per job
3. **Create Job Post (`/create-job`):**
   - Form for Basic Details (Title, Category, Location)
   - Form for Details & Requirements (Description, Requirements)
   - Draft saving capabilities
4. **Advertising Plans (`/pricing`):**
   - Three tiers (Basic, Pro, Enterprise)
   - Plan comparison

## 4. Design Aesthetics

- **Theme:** Professional corporate theme with Blue (`bg-blue-600`, etc.) and Gray (`text-gray-600`, `bg-gray-50`) tones.
- **Layout:** Sidebar navigation (optional) with clean top-header. Card-based data presentation.
- **Components:** Rounded borders (`rounded-lg`), soft shadows (`shadow-sm`), clear typography (Inter or modern sans-serif).

## 5. Development Phases

- [x] **Notification Badge** บน Employer Navbar — แสดง Pending applications (poll ทุก 60s) 
- [x] **Pagination** หน้า Search — 10 งานต่อหน้า มีปุ่มเปลี่ยนหน้าและ smart page numbers
- [ ] หน้า Profile ของ Seeker — ดู/แก้ไขข้อมูลส่วนตัวและเรซูเม่
- [ ] Bookmark / บันทึกงานที่สนใจ — เก็บใน localStorage
- [ ] สถานะใบสมัครสำหรับ Seeker — ดูได้ว่าสมัครงานไหนไปแล้ว สถานะเป็นอะไร
- [ ] Email ยืนยันการสมัครสมาชิก
- [ ] Refresh Token (ตอนนี้ใช้ 7 วัน fixed)
- [ ] Upload รูปภาพ/เอกสาร (ตอนนี้ใช้ URL)
- [ ] Chat ระหว่าง Employer ↔ Seeker
- [ ] Admin panel

## 6. Important Notes for Agents

- Always refer to this file before making architectural changes.
- Ensure TailwindCSS is used for all styling. Do not use plain CSS unless absolutely necessary.
- Focus on pixel-perfect matching of the provided screenshots.
- Ensure the application is responsive.
