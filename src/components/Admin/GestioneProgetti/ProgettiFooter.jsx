// components/ProgettiFooter.jsx
import React from 'react';

export default function ProgettiFooter({ totalCount, isLoading }) {
    return (
        <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-4">
                <span>📊 Totale progetti: {totalCount}</span>
                <span>📝 Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</span>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                    <span>{isLoading ? 'Caricamento...' : 'Sincronizzato'}</span>
                </div>
                <span className="text-red-600/50">v2.0</span>
            </div>
        </div>
    );
}