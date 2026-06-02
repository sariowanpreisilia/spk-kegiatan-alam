import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client"; // 🔥 Pindahkan ke atas agar stabil

import kriteriaRoutes from "./routes/kriteria.js";
import alternatifRoutes from "./routes/alternatif.js";
import penilaianRoutes from "./routes/penilaian.js";

const app = express();
const prisma = new PrismaClient(); // 🔥 Inisialisasi di sini

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ================= AKSES FOLDER GAMBAR LOKAL =================
app.use("/img", express.static(path.join(__dirname, "img")));

// ================= RUTE DARURAT UNTUK SINKRONISASI DATABASE =================
app.get("/paksa-update-db", async (req, res) => {
  try {
    // Memaksa TiDB Cloud mengubah kolom gambar menjadi TEXT menggunakan instance prisma yang sudah ada
    await prisma.$executeRawUnsafe(
      `ALTER TABLE alternatif MODIFY COLUMN gambar TEXT;`
    );
    
    res.send("<h1>✅ Sukses! Kolom gambar berhasil diubah menjadi TEXT di TiDB Cloud.</h1>");
  } catch (error) {
    console.error("Error paksa-update-db:", error);
    res.status(500).send(`<h1>❌ Gagal memperbarui: ${error.message}</h1>`);
  }
});

// ================= ROUTE API UTAMA =================
app.use("/kriteria", kriteriaRoutes);
app.use("/alternatif", alternatifRoutes);
app.use("/penilaian", penilaianRoutes);

// ================= PORT SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});