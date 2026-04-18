import { db } from "../../../db/db.js";
import { jsonResponse, handleError } from "../../../scripts/responseUtils";

// GET homepage projects
export async function GET({ request }) {
    try {
        const result = (await db.execute("SELECT * FROM Progetto WHERE homepage = ?", [1])).rows;
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/projects/homepage
export async function PUT({ request }) {
    try {
        const { projectIds } = await request.json();
        await db.execute("UPDATE Progetto SET homepage = 1 WHERE id IN (?)", [projectIds]);
        await db.execute("UPDATE Progetto SET homepage = 0 WHERE id NOT IN (?)", [projectIds]);
        return jsonResponse({ success: true });
    } catch (error) {
        return handleError(error);
    }
}