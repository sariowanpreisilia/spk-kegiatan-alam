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

    // 🔥 Sudah diperbaiki: prisma.kriteria.delete (tidak double lagi)
    const data = await prisma.kriteria.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "Data kriteria berhasil dihapus", data });
  } catch (error) {
    console.error("Detail Error Backend:", error);
    
    if (error.code === "P2003") {
      return res.status(400).json({ 
        error: "Data gagal dihapus karena kriteria ini masih digunakan pada data penilaian!" 
      });
    }
    
    res.status(500).json({ error: "Gagal menghapus kriteria karena masalah internal server." });
  }
});

export default router;