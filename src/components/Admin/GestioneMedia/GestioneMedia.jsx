// GestioneMedia.jsx
import { useState, useEffect } from "react";
import UploadMedia from "./UploadMedia";
import MediaContainer from "./MediaContainer";
import Panel from "../common/Panel";
import FormGroup from "../common/FormGroup";
import { useMedia } from "./useMedia";

export default function GestioneMedia() {
    const [mediaType, setMediaType] = useState("tutti");
    const [progetti, setProgetti] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [isLoadingProgetti, setIsLoadingProgetti] = useState(true);
    
    const { 
        media: mediaItems, 
        isLoading: isLoadingMedia, 
        error,
        fetchMedia,
        uploadMedia,
        toggleVisibility,
        deleteMedia 
    } = useMedia();

    // Fetch progetti
    useEffect(() => {
        async function fetchProgetti() {
            setIsLoadingProgetti(true);
            try {
                const response = await fetch("/api/projects");
                const data = await response.json();
                setProgetti(data);
            } catch (error) {
                console.error("Errore nel caricamento dei progetti:", error);
            } finally {
                setIsLoadingProgetti(false);
            }
        }
        fetchProgetti();
    }, []);

    // Fetch media
    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (files) => {
        if (!selectedProject) {
            alert("Seleziona un progetto prima di caricare i file");
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        formData.append("idProgetto", selectedProject);

        const result = await uploadMedia(formData);
        if (!result.success) {
            alert("Errore durante il caricamento: " + result.error);
        }
    };

    const handleToggleVisibility = async (id, visibile) => {
        const result = await toggleVisibility(id, visibile);
        if (!result.success) {
            alert("Errore durante l'aggiornamento della visibilità: " + result.error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Sei sicuro di voler eliminare questo file?")) return;
        
        const result = await deleteMedia(id);
        if (!result.success) {
            alert("Errore durante l'eliminazione: " + result.error);
        }
    };

    const filteredMedia = mediaType === "tutti" 
        ? mediaItems 
        : mediaItems.filter(item => item.tipo === mediaType);

    // Statistiche per progetto e visibilità
    const getProjectStats = () => {
        const stats = {};
        mediaItems.forEach(item => {
            const projectId = item.idProgetto;
            if (!stats[projectId]) {
                stats[projectId] = { totale: 0, visibili: 0, nascosti: 0 };
            }
            stats[projectId].totale++;
            if (item.visibile) {
                stats[projectId].visibili++;
            } else {
                stats[projectId].nascosti++;
            }
        });
        return stats;
    };

    const projectStats = getProjectStats();
    const visibleCount = mediaItems.filter(m => m.visibile).length;
    const hiddenCount = mediaItems.filter(m => !m.visibile).length;

    const isLoading = isLoadingMedia || isLoadingProgetti;

    if (isLoading) {
        return (
            <Panel>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Caricamento...</p>
                    </div>
                </div>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <span className="text-4xl block mb-3 text-red-600">⚠️</span>
                        <p className="text-red-500 text-sm">Errore: {error}</p>
                        <button 
                            onClick={() => fetchMedia()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                            Riprova
                        </button>
                    </div>
                </div>
            </Panel>
        );
    }

    return (
        <Panel>
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <span className="text-3xl mr-3">🎬</span>
                        Gestione Media
                    </h1>
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        {mediaItems.length} file
                    </span>
                </div>

                {/* Statistiche rapide */}
                <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-400">Visibili: <span className="text-white">{visibleCount}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span className="text-gray-400">Nascosti: <span className="text-white">{hiddenCount}</span></span>
                    </div>
                </div>
            </header>

            <div>
                {/* Layout a due colonne */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonna sinistra - Form di upload */}
                    <div className="lg:col-span-1">
                        <FormGroup
                            title="📤 Carica Media"
                            fields={[]}
                            onSubmit={(e) => e.preventDefault()}
                            submitLabel=""
                            variant="compact"
                        >
                            {/* Selezione progetto */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Progetto <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-all duration-300"
                                >
                                    <option value="">Seleziona un progetto</option>
                                    {progetti.map(progetto => {
                                        const stats = projectStats[progetto.id] || { totale: 0, visibili: 0, nascosti: 0 };
                                        return (
                                            <option key={progetto.id} value={progetto.id}>
                                                {progetto.nome} ({stats.totale} file, {stats.visibili} visibili)
                                            </option>
                                        );
                                    })}
                                </select>
                                {!selectedProject && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ⚠️ Seleziona un progetto per abilitare l'upload
                                    </p>
                                )}
                            </div>

                            <UploadMedia 
                                onUpload={handleUpload} 
                                disabled={!selectedProject}
                                selectedProject={selectedProject}
                            />
                            
                            {/* Selettore tipo media */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Filtra per tipo
                                </label>
                                <div className="flex space-x-2">
                                    {["tutti", "immagine", "video"].map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setMediaType(tipo)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                                ${mediaType === tipo 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'bg-black border border-red-900/30 text-gray-400 hover:text-white hover:border-red-600/50'
                                                }`}
                                        >
                                            {tipo === "tutti" && "📁 Tutti"}
                                            {tipo === "immagine" && "🖼️ Immagini"}
                                            {tipo === "video" && "🎥 Video"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Statistiche dettagliate */}
                            <div className="mt-4 pt-4 border-t border-red-900/30">
                                <h4 className="text-xs font-medium text-gray-400 mb-3">Statistiche per progetto</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {progetti.map(progetto => {
                                        const stats = projectStats[progetto.id] || { totale: 0, visibili: 0, nascosti: 0 };
                                        return (
                                            <div key={progetto.id} className="text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 truncate max-w-32">{progetto.nome}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-green-500">{stats.visibili}</span>
                                                        <span className="text-gray-600">/</span>
                                                        <span className="text-gray-400">{stats.totale}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-linear-to-r from-green-500 to-green-600"
                                                        style={{ width: `${stats.totale ? (stats.visibili / stats.totale) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FormGroup>
                    </div>

                    {/* Colonna destra - Media Container */}
                    <div className="lg:col-span-2">
                        <MediaContainer 
                            mediaItems={filteredMedia}
                            onDelete={handleDelete}
                            onToggleVisibility={handleToggleVisibility}
                            progetti={progetti}
                        />
                    </div>
                </div>
            </div>
        </Panel>
    );
}