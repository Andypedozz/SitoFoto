import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { db } from "../../db/db";
import path from "node:path";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**************************************/
/*           LOGGER UTILS             */
/**************************************/
const logError = (context, error, extra = {}) => {
    console.error(JSON.stringify({
        level: "error",
        context,
        message: error?.message || error,
        stack: error?.stack,
        ...extra,
        timestamp: new Date().toISOString()
    }, null, 2));
};

/**************************************/
/*       CLOUDINARY HELPERS           */
/**************************************/
const uploadToCloudinary = (buffer, filename, resourceType) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                public_id: filename,
                resource_type: resourceType,
                folder: "progetti"
            },
            (error, result) => {
                if (error) {
                    logError("CLOUDINARY_UPLOAD_ERROR", error, {
                        filename,
                        resourceType
                    });
                    return reject(error);
                }
                resolve(result);
            }
        ).end(buffer);
    });
};

const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    } catch (error) {
        logError("CLOUDINARY_CLEANUP_ERROR", error, {
            publicId,
            resourceType
        });
    }
};

/**************************************/
/*              POST                  */
/**************************************/
export async function POST({ request }) {
    let uploadedCloudinary = []; // per cleanup in caso di errore

    try {
        const formData = await request.formData();
        const files = formData.getAll("files");
        const idProgetto = formData.get("idProgetto");

        if (!files || files.length === 0) {
            return new Response(JSON.stringify({ error: "Nessun file caricato" }), { status: 400 });
        }

        const progetto = (await db.execute(
            "SELECT * FROM Progetto WHERE id = ?",
            [idProgetto]
        )).rows[0];

        if (!progetto) {
            return new Response(JSON.stringify({ error: "Progetto non trovato" }), { status: 404 });
        }

        // 🚀 INIZIO TRANSAZIONE
        await db.execute("BEGIN");

        const uploadedMedia = [];

        for (const file of files) {
            try {
                // VALIDAZIONI
                if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                    throw new Error("Tipo file non supportato");
                }

                if (file.size > 100 * 1024 * 1024) {
                    throw new Error("File troppo grande");
                }

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const resourceType = file.type.startsWith("video/")
                    ? "video"
                    : "image";

                const filename = path.parse(file.name).name;

                // ☁️ UPLOAD
                const uploadResponse = await uploadToCloudinary(
                    buffer,
                    filename,
                    resourceType
                );

                // salva per eventuale rollback Cloudinary
                uploadedCloudinary.push({
                    publicId: uploadResponse.public_id,
                    resourceType
                });

                // 💾 INSERT DB
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

            } catch (fileError) {
                logError("FILE_PROCESSING_ERROR", fileError, {
                    fileName: file.name,
                    idProgetto
                });

                // ❌ FALLIMENTO → rollback totale
                throw fileError;
            }
        }

        // ✅ COMMIT
        await db.execute("COMMIT");

        return new Response(JSON.stringify(uploadedMedia), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        // ❌ ROLLBACK DB
        try {
            await db.execute("ROLLBACK");
        } catch (rollbackError) {
            logError("DB_ROLLBACK_ERROR", rollbackError);
        }

        // ❌ CLEANUP CLOUDINARY (importantissimo)
        for (const file of uploadedCloudinary) {
            await deleteFromCloudinary(file.publicId, file.resourceType);
        }

        logError("UPLOAD_FATAL_ERROR", error, {
            uploadedCount: uploadedCloudinary.length
        });

        return new Response(
            JSON.stringify({
                error: "Upload fallito, rollback eseguito"
            }),
            { status: 500 }
        );
    }
}