// hooks/useProgetti.js
import { useState, useEffect, useCallback } from 'react';
import { create, destroy, getAll, update } from '../../../scripts/progettiApi.js';
const INITIAL_FORM_STATE = {
    nome: '',
    slug: '',
    copertina: ''
};

export function useProgetti() {
    const [progetti, setProgetti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // ==================== API CALLS - DA IMPLEMENTARE ====================
    
    /**
     * GET /api/projects
     * Ottiene tutti i progetti dal database
     */
    const fetchProgetti = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const data = await getAll();
            setProgetti(data);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Errore fetch progetti:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * POST /api/projects
     * Crea un nuovo progetto
     * @param {Object} projectData - Dati del progetto da creare
     */
    const createProgetto = async (projectData) => {
        try {
            const newProject = await create(projectData);
            setProgetti(prev => [...prev, newProject.data]);
            return { success: true };
        } catch (err) {
            console.error('Errore creazione progetto:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * PUT /api/projects
     * Aggiorna un progetto esistente
     * @param {number} id - ID del progetto da aggiornare
     * @param {Object} projectData - Nuovi dati del progetto
     */
    const updateProgetto = async (id, projectData) => {
        try {
            const updatedProject = await update(id, projectData);
            setProgetti(prev => prev.map(p =>
                p.id === id ? { ...p, ...projectData } : p
            ));
            return { success: true };
        } catch (err) {
            console.error('Errore aggiornamento progetto:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * DELETE /api/projects
     * Elimina un progetto
     * @param {number} id - ID del progetto da eliminare
     */
    const deleteProgetto = async (id) => {
        try {
            const response = await destroy(id);
            setProgetti(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Errore eliminazione progetto:', err);
            return { success: false, error: err.message };
        }
    };

    // ==================== HANDLERS ====================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Genera slug automaticamente dal nome (solo per nuovi progetti)
        if (name === 'nome' && !editingProject) {
            const slug = value
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (editingProject) {
            result = await updateProgetto(editingProject.id, formData);
        } else {
            result = await createProgetto(formData);
        }

        if (result.success) {
            setFormData(INITIAL_FORM_STATE);
            setEditingProject(null);
            setShowForm(false);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            nome: project.nome,
            descrizione: project.descrizione,
            slug: project.slug,
            copertina: project.copertina || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (project) => {
        if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project.nome}"?`)) {
            await deleteProgetto(project.id);
        }
    };

    const handleDuplicate = async (project) => {
        const { id, ...projectData } = project;
        const duplicatedProject = {
            ...projectData,
            nome: `${project.nome} (copia)`,
            slug: `${project.slug}-copia`
        };
        
        await createProgetto(duplicatedProject);
    };

    const resetForm = () => {
        setEditingProject(null);
        setFormData(INITIAL_FORM_STATE);
        setShowForm(!showForm);
    };

    // Carica progetti all'avvio
    useEffect(() => {
        fetchProgetti();
    }, [fetchProgetti]);

    return {
        // Stati
        progetti,
        isLoading,
        error,
        showForm,
        editingProject,
        formData,
        
        // Handlers
        handleInputChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleDuplicate,
        resetForm,
        fetchProgetti
    };
}