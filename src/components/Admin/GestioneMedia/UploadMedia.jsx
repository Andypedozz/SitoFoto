// UploadMedia.jsx
import { useState, useCallback } from 'react';

export default function UploadMedia({ onUpload, disabled = false, selectedProject }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (disabled) {
            alert("Seleziona prima un progetto");
            return;
        }

        const files = Array.from(e.dataTransfer.files).filter(file => {
            const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
            return isValidType && isValidSize;
        });

        if (files.length > 0) {
            setSelectedFiles(files);
            handleFiles(files);
        } else {
            alert("Alcuni file non sono supportati o superano i 100MB");
        }
    }, [onUpload, disabled]);

    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files).filter(file => {
            const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
            return isValidType && isValidSize;
        });

        if (files.length > 0) {
            setSelectedFiles(files);
            handleFiles(files);
        } else {
            alert("I file selezionati non sono supportati o superano i 100MB");
        }
    }, [onUpload]);

    const handleFiles = (files) => {
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setUploadProgress(null);
                        setSelectedFiles([]);
                    }, 1000);
                    onUpload(files);
                    return null;
                }
                return prev + 10;
            });
        }, 200);
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            {/* Area drag & drop */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-8
                    transition-all duration-300 cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed border-gray-700' : ''}
                    ${isDragging && !disabled
                        ? 'border-red-600 bg-red-600/10' 
                        : !disabled ? 'border-red-900/30 hover:border-red-600/50 hover:bg-red-600/5' : ''
                    }
                `}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileInput}
                    disabled={disabled}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                <div className="text-center">
                    <div className="text-4xl mb-3">
                        {disabled ? '🔒' : (isDragging ? '📂' : '📁')}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">
                        {disabled 
                            ? 'Seleziona un progetto per abilitare l\'upload'
                            : isDragging 
                                ? 'Rilascia i file qui' 
                                : 'Trascina i file qui o clicca per selezionare'
                        }
                    </p>
                    <p className="text-xs text-gray-600">
                        Supporta immagini e video (max 100MB per file)
                    </p>
                    {selectedProject && (
                        <p className="text-xs text-green-500 mt-2">
                            ✓ Upload per progetto ID: {selectedProject}
                        </p>
                    )}
                </div>
            </div>

            {/* Lista file selezionati */}
            {selectedFiles.length > 0 && uploadProgress === null && (
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">File selezionati ({selectedFiles.length})</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                    <span className="text-red-600/50">
                                        {file.type.startsWith('video/') ? '🎥' : '🖼️'}
                                    </span>
                                    <span className="text-gray-300 truncate max-w-60">
                                        {file.name}
                                    </span>
                                    <span className="text-gray-600">
                                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-600 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Barra di progresso */}
            {uploadProgress !== null && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Caricamento in corso...</span>
                        <span className="text-red-600">{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-red-950/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Lista formati supportati */}
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">JPG</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">PNG</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">GIF</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">MP4</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">MOV</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">WEBM</span>
            </div>
        </div>
    );
}