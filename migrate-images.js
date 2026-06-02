import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  console.log("=== Mengubah Struktur Kolom Gambar via SQL Raw ===");
  try {
    // Memaksa MySQL / TiDB mengubah tipe data kolom gambar menjadi TEXT secara langsung
    await prisma.$executeRawUnsafe(
      `ALTER TABLE alternatif MODIFY COLUMN gambar TEXT;`
    );
    console.log("✅ Sukses memperbesar kapasitas kolom gambar menjadi TEXT!");
  } catch (sqlError) {
    console.log("ℹ️ Kolom mungkin sudah bertipe TEXT atau diubah sebelumnya:", sqlError.message);
  }

  console.log("\n=== Memulai Migrasi Gambar ke Cloudinary ===");
  const daftarAlternatif = await prisma.alternatif.findMany();
  const folderLokal = "./img"; 

  for (const alternatif of daftarAlternatif) {
    const namaGambar = alternatif.gambar;

    if (namaGambar && !namaGambar.startsWith("http")) {
      const pathGambarLokal = path.join(folderLokal, namaGambar);

      if (fs.existsSync(pathGambarLokal)) {
        console.log(`Mengunggah ${namaGambar} untuk alternatif: ${alternatif.nama}...`);

        try {
          const hasilUpload = await cloudinary.uploader.upload(pathGambarLokal, {
            folder: "spk_kegiatan_alam",
          });

          const urlBaruCloudinary = hasilUpload.secure_url;

          await prisma.alternatif.update({
            where: { id: alternatif.id },
            data: { gambar: urlBaruCloudinary },
          });

          console.log(`✅ Sukses Migrasi! URL: ${urlBaruCloudinary}`);
        } catch (error) {
          console.error(`❌ Gagal mengunggah ${namaGambar}:`, error.message);
        }
      } else {
        console.log(`⚠️ File ${namaGambar} tidak ditemukan di folder lokal ./img`);
      }
    } else {
      console.log(`箱 Alternatif "${alternatif.nama}" sudah menggunakan cloud URL.`);
    }
  }

  console.log("\n=== Seluruh Proses Selesai! ===");
}

main()
  .catch((e) => console.error("Eror Utama:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });