import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";

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
    const result = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
    });
    return new Response(JSON.stringify(result.resources), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}

export async function POST({ request }) {
    
}

export async function DELETE({ request }) {
    const { id } = data;

    // Delete from the database
    const media = await db.execute("SELECT * FROM Media WHERE id = ?", [id]);
    const result = await db.execute("DELETE FROM Media WHERE id = ?", [id]);

    // Delete on cloudinary
    cloudinary.uploader.destroy(media.rows[0].url, (error, result) => {
        if (error) {
            console.error(error);
        }
    });
    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}

/*****************************************/
/*       Media Cloudinary Endpoints      */
/*****************************************/