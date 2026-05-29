import { db } from "../../db/db";

export async function GET({ request }) {
    const result = (await db.execute("SELECT * FROM Feedback")).rows;

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function POST({ request }) {
    const data = await request.json();
    const result = await db.execute("INSERT INTO Feedback (nome, qualifica, recensione) VALUES (?, ?, ?)", [data.nome, data.qualifica, data.recensione]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function PUT({ request }) {
    const data = await request.json();
    const result = await db.execute("UPDATE Feedback SET nome = ?, qualifica = ?, recensione = ? WHERE id = ?", [data.nome, data.qualifica, data.recensione, data.id]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function DELETE({ request }) {
    const data = await request.json();
    const result = await db.execute("DELETE FROM Feedback WHERE id = ?", [data.id]);
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}