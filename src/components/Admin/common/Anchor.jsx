// Anchor.jsx
const Anchor = ({ label, href, variant = 'default' }) => {
  return (
    <a
      href={href}
      className="w-full group relative flex items-center space-x-3 px-4 py-3 rounded-lg
               text-gray-400 hover:text-white
               transition-all duration-300 ease-in-out
               hover:bg-red-600/10
               border border-transparent hover:border-red-600/50
               focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:ring-offset-2 focus:ring-offset-black
               overflow-hidden"
    >
      {/* Effetto hover background animato */}
      <span className="absolute inset-0 bg-linear-to-r from-red-600/0 via-red-600/5 to-red-600/0 
                     -translate-x-full group-hover:translate-x-full 
                     transition-transform duration-1000 ease-in-out" />
      
      {/* Icon indicator */}
      <span className="relative flex items-center justify-center w-6">
        <span className="absolute w-1.5 h-1.5 bg-red-600 rounded-full 
                       opacity-0 group-hover:opacity-100 
                       transition-opacity duration-300
                       -left-1" />
        <span className="w-2 h-2 border border-red-600 rounded-full 
                       group-hover:bg-red-600 
                       transition-colors duration-300" />
      </span>
      
      {/* Button text */}
      <span className="relative font-medium tracking-wide flex-1 text-left">
        {label}
      </span>

      {/* Mini indicatore con iniziale */}
      <span className="text-xs text-red-600/50 group-hover:text-red-600 
                     transition-colors duration-300 font-mono">
        {label.charAt(0)}
      </span>

      {/* Active indicator line */}
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-600 
                     scale-x-0 group-hover:scale-x-100 
                     transition-transform duration-300 origin-left" />
    </a>
  );
};

export default Anchor;