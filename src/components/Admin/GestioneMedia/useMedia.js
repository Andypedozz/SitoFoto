// useMedia.js
import { useState, useCallback } from "react";

export function useMedia() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==================== API CALLS ====================

    /** 
     * GET /api/media
     * Ottieni tutti i media
     */
    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/media");
            if (!response.ok) throw new Error("Errore nel caricamento dei media");
            const data = await response.json();
            setMedia(data);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Errore fetch media:', err);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * POST /api/media/upload
     * Carica nuovi file media
     * @param {FormData} formData - Dati del form con i file e idProgetto
     */
    const uploadMedia = async (formData) => {
        try {
            const response = await fetch("/api/media/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Errore nel caricamento");
            
            const result = await response.json();
            // Aggiungi i nuovi media alla lista esistente
            setMedia(prev => [...result.data, ...prev]);
            return { success: true, data: result.data };
        } catch (err) {
            console.error('Errore upload media:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * PATCH /api/media/:id/visibility
     * Modifica la visibilità di un media
     * @param {number} id - ID del media
     * @param {boolean} visibile - Nuovo stato di visibilità
     */
    const toggleVisibility = async (id, visibile) => {
        try {
            const response = await fetch(`/api/media/${id}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibile })
            });

            if (!response.ok) throw new Error("Errore nell'aggiornamento della visibilità");

            // Aggiorna lo stato locale
            setMedia(prev => prev.map(m => 
                m.id === id ? { ...m, visibile, updatedAt: new Date().toISOString() } : m
            ));
            
            return { success: true };
        } catch (err) {
            console.error('Errore toggle visibilità:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * DELETE /api/media/:id
     * Elimina un media
     * @param {number} id - ID del media da eliminare
     */
    const deleteMedia = async (id) => {
        try {
            const response = await fetch(`/api/media/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Errore nell'eliminazione");

            setMedia(prev => prev.filter(m => m.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Errore eliminazione media:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * PATCH /api/media/batch-visibility
     * Modifica la visibilità di più media contemporaneamente
     * @param {number[]} ids - Array di ID dei media
     * @param {boolean} visibile - Nuovo stato di visibilità
     */
    const batchToggleVisibility = async (ids, visibile) => {
        try {
            const response = await fetch("/api/media/batch-visibility", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, visibile })
            });

            if (!response.ok) throw new Error("Errore nell'aggiornamento batch");

            // Aggiorna lo stato locale
            const now = new Date().toISOString();
            setMedia(prev => prev.map(m => 
                ids.includes(m.id) ? { ...m, visibile, updatedAt: now } : m
            ));
            
            return { success: true };
        } catch (err) {
            console.error('Errore batch toggle visibilità:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        media,
        isLoading,
        error,
        fetchMedia,
        uploadMedia,
        toggleVisibility,
        deleteMedia,
        batchToggleVisibility
    };
}