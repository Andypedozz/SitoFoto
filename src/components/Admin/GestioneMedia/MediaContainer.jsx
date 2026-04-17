// MediaContainer.jsx
import MediaCard from './MediaCard';
import { useState, useEffect } from 'react';

export default function MediaContainer({ mediaItems, onDelete, onToggleVisibility, progetti }) {
    const [filterProject, setFilterProject] = useState("tutti");
    const [filterVisibility, setFilterVisibility] = useState("tutti");
    const [sortBy, setSortBy] = useState("data-desc");

    // Crea una mappa dei progetti per ID
    const progettiMap = progetti.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {});

    // Applica filtri
    const filteredByProject = filterProject === "tutti" 
        ? mediaItems 
        : mediaItems.filter(item => item.idProgetto === parseInt(filterProject));

    const filteredByVisibility = filterVisibility === "tutti"
        ? filteredByProject
        : filterVisibility === "visibili"
            ? filteredByProject.filter(item => item.visibile === 1 || item.visibile === true)
            : filteredByProject.filter(item => item.visibile === 0 || item.visibile === false);

    // Applica ordinamento
    const sortedItems = [...filteredByVisibility].sort((a, b) => {
        switch(sortBy) {
            case "data-desc":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "data-asc":
                return new Date(a.createdAt) - new Date(b.createdAt);
            case "nome-asc":
                return a.nome.localeCompare(b.nome);
            case "nome-desc":
                return b.nome.localeCompare(a.nome);
            default:
                return 0;
        }
    });

    // Raggruppa media per progetto
    const mediaByProject = sortedItems.reduce((acc, item) => {
        const projectId = item.idProgetto;
        if (!acc[projectId]) {
            acc[projectId] = {
                progetto: progettiMap[projectId],
                items: []
            };
        }
        acc[projectId].items.push(item);
        return acc;
    }, {});

    // Statistiche visibilità
    const visibleCount = mediaItems.filter(m => m.visibile === 1 || m.visibile === true).length;
    const hiddenCount = mediaItems.filter(m => m.visibile === 0 || m.visibile === false).length;

    return (
        <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                    Libreria Media ({filteredByVisibility.length})
                </h3>

                {/* Filtri e ordinamento */}
                <div className="flex items-center space-x-3">
                    {/* Filtro visibilità */}
                    <select
                        value={filterVisibility}
                        onChange={(e) => setFilterVisibility(e.target.value)}
                        className="px-3 py-1.5 bg-black border border-red-900/30 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-600"
                    >
                        <option value="tutti">📁 Tutti i media</option>
                        <option value="visibili">👁️ Visibili ({visibleCount})</option>
                        <option value="nascosti">👁️‍🗨️ Nascosti ({hiddenCount})</option>
                    </select>

                    {/* Filtro progetto */}
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="px-3 py-1.5 bg-black border border-red-900/30 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-600"
                    >
                        <option value="tutti">📁 Tutti i progetti</option>
                        {progetti.map(progetto => (
                            <option key={progetto.id} value={progetto.id}>
                                {progetto.nome}
                            </option>
                        ))}
                    </select>

                    {/* Ordinamento */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 bg-black border border-red-900/30 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-600"
                    >
                        <option value="data-desc">📅 Più recenti</option>
                        <option value="data-asc">📅 Meno recenti</option>
                        <option value="nome-asc">🔤 Nome A-Z</option>
                        <option value="nome-desc">🔤 Nome Z-A</option>
                    </select>
                </div>
            </div>

            {/* Griglia delle media card raggruppate per progetto */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-6 flex flex-col h-150">
                <div className="flex-1 overflow-y-auto pr-2">
                    {Object.keys(mediaByProject).length > 0 ? (
                        Object.entries(mediaByProject).map(([projectId, group]) => (
                            <div key={projectId} className="mb-6 last:mb-0">
                                {filterProject === "tutti" && (
                                    <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-black/90 py-2 z-10">
                                        <span className="text-sm text-red-600">📁</span>
                                        <h4 className="text-white font-medium">
                                            {group.progetto?.nome || 'Progetto sconosciuto'}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            ({group.items.length} file, {
                                                group.items.filter(i => i.visibile).length
                                            } visibili)
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {group.items.map((item) => (
                                        <MediaCard
                                            key={item.id}
                                            media={item}
                                            onDelete={onDelete}
                                            onToggleVisibility={onToggleVisibility}
                                            progetto={group.progetto}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <span className="text-4xl block mb-3 text-gray-600">📭</span>
                            <p className="text-gray-500 text-sm">Nessun media trovato</p>
                            <p className="text-xs text-gray-700 mt-1">
                                {filterProject === "tutti" 
                                    ? "Carica immagini o video utilizzando l'area di upload"
                                    : filterVisibility !== "tutti"
                                        ? "Nessun media con questo filtro di visibilità"
                                        : "Nessun media per questo progetto"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Riepilogo visibilità */}
            <div className="mt-4 pt-4 border-t border-red-900/30">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-500">
                            Totale: <span className="text-white font-medium">{mediaItems.length}</span>
                        </span>
                        <span className="text-gray-500">
                            <span className="text-green-500">👁️ Visibili:</span> <span className="text-white font-medium">{visibleCount}</span>
                        </span>
                        <span className="text-gray-500">
                            <span className="text-gray-400">👁️‍🗨️ Nascosti:</span> <span className="text-white font-medium">{hiddenCount}</span>
                        </span>
                    </div>
                    {filterVisibility !== "tutti" && (
                        <button
                            onClick={() => setFilterVisibility("tutti")}
                            className="text-red-600 hover:text-red-500"
                        >
                            Reset filtro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}