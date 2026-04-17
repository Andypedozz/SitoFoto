// components/ProgettiHeader.jsx
import React from 'react';

export default function ProgettiHeader({ totalCount, showForm, onToggleForm }) {
    return (
        <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                    {totalCount} progetti
                </span>
            </div>

            <button
                onClick={onToggleForm}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg 
                         hover:bg-red-700 transition-colors text-sm font-medium"
            >
                <span>{showForm ? '✕' : '+'}</span>
                <span>{showForm ? 'Chiudi' : 'Nuovo Progetto'}</span>
            </button>
        </header>
    );
}