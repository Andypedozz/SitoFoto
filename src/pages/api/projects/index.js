import { db } from "../../../db/db.js";

// GET /api/projects
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");
        const homepage = url.searchParams.get("homepage");

        if (id) {
            const result = (await db.execute(
                "SELECT * FROM Progetto WHERE id = ?",
                [id]
            )).rows[0] ?? null;

            return new Response(JSON.stringify(result), {
                status: result ? 200 : 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (slug) {
            const result = (await db.execute(
                "SELECT * FROM Progetto WHERE slug = ?",
                [slug]
            )).rows[0] ?? null;

            return new Response(JSON.stringify(result), {
                status: result ? 200 : 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (homepage) {
            const result = (await db.execute(
                "SELECT * FROM Progetto WHERE homepage = ?",
                [homepage]
            )).rows ?? [];

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        const result = (await db.execute("SELECT * FROM Progetto")).rows ?? [];

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


// POST /api/projects
export async function POST({ request }) {
    try {
        const data = await request.json();

        await db.execute(
            "INSERT INTO Progetto (nome, slug, copertina, descrizione, homepage) VALUES (?, ?, ?, ?, ?)",
            [data.nome, data.slug, data.copertina, data.descrizione, 1]
        );

        const newProject = (await db.execute(
            "SELECT * FROM Progetto WHERE slug = ?",
            [data.slug]
        )).rows[0] ?? null;

        return new Response(JSON.stringify(newProject), {
            status: 201,
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


// PUT /api/projects
export async function PUT({ request }) {
    try {
        const { id, ...data } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({
                error: true,
                message: "ID progetto obbligatorio"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        await db.execute(
            "UPDATE Progetto SET nome = ?, slug = ?, copertina = ?, descrizione = ? WHERE id = ?",
            [data.nome, data.slug, data.copertina, data.descrizione, id]
        );

        const updatedProject = (await db.execute(
            "SELECT * FROM Progetto WHERE id = ?",
            [id]
        )).rows[0] ?? null;

        return new Response(JSON.stringify(updatedProject), {
            status: updatedProject ? 200 : 404,
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


// DELETE /api/projects
export async function DELETE({ request }) {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({
                error: true,
                message: "ID progetto obbligatorio"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const result = await db.execute(
            "DELETE FROM Progetto WHERE id = ?",
            [id]
        );

        if (!result || result.rowsAffected === 0) {
            return new Response(JSON.stringify({
                error: true,
                message: "Progetto non trovato"
            }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
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