import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";
import path from "node:path";
import { db } from "../../../db/db";
dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

export async function DELETE({ request, params }) {
    try {
        const { id } = params;
        console.log(id);

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