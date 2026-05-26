import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// tampil semua
router.get("/", async(req,res)=>{

const data =
await prisma.kriteria.findMany();

res.json(data);

});

// tambah
router.post("/", async(req,res)=>{

const {
nama,
bobot,
tipe
}=req.body;

const data =
await prisma.kriteria.create({

data:{
nama,
bobot:Number(bobot),
tipe
}

});

res.json(data);

});

export default router;