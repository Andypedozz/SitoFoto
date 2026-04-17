// components/ProgettiStates.jsx

import Panel from "../common/Panel";

export function ProgettiLoader() {
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

export function ProgettiError({ error, onRetry }) {
    return (
        <Panel>
            <div className="text-center py-12">
                <span className="text-4xl block mb-3">⚠️</span>
                <p className="text-red-500 mb-4">Errore: {error}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Riprova
                </button>
            </div>
        </Panel>
    );
}