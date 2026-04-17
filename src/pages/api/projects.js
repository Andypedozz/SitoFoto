import { db } from "../../db/db.js";

export async function GET({ request }) {
    const projects = (await db.execute("SELECT * FROM Progetto")).rows;
    return new Response(JSON.stringify(projects), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}

export async function POST({ request }) {
    const data = await request.json();
    const { nome, slug, descrizione, copertinaMediaId, homepage } = data;
    const result = await db.execute("INSERT INTO Progetto (nome, slug, descrizione, copertinaMediaId, homepage) VALUES (?, ?, ?, ?, ?)", [nome, slug, descrizione, copertinaMediaId, homepage]);
    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}

export async function PUT({ request }) {
    const data = await request.json();
    const { id, nome, slug, descrizione, copertinaMediaId, homepage } = data;
    const result = await db.execute("UPDATE Progetto SET nome = ?, slug = ?, descrizione = ?, copertinaMediaId = ?, homepage = ? WHERE id = ?", [nome, slug, descrizione, copertinaMediaId, homepage, id]);
    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}

export async function DELETE({ request }) {
    const data = await request.json();
    const { id } = data;
    const result = await db.execute("DELETE FROM Progetto WHERE id = ?", [id]);
    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type" : "application/json"
        }
    });
}