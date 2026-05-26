import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();


// ================= GET =================

router.get(
"/",
async(req,res)=>{

try{

const data =
await prisma.penilaian.findMany({

include:{
alternatif:true,
kriteria:true
}

});

res.json(data);

}

catch(err){

console.log(err);

res.status(500).json({

message:
"Gagal mengambil data"

});

}

}
);


// ================= SIMPAN SATU DATA =================

router.post(
"/",
async(req,res)=>{

try{

const {

id_alternatif,
id_kriteria,
nilai

} = req.body;

const data =

await prisma.penilaian.upsert({

where:{

id_alternatif_id_kriteria:{

id_alternatif:
Number(
id_alternatif
),

id_kriteria:
Number(
id_kriteria
)

}

},

update:{

nilai:
Number(
nilai
)

},

create:{

id_alternatif:
Number(
id_alternatif
),

id_kriteria:
Number(
id_kriteria
),

nilai:
Number(
nilai
)

}

});

res.json(data);

}

catch(err){

console.log(err);

res.status(500).json({

message:
err.message

});

}

}
);


// ================= BULK SAVE =================

router.post(
"/bulk",
async(req,res)=>{

try{

const data =
req.body;

for(
const item of data
){

await prisma.penilaian.upsert({

where:{

id_alternatif_id_kriteria:{

id_alternatif:
Number(
item.id_alternatif
),

id_kriteria:
Number(
item.id_kriteria
)

}

},

update:{

nilai:
Number(
item.nilai
)

},

create:{

id_alternatif:
Number(
item.id_alternatif
),

id_kriteria:
Number(
item.id_kriteria
),

nilai:
Number(
item.nilai
)

}

});

}

res.json({

message:
"Berhasil disimpan"

});

}

catch(err){

console.log(err);

res.status(500).json({

message:
err.message

});

}

}
);

export default router;