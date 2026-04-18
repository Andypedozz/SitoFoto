import { handleError, jsonResponse } from "../../../scripts/responseUtils";
import { db } from "../../../db/db.js"

// GET /api/projects
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");
        const homepage = url.searchParams.get("homepage");

        // /api/projects?id=xxx
        if(id) {
            const result = (await db.execute("SELECT * FROM Progetto WHERE id = ?", [id])).rows[0];
            return jsonResponse(result);
        }
        
        // /api/projects?slug=xxx
        if(slug) {
            const result = (await db.execute("SELECT * FROM Progetto WHERE slug = ?", [slug])).rows[0];
            return jsonResponse(result);
        }

        if(homepage) {
            const result = (await db.execute("SELECT * FROM Progetto WHERE homepage = ?", [homepage])).rows;
            return jsonResponse(result);
        }

        // /api/projects
        const result = (await db.execute("SELECT * FROM Progetto")).rows;
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/projects
export async function POST({ request }) {
    try {
        const data = await request.json();
        console.log(data);
        await db.execute("INSERT INTO Progetto (nome, slug, copertina, homepage) VALUES (?, ?, ?, ?)", [data.nome, data.slug, data.copertina, 1]); 
        const newProject = (await db.execute("SELECT * FROM Progetto WHERE slug = ?", [data.slug])).rows[0];
        return jsonResponse({
            success: true,
            data: newProject
        }, 201);
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/projects
export async function PUT({ request }) {
    try {
        const { id, ...data } = await request.json();
        console.log(id);
        console.log(data);

        if(!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        await db.execute("UPDATE Progetto SET (nome, slug, copertina) = (?, ?, ?) WHERE id = ?", [data.nome, data.slug, data.copertina, id]);

        const updatedProject = (await db.execute("SELECT * FROM Progetto WHERE id = ?", [id])).rows[0];

        if(!updatedProject) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            data: updatedProject
        })
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/projects
export async function DELETE({ request }) {
    try {
        const { id } = await request.json();

        if(!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        const deleted = await db.execute("DELETE FROM Progetto WHERE id = ?", [id]);

        if(!deleted) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            message: 'Progetto eliminato con successo'
        })
    } catch (error) {
        return handleError(error);
    }
}