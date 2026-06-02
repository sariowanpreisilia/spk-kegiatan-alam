import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();
const prisma = new PrismaClient();

// Konfigurasi Kredensial Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pengaturan Storage Multer untuk Cloudinary (Untuk Tambah Data Baru)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "spk_kegiatan_alam",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

// ================= TAMPIL DATA (DENGAN LOGIKA URL OTOMATIS) =================
router.get("/", async (req, res) => {
  try {
    const data = await prisma.alternatif.findMany();

    // Base URL backend Anda di Railway
    const BASE_URL_RAILWAY = "https://spk-kegiatan-alam-production.up.railway.app";

    // Peta ulang data sebelum dikirim ke Frontend React
    const dataTerformat = data.map((item) => {
      let urlFinal = null;

      if (item.gambar) {
        if (item.gambar.startsWith("http")) {
          // Jika sudah berupa link Cloudinary, gunakan langsung
          urlFinal = item.gambar;
        } else {
          // Jika masih berupa nama file lama (ex: 1777900778267.jpg), arahkan ke folder /img Railway
          urlFinal = `${BASE_URL_RAILWAY}/img/${item.gambar}`;
        }
      }

      return {
        ...item,
        gambar: urlFinal, // Frontend akan menerima URL utuh yang siap pakai
      };
    });

    res.json(dataTerformat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data alternatif" });
  }
});

// ================= TAMBAH DATA BARU =================
router.post("/", upload.single("gambar"), async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    
    // Cloudinary mengembalikan URL internet permanen di req.file.path
    const urlGambar = req.file ? req.file.path : null;

    const data = await prisma.alternatif.create({
      data: {
        nama,
        deskripsi,
        gambar: urlGambar,
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Error Tambah Alternatif:", error);
    res.status(500).json({ error: "Gagal menambahkan data alternatif" });
  }
});

export default router;