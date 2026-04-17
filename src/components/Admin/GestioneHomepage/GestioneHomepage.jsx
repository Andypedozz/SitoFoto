// GestioneHomepage.jsx
import { useState, useEffect } from "react";
import Panel from "../common/Panel";
import Table from "../common/Table";

export default function GestioneHomepage() {
    const [progetti, setProgetti] = useState([]);
    const [homepageProjects, setHomepageProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==================== API CALLS ====================
    
    // GET all projects
    const fetchProgetti = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            setProgetti(data);
            setHomepageProjects(data.filter(p => p.homepage));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // PUT update homepage projects
    const updateHomepageProjects = async (projectIds) => {
        try {
            const response = await fetch('/api/projects/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectIds })
            });
            
            // Aggiorna stato locale
            setProgetti(prev => prev.map(p => ({
                ...p,
                inHomepage: projectIds.includes(p.id)
            })));
            
            return { success: true };
        } catch (err) {
            console.error('Errore aggiornamento homepage:', err);
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchProgetti();
    }, []);

    // ==================== HANDLERS ====================

    const handleToggleProject = (projectId) => {
        setHomepageProjects(prev => {
            const isSelected = prev.some(p => p.id === projectId);
            if (isSelected) {
                return prev.filter(p => p.id !== projectId);
            } else {
                const projectToAdd = progetti.find(p => p.id === projectId);
                return [...prev, projectToAdd];
            }
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        const projectIds = homepageProjects.map(p => p.id);
        const result = await updateHomepageProjects(projectIds);
        
        if (result.success) {
            alert('Configurazione homepage salvata con successo!');
        } else {
            alert('Errore durante il salvataggio: ' + result.error);
        }
        setIsLoading(false);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newList = [...homepageProjects];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setHomepageProjects(newList);
    };

    const handleMoveDown = (index) => {
        if (index === homepageProjects.length - 1) return;
        const newList = [...homepageProjects];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        setHomepageProjects(newList);
    };

    // ==================== COLONNE TABELLA ====================

    const availableColumns = [
        {
            key: 'id',
            label: 'ID',
            type: 'number',
            width: '80px'
        },
        {
            key: 'nome',
            label: 'Nome Progetto',
            type: 'text',
            render: (value) => (
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="font-medium text-white">{value}</span>
                </div>
            )
        },
        {
            key: 'descrizione',
            label: 'Descrizione',
            type: 'text',
            render: (value) => (
                <span className="text-gray-300 text-sm line-clamp-2">{value}</span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => {
                const isSelected = homepageProjects.some(p => p.id === row.id);
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProject(row.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                            ${isSelected 
                                ? 'bg-red-600/20 text-red-600 border border-red-600/30 hover:bg-red-600/30' 
                                : 'bg-[rgb(19,19,19)] text-gray-400 border border-red-900/30 hover:text-white hover:border-red-600/50'
                            }`}
                    >
                        {isSelected ? '✓ Selezionato' : '+ Seleziona'}
                    </button>
                );
            }
        }
    ];

    // ==================== RENDERING ====================

    if (isLoading) {
        return (
            <Panel>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Caricamento progetti...</p>
                    </div>
                </div>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel>
                <div className="text-center py-12">
                    <span className="text-4xl block mb-3">⚠️</span>
                    <p className="text-red-500 mb-4">Errore: {error}</p>
                    <button
                        onClick={fetchProgetti}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Riprova
                    </button>
                </div>
            </Panel>
        );
    }

    return (
        <Panel>
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        {homepageProjects.length} progetti in homepage
                    </span>
                </div>
            </header>

            {/* Layout a due colonne */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonna sinistra - Progetti disponibili */}
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                        <span className="w-1.5 h-5 bg-red-600 rounded-full mr-2"></span>
                        Progetti Disponibili
                    </h2>
                    
                    <Table
                        columns={availableColumns}
                        data={progetti}
                        variant="compact"
                        striped={true}
                        hoverable={true}
                        rowsPerPage={5}
                        showPagination={true}
                    />
                </div>

                {/* Colonna destra - Progetti in homepage */}
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-white flex items-center">
                            <span className="w-1.5 h-5 bg-red-600 rounded-full mr-2"></span>
                            Progetti in Homepage
                        </h2>
                        
                        {homepageProjects.length === 0 && (
                            <span className="text-xs text-gray-500">Nessun progetto selezionato</span>
                        )}
                    </div>
                    
                    {homepageProjects.length > 0 ? (
                        <div className="space-y-3">
                            {homepageProjects.map((project, index) => (
                                <div
                                    key={project.id}
                                    className="group flex items-center justify-between p-4 bg-black border border-red-900/30 rounded-lg hover:border-red-600/50 transition-all duration-300"
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        <span className="text-gray-500 font-mono text-sm w-6">#{index + 1}</span>
                                        <div>
                                            <h3 className="text-white font-medium">{project.nome}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{project.descrizione}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className={`p-1.5 rounded-lg transition-colors
                                                ${index === 0 
                                                    ? 'text-gray-700 cursor-not-allowed' 
                                                    : 'text-gray-400 hover:text-white hover:bg-red-600/20'
                                                }`}
                                            title="Sposta su"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === homepageProjects.length - 1}
                                            className={`p-1.5 rounded-lg transition-colors
                                                ${index === homepageProjects.length - 1
                                                    ? 'text-gray-700 cursor-not-allowed' 
                                                    : 'text-gray-400 hover:text-white hover:bg-red-600/20'
                                                }`}
                                            title="Sposta giù"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => handleToggleProject(project.id)}
                                            className="p-1.5 text-red-600 hover:text-red-500 hover:bg-red-600/10 rounded-lg transition-colors"
                                            title="Rimuovi"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Anteprima ordine */}
                            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                                <p className="text-xs text-gray-400 flex items-center">
                                    <span className="mr-2">🔄</span>
                                    Ordine di visualizzazione: trascina o usa le frecce per riordinare
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <span className="text-4xl block mb-3 text-gray-600">🏠</span>
                            <p className="text-gray-500 text-sm">Nessun progetto selezionato per la homepage</p>
                            <p className="text-xs text-gray-700 mt-1">
                                Seleziona i progetti dalla lista a sinistra
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Barra di salvataggio */}
            <div className="mt-8 pt-4 border-t border-red-900/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>📊</span>
                    <span>{homepageProjects.length} progetti selezionati su {progetti.length} totali</span>
                </div>
                
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg
                             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300 flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Salvataggio...</span>
                        </>
                    ) : (
                        <>
                            <span>💾</span>
                            <span>Salva Configurazione Homepage</span>
                        </>
                    )}
                </button>
            </div>

            {/* Footer info */}
            <div className="mt-4 text-xs text-gray-700 flex justify-between">
                <span>I progetti appariranno in homepage nell'ordine mostrato sopra</span>
                <span className="text-red-600/50">massimo 6 progetti consigliati</span>
            </div>
        </Panel>
    );
}