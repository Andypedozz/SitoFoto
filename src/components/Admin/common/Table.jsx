// Table.jsx
import React, { useState } from 'react';

const Table = ({ 
  columns = [], 
  data = [],
  variant = 'default',
  striped = true,
  hoverable = true,
  sortable = false,
  onRowClick = null,
  rowsPerPage = 10,
  showPagination = true,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Funzione per ordinamento
  const requestSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Ordinamento dei dati
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortConfig]);

  // Paginazione
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Varianti di stile per la tabella
  const variants = {
    default: {
      table: 'w-full text-sm text-left',
      header: 'text-xs uppercase tracking-wider text-gray-400 bg-black/50',
      row: 'border-b border-red-900/20 last:border-0',
      cell: 'px-6 py-4'
    },
    compact: {
      table: 'w-full text-xs text-left',
      header: 'text-[10px] uppercase tracking-wider text-gray-400 bg-black/50',
      row: 'border-b border-red-900/20 last:border-0',
      cell: 'px-4 py-2'
    },
    spacious: {
      table: 'w-full text-base text-left',
      header: 'text-sm uppercase tracking-wider text-gray-400 bg-black/50',
      row: 'border-b border-red-900/20 last:border-0',
      cell: 'px-8 py-6'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-red-900/30 bg-black">
      {/* Tabella scrollabile */}
      <div className="overflow-x-auto">
        <table className={`${currentVariant.table} ${className}`}>
          {/* Header */}
          <thead className={currentVariant.header}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`${currentVariant.cell} font-medium ${
                    sortable && column.sortable !== false ? 'hover:text-red-600 transition-colors' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false && requestSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    
                    {/* Icone di ordinamento con caratteri */}
                    {sortable && column.sortable !== false && (
                      <span className="inline-flex flex-col text-[8px]">
                        <span className={`leading-3 ${
                          sortConfig.key === column.key && sortConfig.direction === 'asc' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>▲</span>
                        <span className={`leading-3 ${
                          sortConfig.key === column.key && sortConfig.direction === 'desc' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>▼</span>
                      </span>
                    )}

                    {/* Badge per tipo di dato (opzionale) */}
                    {column.type && (
                      <span className="text-[8px] px-1 py-0.5 bg-red-950/30 border border-red-900/30 rounded text-red-600/50">
                        {column.type}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    ${currentVariant.row}
                    ${hoverable ? 'hover:bg-red-600/5 hover:border-red-600/30 transition-colors' : ''}
                    ${striped && rowIndex % 2 === 1 ? 'bg-red-950/5' : ''}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={currentVariant.cell}>
                      {/* Render personalizzato o valore diretto */}
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <span className="text-white">
                          {row[column.key] !== null && row[column.key] !== undefined
                            ? row[column.key]
                            : <span className="text-gray-600 italic">—</span>
                          }
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl text-red-600/20">📋</span>
                    <span>Nessun dato disponibile</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginazione */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-red-900/30 bg-black/50">
          <div className="text-sm text-gray-500">
            Mostra {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, sortedData.length)} di {sortedData.length} elementi
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-red-900/30 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-red-600/10 hover:border-red-600/50 transition-colors
                       text-gray-400 hover:text-white"
            >
              ← Precedente
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      w-8 h-8 rounded text-sm transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-red-600/10'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-red-900/30 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-red-600/10 hover:border-red-600/50 transition-colors
                       text-gray-400 hover:text-white"
            >
              Successivo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;