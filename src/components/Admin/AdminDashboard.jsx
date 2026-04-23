// AdminDashboard.jsx - Versione completa e funzionante
import React, { useState, useEffect, useCallback } from 'react';
import "../../styles/global.css";

// ============================================
// API BASE
// ============================================
const API_BASE = '/api';

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
            setMedia(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadMedia = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/media`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Errore upload');
            const result = await res.json();
            setMedia(prev => [...result.data, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const deleteMedia = async (id) => {
        try {
            await fetch(`${API_BASE}/media/${id}`, { method: 'DELETE' });
            setMedia(prev => prev.filter(m => m.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return { media, isLoading, error, fetchMedia, uploadMedia, deleteMedia };
}

function useProgetti() {
    const [progetti, setProgetti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({ nome: '', slug: '', descrizione: '', copertina: '' });

    const fetchProgetti = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (!res.ok) throw new Error('Errore caricamento progetti');
            setProgetti(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createProgetto = async (data) => {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Errore creazione');
        const newProject = await res.json();
        setProgetti(prev => [...prev, newProject.data]);
    };

    const updateProgetto = async (id, data) => {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...data })
        });
        if (!res.ok) throw new Error('Errore aggiornamento');
        setProgetti(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const deleteProgetto = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo progetto?')) return;
        await fetch(`${API_BASE}/projects`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        setProgetti(prev => prev.filter(p => p.id !== id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'nome' && !editingProject) {
            const slug = value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingProject) {
            await updateProgetto(editingProject.id, formData);
        } else {
            await createProgetto(formData);
        }
        setFormData({ nome: '', slug: '', descrizione: '', copertina: '' });
        setEditingProject(null);
        setShowForm(false);
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            nome: project.nome,
            slug: project.slug,
            descrizione: project.descrizione || '',
            copertina: project.copertina || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingProject(null);
        setFormData({ nome: '', slug: '', descrizione: '', copertina: '' });
        setShowForm(false);
    };

    useEffect(() => {
        fetchProgetti();
    }, [fetchProgetti]);

    return {
        progetti, isLoading, error, showForm, editingProject, formData,
        handleInputChange, handleSubmit, handleEdit, handleDelete: deleteProgetto,
        setShowForm, resetForm, fetchProgetti
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
// GESTIONE PROGETTI (CON MODIFICA FUNZIONANTE)
// ============================================
function GestioneProgetti() {
    const { 
        progetti, isLoading, showForm, editingProject, formData, 
        handleInputChange, handleSubmit, handleEdit, handleDelete, 
        setShowForm, resetForm, fetchProgetti 
    } = useProgetti();

    if (isLoading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento...</div></Panel>;

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
                                <td className="py-3 text-gray-500">{progetto.copertina || '—'}</td>
                                <td className="py-3">
                                    <button onClick={() => handleEdit(progetto)} className="text-red-600 hover:text-red-500 mr-3" title="Modifica">✎</button>
                                    <button onClick={() => handleDelete(progetto.id)} className="text-red-600 hover:text-red-500" title="Elimina">🗑</button>
                                </td>
                            </tr>
                        ))}
                        {progetti.length === 0 && (
                            <tr><td colSpan="5" className="py-8 text-center text-gray-500">Nessun progetto</td></tr>
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
                            <input name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome progetto" className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Slug *</label>
                            <input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="slug-del-progetto" className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                            <textarea name="descrizione" value={formData.descrizione} onChange={handleInputChange} placeholder="Descrizione del progetto" rows="3" className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white resize-y" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Copertina</label>
                            <input name="copertina" value={formData.copertina} onChange={handleInputChange} placeholder="nome-file.jpg" className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingProject ? 'Aggiorna' : 'Crea'}</button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Annulla</button>
                        </div>
                    </form>
                </div>
            )}
        </Panel>
    );
}

// ============================================
// GESTIONE MEDIA (CON VISUALIZZAZIONE IMMAGINI)
// ============================================
function GestioneMedia() {
    const [progetti, setProgetti] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [previewMedia, setPreviewMedia] = useState(null);
    const { media, isLoading, fetchMedia, uploadMedia, deleteMedia } = useMedia();

    useEffect(() => {
        fetchMedia();
        fetch(`${API_BASE}/projects`).then(res => res.json()).then(setProgetti);
    }, [fetchMedia]);

    const handleUpload = async (files) => {
        if (!selectedProject) { alert('Seleziona un progetto'); return; }
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('files', f));
        formData.append('idProgetto', selectedProject);
        await uploadMedia(formData);
    };

    const openPreview = (item) => {
        setPreviewMedia(item);
    };

    const closePreview = () => {
        setPreviewMedia(null);
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
                    <span className="text-xs text-gray-400 truncate flex-1">{item.nome}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }} 
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
                            <p className="text-gray-400 text-xs mt-1">Progetto: {progetti.find(p => p.id === item.idProgetto)?.nome || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) return <Panel><div className="text-center py-12 text-gray-500">Caricamento...</div></Panel>;

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
                    <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white mb-3">
                        <option value="">Seleziona progetto</option>
                        {progetti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                    <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleUpload(e.target.files)} disabled={!selectedProject}
                        className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:hover:bg-red-700 file:cursor-pointer" />
                    <p className="text-xs text-gray-600 mt-2">📷 Clicca sulla card per visualizzare l'immagine/video</p>
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
                    <div className="text-center py-8 text-gray-500">Nessun media caricato</div>
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
function GestioneHomepage() {
    const [progetti, setProgetti] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/projects`).then(res => res.json()).then(data => {
            setProgetti(data);
            setSelectedIds(data.filter(p => p.homepage).map(p => p.id));
            setLoading(false);
        });
    }, []);

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
        await fetch(`${API_BASE}/projects/homepage`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectIds: selectedIds })
        });
        alert('Configurazione salvata!');
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
                                <div>
                                    <div className="text-white text-sm">{p.nome}</div>
                                    <div className="text-xs text-gray-500">{p.descrizione?.slice(0, 50)}</div>
                                </div>
                                <button onClick={() => toggleProject(p.id)} className="px-3 py-1 text-sm bg-red-600/20 text-red-600 rounded border border-red-600/30">+ Seleziona</button>
                            </div>
                        ))}
                        {availableProjects.length === 0 && <div className="text-center py-8 text-gray-500">Tutti i progetti sono in homepage</div>}
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
                                    <span className="text-white text-sm">{p.nome}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30">↑</button>
                                    <button onClick={() => moveDown(idx)} disabled={idx === selectedIds.length - 1} className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30">↓</button>
                                    <button onClick={() => toggleProject(p.id)} className="px-2 py-1 text-red-600">✕</button>
                                </div>
                            </div>
                        ))}
                        {selectedIds.length === 0 && <div className="text-center py-8 text-gray-500">Nessun progetto selezionato</div>}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-red-900/30 flex justify-between items-center">
                <span className="text-sm text-gray-500">{selectedIds.length} progetti selezionati</span>
                <button onClick={saveHomepage} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">💾 Salva</button>
            </div>
        </Panel>
    );
}

// ============================================
// DASHBOARD PRINCIPALE
// ============================================
export default function AdminDashboard() {
    const [page, setPage] = useState('Gestione Progetti');

    const pages = {
        'Gestione Progetti': <GestioneProgetti />,
        'Gestione Media': <GestioneMedia />,
        'Gestione Homepage': <GestioneHomepage />
    };

    const buttons = {
        'Gestione Progetti': () => {},
        'Gestione Media': () => {},
        'Gestione Homepage': () => {}
    };

    const pageIcon = { 'Gestione Progetti': '📊', 'Gestione Media': '🎬', 'Gestione Homepage': '🏠' };

    return (
        <div className="min-h-screen bg-[rgb(19,19,19)] text-white flex">
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