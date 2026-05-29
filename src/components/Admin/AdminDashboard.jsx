// AdminDashboard.jsx - Versione completa con Alert personalizzato e Gestione Categorie
import React, { useState, useEffect, useCallback } from 'react';
import "../../styles/global.css";

// ============================================
// API BASE
// ============================================
const API_BASE = '/api';

// ============================================
// COMPONENTE ALERT PERSONALIZZATO
// ============================================
function CustomAlert({ message, type, onClose }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    const alertStyles = {
        success: 'bg-green-600/20 border-green-600/30 text-green-400',
        error: 'bg-red-600/20 border-red-600/30 text-red-400',
        info: 'bg-blue-600/20 border-blue-600/30 text-blue-400',
        warning: 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400'
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className={`${alertStyles[type]} border rounded-lg p-4 min-w-75 max-w-md shadow-lg backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                    <div className="text-xl">{icons[type]}</div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook per gestire gli alert
function useAlert() {
    const [alert, setAlert] = useState({ message: '', type: 'info' });

    const showAlert = (message, type = 'info') => {
        setAlert({ message, type });
    };

    const hideAlert = () => {
        setAlert({ message: '', type: 'info' });
    };

    return { alert, showAlert, hideAlert };
}

// ============================================
// HOOK PERSONALIZZATI
// ============================================

function useMedia() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/media`);
            if (!res.ok) throw new Error('Errore caricamento media');
            const data = await res.json();
            setMedia(Array.isArray(data) ? data : []);
            return { success: true };
        } catch (err) {
            setError(err.message);
            setMedia([]);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadMedia = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/media`, { 
                method: 'POST', 
                body: formData 
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore upload');
            }
            
            const result = await res.json();
            if (result.success && result.data) {
                setMedia(prev => [...result.data, ...prev]);
            }
            return { success: true, message: 'File caricati con successo!' };
        } catch (err) {
            console.error('Upload error:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteMedia = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/media/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Errore eliminazione');
            setMedia(prev => prev.filter(m => m.id !== id));
            return { success: true, message: 'Media eliminato con successo!' };
        } catch (err) {
            console.error('Delete error:', err);
            return { success: false, error: err.message };
        }
    };

    return { media, isLoading, error, fetchMedia, uploadMedia, deleteMedia };
}

function useCategorie(showAlert) {
    const [categorie, setCategorie] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategorie = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (!res.ok) throw new Error('Errore caricamento categorie');
            const data = await res.json();
            setCategorie(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setCategorie([]);
            showAlert?.(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        fetchCategorie();
    }, [fetchCategorie]);

    return { categorie, isLoading, fetchCategorie };
}

function useProgetti(showAlert) {
    const [progetti, setProgetti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({ 
        nome: '', 
        slug: '', 
        descrizione: '', 
        copertina: '',
        idCategoria: ''
    });

    const fetchProgetti = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (!res.ok) throw new Error('Errore caricamento progetti');
            const data = await res.json();
            setProgetti(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            setProgetti([]);
            showAlert?.(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showAlert]);

    const createProgetto = async (data) => {
        try {
            // Prepare data - convert empty idCategoria to null
            const projectData = {
                ...data,
                idCategoria: data.idCategoria === '' || data.idCategoria === 'null' ? null : parseInt(data.idCategoria)
            };

            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || 'Errore creazione');
            }
            const newProject = await res.json();
            setProgetti(prev => [...prev, newProject]);
            showAlert?.(`Progetto "${data.nome}" creato con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Create error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const updateProgetto = async (id, data) => {
        try {
            const projectData = {
                ...data,
                idCategoria: data.idCategoria === '' || data.idCategoria === 'null' ? null : parseInt(data.idCategoria)
            };

            const res = await fetch(`${API_BASE}/projects`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...projectData })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || 'Errore aggiornamento');
            }
            const updatedProject = await res.json();
            setProgetti(prev => prev.map(p => p.id === id ? updatedProject : p));
            showAlert?.(`Progetto "${data.nome}" aggiornato con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Update error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const deleteProgetto = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo progetto?')) return;
        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || 'Errore eliminazione');
            }
            setProgetti(prev => prev.filter(p => p.id !== id));
            showAlert?.('Progetto eliminato con successo!', 'success');
            return { success: true };
        } catch (err) {
            console.error('Delete error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'nome' && !editingProject) {
            const slug = value.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
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
            setFormData({ nome: '', slug: '', descrizione: '', copertina: '', idCategoria: '' });
            setEditingProject(null);
            setShowForm(false);
            await fetchProgetti();
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            nome: project.nome,
            slug: project.slug,
            descrizione: project.descrizione || '',
            copertina: project.copertina || '',
            idCategoria: project.idCategoria?.toString() || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingProject(null);
        setFormData({ nome: '', slug: '', descrizione: '', copertina: '', idCategoria: '' });
        setShowForm(false);
    };

    useEffect(() => {
        fetchProgetti();
    }, [fetchProgetti]);

    return {
        progetti, isLoading, error, showForm, editingProject, formData,
        handleInputChange, handleSubmit, handleEdit, deleteProgetto,
        setShowForm, resetForm, fetchProgetti
    };
}

// ============================================
// HOOK PER GESTIONE CATEGORIE (CRUD completo)
// ============================================
function useCategorieManagement(showAlert) {
    const [categorie, setCategorie] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [formData, setFormData] = useState({ nome: '' });

    const fetchCategorie = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (!res.ok) throw new Error('Errore caricamento categorie');
            const data = await res.json();
            setCategorie(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setCategorie([]);
            showAlert?.(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showAlert]);

    const createCategoria = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore creazione');
            }
            await fetchCategorie();
            showAlert?.(`Categoria "${data.nome}" creata con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Create error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const updateCategoria = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore aggiornamento');
            }
            await fetchCategorie();
            showAlert?.(`Categoria "${data.nome}" aggiornata con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Update error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const deleteCategoria = async (id, nome) => {
        if (!window.confirm(`Sei sicuro di voler eliminare la categoria "${nome}"?`)) return;
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore eliminazione');
            }
            await fetchCategorie();
            showAlert?.(`Categoria "${nome}" eliminata con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Delete error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (editingCategoria) {
            result = await updateCategoria(editingCategoria.id, formData);
        } else {
            result = await createCategoria(formData);
        }
        
        if (result.success) {
            setFormData({ nome: '' });
            setEditingCategoria(null);
            setShowForm(false);
        }
    };

    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setFormData({ nome: categoria.nome });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingCategoria(null);
        setFormData({ nome: '' });
        setShowForm(false);
    };

    useEffect(() => {
        fetchCategorie();
    }, [fetchCategorie]);

    return {
        categorie, isLoading, showForm, editingCategoria, formData,
        handleInputChange, handleSubmit, handleEdit, deleteCategoria,
        setShowForm, resetForm
    };
}

