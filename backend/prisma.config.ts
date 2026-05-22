// Prisma Config สำหรับ หางาน.com
// ไฟล์นี้บอก Prisma ว่าจะเชื่อมต่อ Database ตรงไหน (แทนการใส่ url ใน schema.prisma)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // อ่านค่า DATABASE_URL จากไฟล์ .env
    url: process.env["DATABASE_URL"],
  },
});
