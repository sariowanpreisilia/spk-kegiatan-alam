import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();
const prisma = new PrismaClient();

// ================= KONFIGURASI CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pengaturan Storage Multer untuk Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "spk_kegiatan_alam", // Nama folder di dashboard Cloudinary Anda
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

// ================= 1. TAMPIL DATA (GET) =================
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
        gambar: urlFinal, // Frontend tinggal terima beres URL utuh siap pakai
      };
    });

    res.json(dataTerformat);
  } catch (error) {
    console.error("Error Get Alternatif:", error);
    res.status(500).json({ error: "Gagal mengambil data alternatif" });
  }
});

// ================= 2. TAMBAH DATA (POST) =================
router.post("/", upload.single("gambar"), async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    
    // Cloudinary otomatis menghasilkan URL internet permanen di req.file.path
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

// ================= 3. UPDATE DATA (PUT) =================
router.put("/:id", upload.single("gambar"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;

    // Ambil data alternatif lama untuk tahu gambar sebelumnya
    const alternatifLama = await prisma.alternatif.findUnique({
      where: { id: Number(id) },
    });

    // Jika ada file baru diunggah, pakai URL Cloudinary baru. Jika tidak, pakai gambar yang lama
    let urlGambar = alternatifLama ? alternatifLama.gambar : null;
    if (req.file) {
      urlGambar = req.file.path;
    }

    const data = await prisma.alternatif.update({
      where: { id: Number(id) },
      data: {
        nama,
        deskripsi,
        gambar: urlGambar,
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Error Update Alternatif:", error);
    res.status(500).json({ error: "Gagal memperbarui data alternatif" });
  }
});

// ================= 4. HAPUS DATA (DELETE) =================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Langkah A: Bersihkan semua data penilaian anak yang mengikat id alternatif ini
    await prisma.penilaian.deleteMany({
      where: { alternatif_id: Number(id) }, 
      // Catatan: Jika di schema.prisma Anda nama kolomnya 'id_alternatif', ganti menjadi: id_alternatif: Number(id)
    });

    // Langkah B: Setelah relasi anak bersih, baru hapus data alternatif utama
    await prisma.alternatif.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Alternatif dan nilai terkait berhasil dihapus" });
  } catch (error) {
    console.error("Error Hapus Alternatif:", error);
    res.status(500).json({ error: "Gagal menghapus data alternatif" });
  }
});

export default router;