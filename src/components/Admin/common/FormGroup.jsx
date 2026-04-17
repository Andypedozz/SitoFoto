// FormGroup.jsx
import React from 'react';

export default function FormGroup({ 
    title, 
    fields = [], 
    onSubmit,
    submitLabel = "Conferma",
    variant = "default",
    children
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    // Varianti di stile
    const variants = {
        default: {
            container: "bg-black border border-red-900/30 rounded-lg p-6",
            title: "text-white text-2xl font-bold mb-6 flex items-center",
            formGroup: "mb-5",
            label: "block text-sm font-medium text-gray-300 mb-2",
            input: "w-full px-4 py-2.5 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all duration-300",
            select: "w-full px-4 py-2.5 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all duration-300 cursor-pointer",
            textarea: "w-full px-4 py-2.5 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all duration-300 resize-y",
            button: "w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 mt-4",
            required: "text-red-500 text-xs ml-1"
        },
        compact: {
            container: "bg-black border border-red-900/30 rounded-lg p-4",
            title: "text-white text-xl font-bold mb-4 flex items-center",
            formGroup: "mb-3",
            label: "block text-xs font-medium text-gray-400 mb-1",
            input: "w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-600 transition-all duration-300",
            select: "w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-600 transition-all duration-300 cursor-pointer",
            textarea: "w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-600 transition-all duration-300 resize-y",
            button: "w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all duration-300 mt-3",
            required: "text-red-500 text-[10px] ml-1"
        }
    };

    const currentVariant = variants[variant] || variants.default;

    return (
        <div className={currentVariant.container}>
            {/* Header con decorazione */}
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h1 className={currentVariant.title}>
                        <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3"></span>
                        {title}
                    </h1>
                    
                    {/* Indicatore di stato (solo per variant default) */}
                    {variant === 'default' && (
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-gray-600">modifica in corso</span>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Campi del form */}
                {fields.map((field, index) => (
                    <div key={field.id || index} className={currentVariant.formGroup}>
                        <label htmlFor={field.id} className={currentVariant.label}>
                            {field.label}
                            {field.required && <span className={currentVariant.required}>*</span>}
                        </label>

                        {/* Textarea */}
                        {field.type === "textarea" && (
                            <textarea
                                id={field.id}
                                name={field.name}
                                placeholder={field.placeholder}
                                rows={field.rows ?? 4}
                                value={field.value}
                                onChange={field.onChange}
                                required={field.required}
                                disabled={field.disabled}
                                className={`${currentVariant.textarea} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        )}

                        {/* Select */}
                        {field.type === "select" && (
                            <select
                                id={field.id}
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                required={field.required}
                                disabled={field.disabled}
                                className={`${currentVariant.select} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {field.placeholder && (
                                    <option value="" disabled hidden>
                                        {field.placeholder}
                                    </option>
                                )}
                                {field.options?.map((option, optIndex) => (
                                    <option 
                                        key={optIndex} 
                                        value={option.value}
                                        className="bg-[rgb(19,19,19)] text-white"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Input */}
                        {field.type === "input" && (
                            <input
                                id={field.id}
                                name={field.name}
                                type={field.inputType ?? "text"}
                                placeholder={field.placeholder}
                                value={field.value}
                                onChange={field.onChange}
                                required={field.required}
                                disabled={field.disabled}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                className={`${currentVariant.input} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        )}

                        {/* Messaggio di errore (opzionale) */}
                        {field.error && (
                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {field.error}
                            </p>
                        )}

                        {/* Descrizione del campo (opzionale) */}
                        {field.description && (
                            <p className="mt-1 text-xs text-gray-600">
                                {field.description}
                            </p>
                        )}
                    </div>
                ))}

                {/* Children personalizzati */}
                {children}

                {/* Pulsante submit (solo se submitLabel è presente e non vuoto) */}
                {submitLabel && submitLabel !== "" && (
                    <button 
                        type="submit" 
                        className={`${currentVariant.button} group relative overflow-hidden`}
                    >
                        {/* Effetto hover shine */}
                        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent 
                                       -translate-x-full group-hover:translate-x-full 
                                       transition-transform duration-1000 ease-in-out" />
                        
                        {/* Testo del pulsante */}
                        <span className="relative flex items-center justify-center space-x-2">
                            <span>{submitLabel}</span>
                            <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">
                                →
                            </span>
                        </span>
                    </button>
                )}
            </form>

            {/* Footer con info (opzionale) - solo se ci sono campi obbligatori */}
            {fields.some(f => f.required) && (
                <div className="mt-4 text-[10px] text-gray-800 flex justify-end">
                    <span className="text-red-900/50">* campi obbligatori</span>
                </div>
            )}
        </div>
    );
}