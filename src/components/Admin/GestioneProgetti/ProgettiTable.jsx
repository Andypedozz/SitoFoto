// components/ProgettiTable.jsx

import Table from "../common/Table";

const TABLE_COLUMNS = (handleEdit, handleDuplicate, handleDelete) => [
    {
        key: 'id',
        label: 'ID',
        type: 'number',
        sortable: true
    },
    {
        key: 'nome',
        label: 'Nome Progetto',
        type: 'text',
        sortable: true,
        render: (value) => (
            <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                <span className="font-medium text-white">{value}</span>
            </div>
        )
    },
    {
        key: 'slug',
        label: 'Slug',
        type: 'text',
        render: (value) => (
            <span className="text-gray-400 font-mono text-xs">/{value}</span>
        )
    },
    {
        key: 'copertina',
        label: 'Copertina',
        type: 'image',
        render: (value) => (
            <div className="flex items-center space-x-2">
                <span className="text-gray-400">🖼️</span>
                <span className="text-gray-500 text-xs">{value || '—'}</span>
            </div>
        )
    },
    {
        key: 'actions',
        label: 'Azioni',
        render: (_, row) => (
            <div className="flex space-x-3">
                <button
                    className="text-red-600 hover:text-red-500 transition-colors text-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row);
                    }}
                    title="Modifica"
                >
                    ✎
                </button>
                <button
                    className="text-red-600 hover:text-red-500 transition-colors text-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(row);
                    }}
                    title="Duplica"
                >
                    📋
                </button>
                <button
                    className="text-red-600 hover:text-red-500 transition-colors text-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row);
                    }}
                    title="Elimina"
                >
                    🗑
                </button>
            </div>
        )
    }
];

export default function ProgettiTable({ progetti, onEdit, onDuplicate, onDelete }) {
    return (
        <Table
            columns={TABLE_COLUMNS(onEdit, onDuplicate, onDelete)}
            data={progetti}
            variant="default"
            striped={true}
            hoverable={true}
            sortable={true}
            rowsPerPage={5}
            showPagination={true}
        />
    );
}