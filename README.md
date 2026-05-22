# 🚀 หางาน.com (Job Portal Web Application)

โปรเจกต์เว็บแอปพลิเคชันสำหรับค้นหาและลงประกาศงาน แบ่งระบบการใช้งานออกเป็น 2 ฝั่งหลัก คือ **ผู้สมัครงาน (Job Seeker)** และ **ผู้ประกอบการ (Employer)**

---

## 🌟 สรุปฟีเจอร์ทั้งหมดในระบบ (Features)

### 1. ฝั่งผู้สมัครงาน (Job Seeker)
*   **ระบบสมาชิก:** สมัครสมาชิกและเข้าสู่ระบบ (ทั้งแบบกรอกอีเมล/รหัสผ่านปกติ และเชื่อมต่อผ่าน Google Login)
*   **หน้าแรกและหน้าค้นหางาน:** แสดงรายการงานทั้งหมดในระบบ สามารถค้นหาตามชื่อตำแหน่งหรือบริษัทได้
*   **หน้ารายละเอียดงาน (กำลังพัฒนา):** กดดูรายละเอียดงานแบบเต็ม และกดส่ง Resume สมัครงานได้

### 2. ฝั่งผู้ประกอบการ (Employer)
*   **ระบบสมาชิก:** สมัครสมาชิกแบบผู้ประกอบการ และเข้าสู่ระบบ (รองรับ Google Login)
*   **Dashboard:** หน้าแรกแสดงสถิติการรับสมัครงานของบริษัท (จำนวนงานที่เปิดรับ, จำนวนผู้สมัคร, สถิติการสัมภาษณ์)
*   **ระบบลงประกาศงาน (Create Job):** ฟอร์มสำหรับสร้างประกาศงานใหม่ ข้อมูลจะถูกบันทึกและผูกกับบริษัทที่ลงประกาศ (Job Ownership)
*   **ประวัติการลงประกาศ (Job History):** ตารางดูประวัติการลงประกาศงานทั้งหมดของบริษัทตัวเอง
*   **หน้ารายการผู้สมัคร (Applications):** เรียกดูรายชื่อผู้สมัครงานในแต่ละตำแหน่ง, ดูเรซูเม่, และปรับสถานะ (รอสัมภาษณ์, รอตัดสินใจ, ผ่าน, ไม่ผ่าน)

### 3. ระบบหลังบ้าน (Backend & Database)
*   **PostgreSQL & Prisma ORM:** จัดการฐานข้อมูลอย่างเป็นระบบ มีตาราง `User`, `Job`, และ `Application` ที่เชื่อมโยงความสัมพันธ์กัน
*   **API (Express.js):** ให้บริการข้อมูลแก่หน้าเว็บ (เช่น ดึงสถิติ, สร้างงาน, ดึงผู้สมัคร)
*   **Security:** ระบบเข้ารหัสรหัสผ่านด้วย `bcrypt` และแบ่งแยกข้อมูลระหว่างบริษัท (Employer)

---

### 4. สิ่งที่ต้องดำเนินการในเซสชันถัดไป (Next Steps) - อัปเดตล่าสุด
1.  **Seeker UI Integration:** ✅ (เสร็จสมบูรณ์) ปรับปรุงหน้า Search ให้สามารถกด "สมัครงาน" (ส่ง Request ไปที่ `POST /api/applications`) ได้จริง
2.  **UI Polish:** ✅ (เสร็จสมบูรณ์) ปรับปรุงหน้า `Applications.jsx` ให้ผู้ประกอบการสามารถกดเปลี่ยนสถานะผู้สมัคร (เช่น เปลี่ยนจาก Pending เป็น Interview หรือ Rejected) ได้โดยตรง 
3.  **Resume Upload:** 🔄 (รอดำเนินการในอนาคต) พัฒนาฟังก์ชันการอัปโหลดไฟล์ Resume ผ่านบริการเช่น Cloudinary
4.  **State Management:** 🔄 (รอดำเนินการในอนาคต) ย้ายการจัดการ Session Auth จาก `localStorage` ไปเป็น JWT/HttpOnly Cookies เพื่อความปลอดภัยที่มากขึ้น

### 5. ข้อสังเกตและคำแนะนำ
*   ระบบปัจจุบันรองรับการทำงานแบบ End-to-End ตั้งแต่ฝั่งผู้สมัคร (Seeker) ค้นหาและกดสมัครงาน ไปจนถึงผู้ประกอบการ (Employer) เข้ามาตรวจเช็ครายชื่อและปรับสถานะผู้สมัครได้
*   เมื่อกลับมาทำงานต่อ แนะนำให้รัน Terminal 2 หน้าต่าง (Backend: `npx ts-node index.ts` และ Frontend: `npm run dev`) เพื่อเริ่มต้นการทำงานทันที

---

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)
*   **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons), React Router, React Google OAuth
*   **Backend:** Node.js, Express.js, TypeScript
*   **Database:** PostgreSQL, Prisma ORM
*   **Authentication:** Bcrypt.js, Google Auth Library

---

## 🛠️ วิธีติดตั้งและรันโปรเจกต์ (How to Run)

การรันโปรเจกต์นี้จะต้องเปิด Terminal **2 หน้าต่าง** (สำหรับ Frontend และ Backend)

### ขั้นตอนที่ 1: การตั้งค่า Database และ Backend (หน้าต่างที่ 1)
1. เปิด Terminal แล้วเข้าไปที่โฟลเดอร์ `backend`
   ```bash
   cd d:\jobreserch\backend
   ```
2. โหลดโครงสร้างฐานข้อมูลล่าสุดเข้าสู่ PostgreSQL (ถ้าเพิ่งโหลดโปรเจกต์มาใหม่)
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. เริ่มต้นการทำงานของ Backend Server
   ```bash
   npx ts-node index.ts
   ```
   *(รอจนกว่าจะขึ้นข้อความ `✅ Server is running on port 5000`)*

### ขั้นตอนที่ 2: การตั้งค่า Frontend (หน้าต่างที่ 2)
1. เปิด Terminal ใหม่ แล้วอยู่ที่โฟลเดอร์หลักของโปรเจกต์
   ```bash
   cd d:\jobreserch
   ```
2. เริ่มต้นการทำงานของหน้าเว็บ
   ```bash
   npm run dev
   ```
3. เปิดเบราว์เซอร์แล้วเข้าไปที่ `http://localhost:5173`

---

## 📂 โครงสร้างโฟลเดอร์ที่สำคัญ (Project Structure)
*   `src/` - โค้ดของฝั่ง Frontend (React)
    *   `src/pages/` - หน้าเว็บฝั่งผู้สมัคร (เช่น `Home.jsx`, `Search.jsx`, `LoginSeeker.jsx`)
    *   `src/pages/employer/` - หน้าเว็บฝั่งบริษัท (เช่น `Dashboard.jsx`, `CreateJob.jsx`, `History.jsx`, `Applications.jsx`)
    *   `src/components/layout/` - โครงสร้างเมนูบาร์บนเว็บ
*   `backend/` - โค้ดของฝั่ง Backend (API)
    *   `backend/index.ts` - ไฟล์ควบคุม API ทั้งหมด (Route Controller)
    *   `backend/prisma/schema.prisma` - โครงสร้างฐานข้อมูลตารางทั้งหมด

---
*จัดทำขึ้นเพื่อให้ทีมพัฒนาสามารถทำงานต่อได้อย่างราบรื่น 🚀*
