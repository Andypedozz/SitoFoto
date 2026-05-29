import { db } from "../../db/db";

export async function GET({ request }) {

    const result = (await db.execute("SELECT * FROM Categoria")).rows;

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function POST({ request }) {
    const data = await request.json();
    const result = await db.execute("INSERT INTO Categoria (nome) VALUES (?)", [data.nome]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function PUT({ request }) {
    const data = await request.json();
    const result = await db.execute("UPDATE Categoria SET nome = ? WHERE id = ?", [data.nome, data.id]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function DELETE({ request }) {
    const data = await request.json();
    const result = await db.execute("DELETE FROM Categoria WHERE id = ?", [data.id]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}