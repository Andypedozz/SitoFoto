import { db } from "../../../db/db.js";

// GET homepage projects
export async function GET() {
    try {
        const result = (await db.execute(
            "SELECT * FROM Progetto WHERE homepage = ?",
            [1]
        )).rows ?? [];

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("API Error:", error);

        return new Response(JSON.stringify({
            error: true,
            message: error.message || "Errore interno"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}


// PUT /api/projects/homepage
export async function PUT({ request }) {
    try {
        const { projectIds } = await request.json();

        if (!projectIds || !Array.isArray(projectIds)) {
            return new Response(JSON.stringify({
                error: true,
                message: "projectIds must be an array"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const placeholders = projectIds.map(() => '?').join(',');

        if (projectIds.length > 0) {
            await db.execute(
                `UPDATE Progetto SET homepage = 1 WHERE id IN (${placeholders})`,
                projectIds
            );

            await db.execute(
                `UPDATE Progetto SET homepage = 0 WHERE id NOT IN (${placeholders})`,
                projectIds
            );
        } else {
            await db.execute("UPDATE Progetto SET homepage = 0");
        }

        return new Response(JSON.stringify({
            success: true
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("API Error:", error);

        return new Response(JSON.stringify({
            error: true,
            message: error.message || "Errore interno"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}