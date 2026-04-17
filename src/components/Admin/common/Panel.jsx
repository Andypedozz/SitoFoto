// Panel.jsx

const Panel = ({ 
  children, 
  title, 
  variant = 'default',
  padding = 'default',
  border = true,
  className = '',
  ...props 
}) => {
  
  // Varianti di stile
  const variants = {
    default: {
      container: 'bg-[rgb(19,19,19)] text-white',
      border: 'border border-red-900/30',
      shadow: 'shadow-lg shadow-black/50'
    },
    elevated: {
      container: 'bg-[rgb(25,25,25)] text-white',
      border: 'border border-red-800/40',
      shadow: 'shadow-xl shadow-red-950/20'
    },
    subtle: {
      container: 'bg-[rgb(15,15,15)] text-white',
      border: 'border border-red-900/20',
      shadow: 'shadow-md'
    },
    glass: {
      container: 'bg-[rgb(19,19,19)]/80 backdrop-blur-sm text-white',
      border: 'border border-red-900/30',
      shadow: 'shadow-lg'
    }
  };

  // Dimensioni padding
  const paddings = {
    none: 'p-0',
    small: 'p-3',
    default: 'p-6',
    large: 'p-8',
    xl: 'p-10'
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div
      className={`
        rounded-lg
        ${currentVariant.container}
        ${border ? currentVariant.border : 'border-0'}
        ${currentVariant.shadow}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {/* Header opzionale con titolo */}
      {title && (
        <div className="mb-4 pb-3 border-b border-red-900/30 flex items-center justify-between">
          <h3 className="text-white font-medium tracking-wide flex items-center">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2" />
            {title}
          </h3>
          
          {/* Indicatore di stato per varianti speciali */}
          {variant === 'elevated' && (
            <span className="text-xs text-red-600/50 font-mono">● priority</span>
          )}
        </div>
      )}

      {/* Contenuto principale */}
      <div className="relative">
        {children}
      </div>

      {/* Effetto di glow opzionale nell'angolo (solo per variant elevated) */}
      {variant === 'elevated' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -z-10" />
      )}
    </div>
  );
};

// Sottocomponenti per layout interno
Panel.Header = ({ children, className = '' }) => (
  <div className={`mb-4 pb-3 border-b border-red-900/30 ${className}`}>
    {children}
  </div>
);

Panel.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-3 border-t border-red-900/30 ${className}`}>
    {children}
  </div>
);

Panel.Body = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

// Componente per sezioni all'interno del panel
Panel.Section = ({ children, title, className = '' }) => (
  <div className={`mb-4 last:mb-0 ${className}`}>
    {title && (
      <h4 className="text-sm text-gray-400 mb-2 flex items-center">
        <span className="w-1 h-1 bg-red-600/50 rounded-full mr-2" />
        {title}
      </h4>
    )}
    <div className="text-white">
      {children}
    </div>
  </div>
);

export default Panel;