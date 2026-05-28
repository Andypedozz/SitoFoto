import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { db } from "../../../db/db";
import path from "node:path";

dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Helper per convertire BigInt in Number
function serializeBigInt(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'bigint') {
        return Number(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item));
    }
    
    if (typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = serializeBigInt(value);
        }
        return newObj;
    }
    
    return obj;
}

/**************************************/
/*       Media DB data Endpoints      */
/**************************************/

export async function GET({ request }) {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
        const project = (
            await db.execute(
                "SELECT * FROM Progetto WHERE slug = ?",
                [slug]
            )
        ).rows[0];

        if (!project) {
            return new Response(
                JSON.stringify({ error: "Progetto non trovato" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const result = (
            await db.execute(
                "SELECT * FROM Media WHERE idProgetto = ?",
                [project.id]
            )
        ).rows;

        // Serializza i BigInt
        const serializedResult = serializeBigInt(result);

        return new Response(JSON.stringify(serializedResult), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    const result = (await db.execute("SELECT * FROM Media")).rows;
    
    // Serializza i BigInt
    const serializedResult = serializeBigInt(result);

    return new Response(JSON.stringify(serializedResult), {
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
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const progetto = (
            await db.execute(
                "SELECT * FROM Progetto WHERE id = ?",
                [idProgetto]
            )
        ).rows[0];

        if (!progetto) {
            return new Response(
                JSON.stringify({ error: "Progetto non trovato" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Upload helper
        const uploadToCloudinary = (buffer, filename, resourceType) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            public_id: filename,
                            resource_type: resourceType,
                            folder: "progetti",
                            overwrite: false
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    )
                    .end(buffer);
            });
        };

        const uploadedMedia = [];

        for (const file of files) {
            // Validazione tipo
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) {
                return new Response(
                    JSON.stringify({
                        error: "Sono consentiti solo immagini e video"
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // Validazione dimensione
            const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;

            if (file.size > maxSize) {
                return new Response(
                    JSON.stringify({
                        error: `File ${file.name} troppo grande. Dimensione massima: ${isVideo ? '100MB' : '20MB'}`
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // File → Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const resourceType = isVideo ? "video" : "image";

            // Nome file univoco
            const cleanName = file.name
                .split('.')
                .slice(0, -1)
                .join('.')
                .replace(/[^\w-]/g, "_")
                .substring(0, 50);

            const filename = `${Date.now()}-${cleanName}`;

            // Upload Cloudinary
            const uploadResponse = await uploadToCloudinary(buffer, filename, resourceType);

            // Salva DB
            const insertResult = await db.execute(
                `
                INSERT INTO Media
                (
                    nome,
                    tipo,
                    cloudinaryPublicId,
                    url,
                    secureUrl,
                    idProgetto
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    file.name,
                    resourceType,
                    uploadResponse.public_id,
                    uploadResponse.url,
                    uploadResponse.secure_url,
                    idProgetto
                ]
            );

            // Crea oggetto media con ID convertito da BigInt
            const mediaItem = {
                id: Number(insertResult.lastInsertRowid),
                nome: file.name,
                tipo: resourceType,
                url: uploadResponse.url,
                secureUrl: uploadResponse.secure_url,
                cloudinaryPublicId: uploadResponse.public_id,
                idProgetto: Number(idProgetto)
            };

            uploadedMedia.push(mediaItem);
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: uploadedMedia
            }),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);

        return new Response(
            JSON.stringify({
                error: "Errore upload media: " + (error.message || "Errore sconosciuto")
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function DELETE({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        
        if (!id) {
            return new Response(
                JSON.stringify({ error: "ID media non fornito" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        
        // Recupera il media per ottenere il cloudinaryPublicId
        const media = (
            await db.execute(
                "SELECT * FROM Media WHERE id = ?",
                [id]
            )
        ).rows[0];
        
        if (!media) {
            return new Response(
                JSON.stringify({ error: "Media non trovato" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }
        
        // Elimina da Cloudinary
        if (media.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
                    resource_type: media.tipo,
                    invalidate: true
                });
            } catch (cloudinaryError) {
                console.error("Errore eliminazione da Cloudinary:", cloudinaryError);
                // Continuiamo comunque con l'eliminazione dal DB
            }
        }
        
        // Elimina dal database
        await db.execute(
            "DELETE FROM Media WHERE id = ?",
            [id]
        );
        
        return new Response(
            JSON.stringify({ success: true, message: "Media eliminato con successo" }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        
    } catch (error) {
        console.error("[DELETE_ERROR]", error);
        
        return new Response(
            JSON.stringify({
                error: "Errore eliminazione media: " + (error.message || "Errore sconosciuto")
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}