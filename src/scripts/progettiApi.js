// Servizio per le chiamate API relative ai progetti

const API_BASE = '/api';

/**
 * GET /api/projects
 * Ottieni tutti i progetti
 */
export async function getAll() {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Errore nel caricamento dei progetti');
    return response.json();
}

/**
 * POST /api/projects
 * Crea un nuovo progetto
 */
export async function create(projectData) {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    })
    if (!response.ok) throw new Error('Errore nella creazione');
    return response.json();
}

/**
 * PUT /api/projects
 * Aggiorna un progetto
 */
export async function update(id, projectData) {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...projectData })
    })
    if (!response.ok) throw new Error('Errore nell\'aggiornamento');
    return response.json();
}

/**
 * DELETE /api/projects
 * Elimina un progetto
 */
export async function destroy(id) {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (!response.ok) throw new Error('Errore nell\'eliminazione');
    return response.json();
}