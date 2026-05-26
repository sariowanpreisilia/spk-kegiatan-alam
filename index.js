import express from "express";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import kriteriaRoutes from "./routes/kriteria.js";
import alternatifRoutes from "./routes/alternatif.js";
import penilaianRoutes from "./routes/penilaian.js";

const app = express();

const __filename = fileURLToPath(
import.meta.url
);

const __dirname =
path.dirname(__filename);

app.use(cors());
app.use(express.json());

// AKSES FOLDER GAMBAR
app.use(
"/img",
express.static(
path.join(
__dirname,
"img"
)
)
);

app.use(
"/kriteria",
kriteriaRoutes
);

app.use(
"/alternatif",
alternatifRoutes
);

app.use(
"/penilaian",
penilaianRoutes
);

app.listen(
5000,
()=>{

console.log(
"Server jalan"
);

});