// ============================================
// COMPONENTI COMUNI
// ============================================

function Panel({ children, className = '' }) {
    return (
        <div className={`bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg p-6 ${className}`}>
            {children}
        </div>
    );
}

function Sidebar({ buttons, setPage, currentPage }) {
    return (
        <aside className="w-64 h-screen bg-black border-r border-red-900/30 fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-red-900/30">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-white font-bold">UG Admin</span>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3">
                {Object.entries(buttons).map(([label, onClick]) => (
                    <button
                        key={label}
                        onClick={() => { onClick(); setPage(label); }}
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${currentPage === label ? 'bg-red-600/20 text-red-600 border border-red-600/30' : 'text-gray-400 hover:text-white hover:bg-red-600/10'}`}
                    >
                        {label}
                    </button>
                ))}
                <div className="mt-4 pt-4 border-t border-red-900/30">
                    <button onClick={() => window.location.href = '/'} className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/10">← Torna alla home</button>
                    <button onClick={() => { fetch('api/logout', { method: 'POST' }).then(() => window.location.href = '/login'); }} className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-600/10 mt-1">Disconnetti</button>
                </div>
            </nav>
        </aside>
    );
}

// ============================================
// GESTIONE PROGETTI (con categoria)
// ============================================
function GestioneProgetti({ showAlert }) {
    const { 
        progetti, isLoading, showForm, editingProject, formData, 
        handleInputChange, handleSubmit, handleEdit, deleteProgetto, 
        setShowForm, resetForm, fetchProgetti 
    } = useProgetti(showAlert);
    
    const { categorie, isLoading: isLoadingCategorie } = useCategorie(showAlert);

    // Helper per ottenere il nome della categoria
    const getCategoriaNome = (idCategoria) => {
        if (!idCategoria) return <span className="text-gray-500 text-xs">—</span>;
        const categoria = categorie.find(c => c.id === idCategoria);
        return categoria ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                🏷️ {categoria.nome}
            </span>
        ) : <span className="text-gray-500 text-xs">ID: {idCategoria}</span>;
    };

    if (isLoading || isLoadingCategorie) return <Panel><div className="text-center py-12 text-gray-500">Caricamento...</div></Panel>;

    return (
        <Panel>
            <div className="flex justify-between items-center mb-6">
                <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">{progetti.length} progetti</span>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    {showForm ? '✕ Chiudi' : '+ Nuovo Progetto'}
                </button>
            </div>

            {/* Tabella progetti */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-red-900/30">
                        <tr className="text-left text-gray-400">
                            <th className="pb-3 font-medium">ID</th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Slug</th>
                            <th className="pb-3 font-medium">Categoria</th>
                            <th className="pb-3 font-medium">Copertina</th>
                            <th className="pb-3 font-medium">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {progetti.map((progetto) => (
                            <tr key={progetto.id} className="border-b border-red-900/20 hover:bg-red-600/5">
                                <td className="py-3 text-gray-400">{progetto.id}</td>
                                <td className="py-3"><span className="text-white font-medium">{progetto.nome}</span></td>
                                <td className="py-3"><span className="text-gray-400 text-xs">/{progetto.slug}</span></td>
                                <td className="py-3">{getCategoriaNome(progetto.idCategoria)}</td>
                                <td className="py-3 text-gray-500">{progetto.copertina || '—'}</td>
                                <td className="py-3">
                                    <button onClick={() => handleEdit(progetto)} className="text-red-600 hover:text-red-500 mr-3" title="Modifica">✎</button>
                                    <button onClick={() => deleteProgetto(progetto.id)} className="text-red-600 hover:text-red-500" title="Elimina">🗑</button>
                                </td>
                            </tr>
                        ))}
                        {progetti.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">Nessun progetto</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form di modifica/creazione */}
            {showForm && (
                <div className="mt-6 pt-6 border-t border-red-900/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium">{editingProject ? '✎ Modifica Progetto' : '➕ Nuovo Progetto'}</h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nome Progetto *</label>
                            <input 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleInputChange} 
                                placeholder="Nome progetto" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Slug *</label>
                            <input 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleInputChange} 
                                placeholder="slug-del-progetto" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                            <select 
                                name="idCategoria" 
                                value={formData.idCategoria} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white"
                            >
                                <option value="">— Nessuna categoria —</option>
                                {categorie.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>
                                        🏷️ {categoria.nome}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Puoi gestire le categorie nella sezione "Gestione Categorie"
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                            <textarea 
                                name="descrizione" 
                                value={formData.descrizione} 
                                onChange={handleInputChange} 
                                placeholder="Descrizione del progetto" 
                                rows="3" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white resize-y" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Copertina</label>
                            <input 
                                name="copertina" 
                                value={formData.copertina} 
                                onChange={handleInputChange} 
                                placeholder="URL copertina o nome file" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                {editingProject ? 'Aggiorna' : 'Crea'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                                Annulla
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Panel>
    );
}

// ============================================
// GESTIONE RECENSIONI
// ============================================

// Hook per gestire le recensioni
function useRecensioni(showAlert) {
    const [recensioni, setRecensioni] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRecensione, setEditingRecensione] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        qualifica: '',
        recensione: ''
    });

    const fetchRecensioni = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/feedbacks`);
            if (!res.ok) throw new Error('Errore caricamento recensioni');
            const data = await res.json();
            setRecensioni(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setRecensioni([]);
            showAlert?.(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showAlert]);

    const createRecensione = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore creazione recensione');
            }
            await fetchRecensioni();
            showAlert?.('Recensione creata con successo!', 'success');
            return { success: true };
        } catch (err) {
            console.error('Create error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const updateRecensione = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/feedbacks`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore aggiornamento recensione');
            }
            await fetchRecensioni();
            showAlert?.('Recensione aggiornata con successo!', 'success');
            return { success: true };
        } catch (err) {
            console.error('Update error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const deleteRecensione = async (id, nome) => {
        if (!window.confirm(`Sei sicuro di voler eliminare la recensione di "${nome}"?`)) return;
        try {
            const res = await fetch(`${API_BASE}/feedbacks`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Errore eliminazione recensione');
            }
            await fetchRecensioni();
            showAlert?.(`Recensione di "${nome}" eliminata con successo!`, 'success');
            return { success: true };
        } catch (err) {
            console.error('Delete error:', err);
            showAlert?.(err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome.trim()) {
            showAlert?.('Il nome è obbligatorio', 'warning');
            return;
        }
        if (!formData.recensione.trim()) {
            showAlert?.('La recensione è obbligatoria', 'warning');
            return;
        }
        
        let result;
        if (editingRecensione) {
            result = await updateRecensione(editingRecensione.id, formData);
        } else {
            result = await createRecensione(formData);
        }
        
        if (result.success) {
            setFormData({ nome: '', qualifica: '', recensione: '' });
            setEditingRecensione(null);
            setShowForm(false);
        }
    };

    const handleEdit = (recensione) => {
        setEditingRecensione(recensione);
        setFormData({
            nome: recensione.nome || '',
            qualifica: recensione.qualifica || '',
            recensione: recensione.recensione || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingRecensione(null);
        setFormData({ nome: '', qualifica: '', recensione: '' });
        setShowForm(false);
    };

    useEffect(() => {
        fetchRecensioni();
    }, [fetchRecensioni]);

    return {
        recensioni, isLoading, showForm, editingRecensione, formData,
        handleInputChange, handleSubmit, handleEdit, deleteRecensione,
        setShowForm, resetForm, fetchRecensioni
    };
}

function GestioneRecensioni({ showAlert }) {
    const {
        recensioni, isLoading, showForm, editingRecensione, formData,
        handleInputChange, handleSubmit, handleEdit, deleteRecensione,
        setShowForm, resetForm
    } = useRecensioni(showAlert);

    // Funzione per troncare il testo
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (isLoading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento recensioni...</div></Panel>;

    return (
        <Panel>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        ⭐ {recensioni.length} recensioni
                    </span>
                    <span className="text-xs text-gray-500">
                        Gestisci le recensioni dei clienti
                    </span>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                    {showForm ? '✕ Chiudi' : '+ Nuova Recensione'}
                </button>
            </div>

            {/* Tabella recensioni */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-red-900/30">
                        <tr className="text-left text-gray-400">
                            <th className="pb-3 font-medium w-16">ID</th>
                            <th className="pb-3 font-medium w-48">Cliente</th>
                            <th className="pb-3 font-medium w-48">Qualifica</th>
                            <th className="pb-3 font-medium">Recensione</th>
                            <th className="pb-3 font-medium w-24">Azioni</th>
                         </tr>
                    </thead>
                    <tbody>
                        {recensioni.map((recensione) => (
                            <tr key={recensione.id} className="border-b border-red-900/20 hover:bg-red-600/5">
                                <td className="py-3 text-gray-400 align-top">{recensione.id}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">👤</span>
                                        <span className="text-white font-medium">{recensione.nome || '—'}</span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    {recensione.qualifica ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                                            💼 {recensione.qualifica}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 text-xs">—</span>
                                    )}
                                </td>
                                <td className="py-3">
                                    <div className="text-gray-300 max-w-md">
                                        "{truncateText(recensione.recensione, 80)}"
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEdit(recensione)} 
                                            className="text-red-600 hover:text-red-500 p-1" 
                                            title="Modifica"
                                        >
                                            ✎
                                        </button>
                                        <button 
                                            onClick={() => deleteRecensione(recensione.id, recensione.nome)} 
                                            className="text-red-600 hover:text-red-500 p-1" 
                                            title="Elimina"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {recensioni.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    Nessuna recensione presente
                                    <div className="text-xs mt-1 text-gray-600">
                                        Clicca "+ Nuova Recensione" per aggiungerne una
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form di modifica/creazione */}
            {showForm && (
                <div className="mt-6 pt-6 border-t border-red-900/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <span>⭐</span>
                            {editingRecensione ? '✎ Modifica Recensione' : '➕ Nuova Recensione'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Nome Cliente *
                            </label>
                            <input 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleInputChange} 
                                placeholder="es: Mario Rossi" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                                required 
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Qualifica / Ruolo
                                <span className="text-xs text-gray-500 ml-2">(opzionale - es: CEO, Fondatore, Designer)</span>
                            </label>
                            <input 
                                name="qualifica" 
                                value={formData.qualifica || ''} 
                                onChange={handleInputChange} 
                                placeholder="es: CEO di Azienda S.r.l." 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Recensione *
                            </label>
                            <textarea 
                                name="recensione" 
                                value={formData.recensione || ''} 
                                onChange={handleInputChange} 
                                placeholder="Scrivi qui la recensione del cliente..." 
                                rows="4"
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white resize-y" 
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Consiglio: mantieni la recensione concisa ma significativa
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                {editingRecensione ? 'Aggiorna Recensione' : 'Crea Recensione'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                                Annulla
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Panel>
    );
}

// ============================================
// GESTIONE CATEGORIE
// ============================================
function GestioneCategorie({ showAlert }) {
    const { 
        categorie, isLoading, showForm, editingCategoria, formData,
        handleInputChange, handleSubmit, handleEdit, deleteCategoria,
        setShowForm, resetForm
    } = useCategorieManagement(showAlert);

    if (isLoading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento...</div></Panel>;

    return (
        <Panel>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        {categorie.length} categorie
                    </span>
                    <span className="text-xs text-gray-500">
                        🏷️ Gestisci le categorie per i tuoi progetti
                    </span>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    {showForm ? '✕ Chiudi' : '+ Nuova Categoria'}
                </button>
            </div>

            {/* Tabella categorie */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-red-900/30">
                        <tr className="text-left text-gray-400">
                            <th className="pb-3 font-medium w-16">ID</th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium w-32">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorie.map((categoria) => (
                            <tr key={categoria.id} className="border-b border-red-900/20 hover:bg-red-600/5">
                                <td className="py-3 text-gray-400">{categoria.id}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🏷️</span>
                                        <span className="text-white font-medium">{categoria.nome}</span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <button 
                                        onClick={() => handleEdit(categoria)} 
                                        className="text-red-600 hover:text-red-500 mr-3" 
                                        title="Modifica"
                                    >
                                        ✎
                                    </button>
                                    <button 
                                        onClick={() => deleteCategoria(categoria.id, categoria.nome)} 
                                        className="text-red-600 hover:text-red-500" 
                                        title="Elimina"
                                    >
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categorie.length === 0 && (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-gray-500">
                                    Nessuna categoria presente
                                    <div className="text-xs mt-1 text-gray-600">
                                        Clicca "+ Nuova Categoria" per aggiungerne una
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form di modifica/creazione */}
            {showForm && (
                <div className="mt-6 pt-6 border-t border-red-900/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <span>🏷️</span>
                            {editingCategoria ? '✎ Modifica Categoria' : '➕ Nuova Categoria'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Nome Categoria *
                                {!editingCategoria && (
                                    <span className="text-xs text-gray-500 ml-2">(es: Frontend, Backend, Design)</span>
                                )}
                            </label>
                            <input 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleInputChange} 
                                placeholder="Inserisci il nome della categoria" 
                                className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" 
                                required 
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                {editingCategoria ? 'Aggiorna' : 'Crea'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                                Annulla
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Panel>
    );
}

// ============================================
// GESTIONE MEDIA
// ============================================
function GestioneMedia({ showAlert }) {
    const [progetti, setProgetti] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [previewMedia, setPreviewMedia] = useState(null);
    const { media, isLoading, fetchMedia, uploadMedia, deleteMedia } = useMedia();

    useEffect(() => {
        fetchMedia();
        fetch(`${API_BASE}/projects`)
            .then(res => res.json())
            .then(data => setProgetti(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error('Error fetching projects:', err);
                showAlert('Errore nel caricamento dei progetti', 'error');
            });
    }, [fetchMedia, showAlert]);

    const handleUpload = async (files) => {
        if (!selectedProject) { 
            showAlert('Seleziona un progetto prima di caricare i file', 'warning');
            return; 
        }
        
        if (!files || files.length === 0) return;
        
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('files', f));
        formData.append('idProgetto', selectedProject);
        
        const result = await uploadMedia(formData);
        if (!result.success) {
            showAlert(result.error || 'Errore durante l\'upload', 'error');
        } else {
            showAlert(`${files.length} file caricati con successo!`, 'success');
            await fetchMedia();
        }
    };

    const openPreview = (item) => {
        setPreviewMedia(item);
    };

    const closePreview = () => {
        setPreviewMedia(null);
    };

    const handleDeleteMedia = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Sei sicuro di voler eliminare questo media?')) {
            const result = await deleteMedia(id);
            if (!result.success) {
                showAlert(result.error, 'error');
            } else {
                showAlert('Media eliminato con successo!', 'success');
            }
        }
    };

    // Card media con anteprima cliccabile
    const MediaCard = ({ item, progetto }) => (
        <div className="bg-black border border-red-900/30 rounded-lg overflow-hidden cursor-pointer hover:border-red-600/50 transition-colors" onClick={() => openPreview(item)}>
            <div className="aspect-video bg-[rgb(19,19,19)] flex items-center justify-center">
                {item.secureUrl ? (
                    item.tipo === 'video' ? (
                        <video src={item.secureUrl} className="w-full h-full object-cover" />
                    ) : (
                        <img src={item.secureUrl} alt={item.nome} className="w-full h-full object-cover" />
                    )
                ) : (
                    <span className="text-3xl text-gray-600">{item.tipo === 'video' ? '🎥' : '🖼️'}</span>
                )}
            </div>
            <div className="p-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 truncate flex-1" title={item.nome}>{item.nome}</span>
                    <button 
                        onClick={(e) => handleDeleteMedia(item.id, e)} 
                        className="text-red-600 hover:text-red-500 text-sm ml-2"
                        title="Elimina"
                    >
                        🗑
                    </button>
                </div>
                {progetto && <div className="text-[10px] text-gray-600 mt-1">{progetto.nome}</div>}
            </div>
        </div>
    );

    // Modal per anteprima
    const PreviewModal = ({ item, onClose }) => {
        if (!item) return null;
        const project = progetti.find(p => p.id === item.idProgetto);
        
        return (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                        <button onClick={onClose} className="absolute -top-10 right-0 text-white text-2xl hover:text-red-600">✕</button>
                        {item.tipo === 'video' ? (
                            <video src={item.secureUrl} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" />
                        ) : (
                            <img src={item.secureUrl} alt={item.nome} className="max-w-full max-h-[80vh] rounded-lg" />
                        )}
                        <div className="mt-3 text-center text-white text-sm">
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-gray-400 text-xs mt-1">
                                Tipo: {item.tipo === 'video' ? 'Video' : 'Immagine'} | 
                                Progetto: {project?.nome || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento media...</div></Panel>;

    // Raggruppa per progetto
    const progettiMap = progetti.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    const mediaByProject = media.reduce((acc, item) => {
        const pid = item.idProgetto;
        if (!acc[pid]) acc[pid] = { progetto: progettiMap[pid], items: [] };
        acc[pid].items.push(item);
        return acc;
    }, {});

    return (
        <Panel>
            <div className="space-y-4">
                {/* Upload area */}
                <div className="bg-black border border-red-900/30 rounded-lg p-4">
                    <select 
                        value={selectedProject} 
                        onChange={(e) => setSelectedProject(e.target.value)} 
                        className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white mb-3"
                    >
                        <option value="">Seleziona progetto</option>
                        {progetti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        onChange={(e) => handleUpload(e.target.files)} 
                        disabled={!selectedProject}
                        className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:hover:bg-red-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <p className="text-xs text-gray-600 mt-2">
                        📷 Clicca sulla card per visualizzare l'immagine/video
                        <br />
                        💡 Massimo 20MB per immagini, 100MB per video
                    </p>
                </div>

                {/* Griglia media */}
                {Object.keys(mediaByProject).length > 0 ? (
                    Object.entries(mediaByProject).map(([pid, group]) => (
                        <div key={pid} className="bg-black/30 border border-red-900/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-900/30">
                                <span className="text-sm text-red-600">📁</span>
                                <span className="text-white font-medium">{group.progetto?.nome || 'Sconosciuto'}</span>
                                <span className="text-xs text-gray-500">{group.items.length} file</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {group.items.map(item => <MediaCard key={item.id} item={item} progetto={group.progetto} />)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {media.length === 0 ? 'Nessun media caricato' : 'Caricamento in corso...'}
                    </div>
                )}
            </div>

            {/* Modal anteprima */}
            <PreviewModal item={previewMedia} onClose={closePreview} />
        </Panel>
    );
}

// ============================================
// GESTIONE HOMEPAGE
// ============================================
function GestioneHomepage({ showAlert }) {
    const [progetti, setProgetti] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/projects`);
                const data = await res.json();
                setProgetti(Array.isArray(data) ? data : []);
                const homepageIds = (Array.isArray(data) ? data : [])
                    .filter(p => p.homepage === 1 || p.homepage === true)
                    .map(p => p.id);
                setSelectedIds(homepageIds);
            } catch (err) {
                console.error('Error fetching projects:', err);
                showAlert('Errore nel caricamento dei progetti', 'error');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [showAlert]);

    const toggleProject = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newIds = [...selectedIds];
        [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
        setSelectedIds(newIds);
    };

    const moveDown = (index) => {
        if (index === selectedIds.length - 1) return;
        const newIds = [...selectedIds];
        [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
        setSelectedIds(newIds);
    };

    const saveHomepage = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects/homepage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectIds: selectedIds })
            });
            
            if (!res.ok) throw new Error('Errore salvataggio');
            
            showAlert('Configurazione homepage salvata con successo!', 'success');
        } catch (err) {
            console.error('Save error:', err);
            showAlert(err.message, 'error');
        }
    };

    const selectedProjects = progetti.filter(p => selectedIds.includes(p.id));
    const availableProjects = progetti.filter(p => !selectedIds.includes(p.id));

    if (loading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento...</div></Panel>;

    return (
        <Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progetti disponibili */}
                <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">📋 Progetti Disponibili</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableProjects.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-black rounded border border-red-900/30">
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">{p.nome}</div>
                                    {p.descrizione && (
                                        <div className="text-xs text-gray-500 mt-1">{p.descrizione.slice(0, 60)}</div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => toggleProject(p.id)} 
                                    className="px-3 py-1 text-sm bg-red-600/20 text-red-600 rounded border border-red-600/30 hover:bg-red-600/30 transition-colors"
                                >
                                    + Seleziona
                                </button>
                            </div>
                        ))}
                        {availableProjects.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Tutti i progetti sono in homepage</div>
                        )}
                    </div>
                </div>

                {/* Progetti in homepage */}
                <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">🏠 Progetti in Homepage ({selectedIds.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedProjects.map((p, idx) => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-black rounded border border-red-900/30">
                                <div className="flex-1">
                                    <span className="text-gray-500 text-xs mr-2">#{idx + 1}</span>
                                    <span className="text-white text-sm font-medium">{p.nome}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => moveUp(idx)} 
                                        disabled={idx === 0} 
                                        className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Sposta su"
                                    >
                                        ↑
                                    </button>
                                    <button 
                                        onClick={() => moveDown(idx)} 
                                        disabled={idx === selectedIds.length - 1} 
                                        className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Sposta giù"
                                    >
                                        ↓
                                    </button>
                                    <button 
                                        onClick={() => toggleProject(p.id)} 
                                        className="px-2 py-1 text-red-600 hover:text-red-500 transition-colors"
                                        title="Rimuovi"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                        {selectedIds.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Nessun progetto selezionato per la homepage</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-red-900/30 flex justify-between items-center">
                <button 
                    onClick={saveHomepage} 
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    💾 Salva configurazione homepage
                </button>
            </div>
        </Panel>
    );
}

// ============================================
// DASHBOARD PRINCIPALE
// ============================================
export default function AdminDashboard() {
    const [page, setPage] = useState('Gestione Progetti');
    const { alert, showAlert, hideAlert } = useAlert();

    // Sostituisci la sezione pages con:
    const pages = {
        'Gestione Progetti': <GestioneProgetti showAlert={showAlert} />,
        'Gestione Media': <GestioneMedia showAlert={showAlert} />,
        'Gestione Homepage': <GestioneHomepage showAlert={showAlert} />,
        'Gestione Categorie': <GestioneCategorie showAlert={showAlert} />,
        'Gestione Recensioni': <GestioneRecensioni showAlert={showAlert} />
    };

    // Sostituisci la sezione buttons con:
    const buttons = {
        'Gestione Progetti': () => {},
        'Gestione Media': () => {},
        'Gestione Homepage': () => {},
        'Gestione Categorie': () => {},
        'Gestione Recensioni': () => {}
    };

    // Sostituisci la sezione pageIcon con:
    const pageIcon = { 
        'Gestione Progetti': '📊', 
        'Gestione Media': '🎬', 
        'Gestione Homepage': '🏠',
        'Gestione Categorie': '🏷️',
        'Gestione Recensioni': '⭐'
    };

    return (
        <div className="min-h-screen bg-[rgb(19,19,19)] text-white flex">
            <CustomAlert 
                message={alert.message} 
                type={alert.type} 
                onClose={hideAlert} 
            />
            <Sidebar buttons={buttons} setPage={setPage} currentPage={page} />
            <main className="flex-1 ml-64 min-h-screen p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span>{pageIcon[page]}</span> {page}
                    </h1>
                </div>
                {pages[page]}
            </main>
        </div>
    );
}