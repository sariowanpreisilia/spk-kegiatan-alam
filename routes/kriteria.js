import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ================= TAMPIL SEMUA =================
router.get("/", async (req, res) => {
  try {
    const data = await prisma.kriteria.findMany();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data kriteria" });
  }
});

// ================= TAMBAH DATA =================
router.post("/", async (req, res) => {
  try {
    const { nama, bobot, tipe } = req.body;
    
    const data = await prisma.kriteria.create({
      data: {
        nama,
        bobot: Number(bobot),
        tipe,
      },
    });
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan kriteria" });
  }
});

// ================= UPDATE DATA =================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, bobot, tipe } = req.body;

    const data = await prisma.kriteria.update({
      where: {
        // Jika di schema.prisma ID Anda bertipe Int/Autoincrement, gunakan Number(id)
        id: Number(id), 
      },
      data: {
        nama,
        bobot: Number(bobot),
        tipe,
      },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui kriteria" });
  }
});

// ================= HAPUS DATA =================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.prisma.kriteria.delete({
      where: {
        // Jika di schema.prisma ID Anda bertipe Int/Autoincrement, gunakan Number(id)
        id: Number(id),
      },
    });

    res.json({ message: "Data kriteria berhasil dihapus", data });
  } catch (error) {
    console.error(error);
    
    // Menangani error jika kriteria gagal dihapus karena berelasi dengan tabel penilaian (Foreign Key)
    if (error.code === "P2003") {
      return res.status(400).json({ 
        error: "Data gagal dihapus karena masih digunakan pada data penilaian" 
      });
    }
    
    res.status(500).json({ error: "Gagal menghapus kriteria" });
  }
});

export default router;