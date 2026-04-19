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
        
        if (!projectIds || !Array.isArray(projectIds)) {
            return jsonResponse({ error: "projectIds must be an array" }, { status: 400 });
        }
        
        // Crea placeholder dinamici per ogni ID
        const placeholders = projectIds.map(() => '?').join(',');
        
        // Imposta homepage=1 per i progetti selezionati
        if (projectIds.length > 0) {
            await db.execute(
                `UPDATE Progetto SET homepage = 1 WHERE id IN (${placeholders})`,
                projectIds
            );
        }
        
        // Imposta homepage=0 per tutti gli altri
        if (projectIds.length > 0) {
            await db.execute(
                `UPDATE Progetto SET homepage = 0 WHERE id NOT IN (${placeholders})`,
                projectIds
            );
        } else {
            // Se nessun progetto selezionato, imposta tutti a 0
            await db.execute("UPDATE Progetto SET homepage = 0");
        }
        
        return jsonResponse({ success: true });
    } catch (error) {
        return handleError(error);
    }
}