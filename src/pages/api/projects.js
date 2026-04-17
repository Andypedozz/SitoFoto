import { db } from "../../db/db.js";

export async function GET({ request }) {
    const projects = (await db.execute("SELECT * FROM Progetto")).rows;
    return new Response(JSON.stringify(projects));
}

export async function POST({ request }) {
    const data = await request.json();
    const { nome, slug, copertina, homepage } = data;
    const result = await db.execute("INSERT INTO Progetto (nome, slug, copertina, homepage) VALUES (?, ?, ?, ?)", [nome, slug, copertina, homepage]);
    return new Response(JSON.stringify(result));
}

export async function PUT({ request }) {
    const data = await request.json();
    const { id, nome, slug, copertina, homepage } = data;
    const result = await db.execute("UPDATE Progetto SET nome = ?, slug = ?, copertina = ?, homepage = ? WHERE id = ?", [nome, slug, copertina, homepage, id]);
    return new Response(JSON.stringify(result));
}

export async function DELETE({ request }) {
    const data = await request.json();
    const { id } = data;
    const result = await db.execute("DELETE FROM Progetto WHERE id = ?", [id]);
    return new Response(JSON.stringify(result));
}