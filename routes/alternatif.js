import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async(req,res)=>{

const data=
await prisma.alternatif.findMany();

res.json(data);

});

router.post("/", async(req,res)=>{

const {
nama,
gambar,
deskripsi
}=req.body;

const data=
await prisma.alternatif.create({

data:{
nama,
gambar,
deskripsi
}

});

res.json(data);

});

export default router;