// Servizio per le chiamate API relative ai progetti

const API_BASE = '/api';

/**
 * GET /api/media
 * Ottieni tutti i media
 */
export async function getAll() {
    const response = await fetch(`${API_BASE}/media`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Errore nel caricamento dei media');
    return response.json();
}

/**
 * POST /api/media
 * Crea un nuovo un file multimediale
 */
export async function create(mediaData) {
    const response = await fetch(`${API_BASE}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    })
    if (!response.ok) throw new Error('Errore nella creazione');
    return response.json();
}

/**
 * DELETE /api/media
 * Elimina un file multimediale
 */
export async function destroy(id) {
    const response = await fetch(`${API_BASE}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (!response.ok) throw new Error('Errore nell\'eliminazione');
    return response.json();
}