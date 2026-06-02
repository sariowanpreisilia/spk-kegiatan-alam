import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();

// ================= KONFIGURASI STORAGE MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads";
    // Membuat folder jika belum ada secara otomatis
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Memberikan nama unik menggunakan timestamp agar tidak bentrok
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ================= TAMPIL SEMUA =================
router.get("/", async (req, res) => {
  try {
    const data = await prisma.alternatif.findMany();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data alternatif" });
  }
});

// ================= TAMBAH DATA (DENGAN UPLOAD GAMBAR) =================
// 'gambar' di dalam upload.single() harus sesuai dengan nama field yang dikirim frontend
router.post("/", upload.single("gambar"), async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    
    // Jika ada file yang diunggah, ambil nama filenya. Jika tidak, set null
    const namaGambar = req.file ? req.file.filename : null;

    const data = await prisma.alternatif.create({
      data: {
        nama,
        deskripsi,
        gambar: namaGambar, // Menyimpan nama file gambar unik ke database
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Detail Error Alternatif:", error);
    res.status(500).json({ error: "Gagal menambahkan data alternatif ke database" });
  }
});

export default router;