import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";
import { db } from "../../db/db";
import path from "node:path";
dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

/**************************************/
/*       Media DB data Endpoints      */
/**************************************/

export async function GET({ request }) {

    const result = (await db.execute(
        "SELECT * FROM Media"
    )).rows;
    
    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files");
        const idProgetto = formData.get("idProgetto");

        if (!files || files.length === 0) {
            return new Response(
                JSON.stringify({ error: "Nessun file caricato" }),
                { status: 400 }
            );
        }

        const progetto = (await db.execute(
            "SELECT * FROM Progetto WHERE id = ?",
            [idProgetto]
        )).rows[0];

        if (!progetto) {
            return new Response(
                JSON.stringify({ error: "Progetto non trovato" }),
                { status: 404 }
            );
        }

        // 🔥 funzione helper per upload
        const uploadToCloudinary = (buffer, filename, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        public_id: filename,
                        resource_type: resourceType,
                        folder: "progetti"
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                ).end(buffer);
            });
        };

        const uploadedMedia = [];

        for (const file of files) {

            // ✅ validazione tipo
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                return new Response(
                    JSON.stringify({ error: "Solo immagini e video" }),
                    { status: 400 }
                );
            }

            // ✅ validazione dimensione
            if (file.size > 100 * 1024 * 1024) {
                return new Response(
                    JSON.stringify({ error: `File ${file.name} troppo grande` }),
                    { status: 400 }
                );
            }

            // 🔥 conversione file → buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const resourceType = file.type.startsWith("video/")
                ? "video"
                : "image";

            const filename = path.parse(file.name).name;

            // 🚀 upload Cloudinary
            const uploadResponse = await uploadToCloudinary(
                buffer,
                filename,
                resourceType
            );

            // 💾 salva su DB
            const insertResult = await db.execute(
                `INSERT INTO Media 
                (nome, tipo, cloudinaryPublicId, url, secureUrl, idProgetto)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    file.name,
                    resourceType,
                    uploadResponse.public_id,
                    uploadResponse.url,
                    uploadResponse.secure_url,
                    idProgetto
                ]
            );

            uploadedMedia.push({
                id: insertResult.lastInsertRowid,
                nome: file.name,
                url: uploadResponse.secure_url
            });
        }

        return new Response(JSON.stringify(uploadedMedia), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);

        return new Response(
            JSON.stringify({ error: "Errore upload" }),
            { status: 500 }
        );
    }
}

export async function DELETE({ request }) {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ error: "ID mancante" }),
                { status: 400 }
            );
        }

        // 🔍 recupera media dal DB
        const mediaResult = await db.execute(
            "SELECT * FROM Media WHERE id = ?",
            [id]
        );

        const media = mediaResult.rows[0];

        if (!media) {
            return new Response(
                JSON.stringify({ error: "Media non trovato" }),
                { status: 404 }
            );
        }

        // 🧠 determina resource_type
        const resourceType = media.tipo === "video" ? "video" : "image";

        // ☁️ elimina da Cloudinary
        await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
            resource_type: resourceType
        });

        // 💾 elimina dal DB
        await db.execute(
            "DELETE FROM Media WHERE id = ?",
            [id]
        );

        return new Response(
            JSON.stringify({ success: true, id }),
            {
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("[DELETE_ERROR]", error);

        return new Response(
            JSON.stringify({ error: "Errore eliminazione" }),
            { status: 500 }
        );
    }
}

/*****************************************/
/*       Media Cloudinary Endpoints      */
/*****************************************/