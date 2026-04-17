// Sidebar.jsx
import Anchor from './Anchor';
import Button from './Button';

const Sidebar = ({ buttons, setPage }) => {
  // Convertiamo l'oggetto buttons in un array per il mapping
  const buttonEntries = Object.entries(buttons);

  const handleButtonClick = (label, onClick) => {
    // Eseguiamo sia la funzione passata che setPage per consistenza
    onClick();
    setPage(label);
  };

  return (
    <aside className="w-64 h-screen bg-black border-r border-red-900/30 fixed left-0 top-0 flex flex-col">
      {/* Header con logo/indicatore */}
      <div className="p-6 border-b border-red-900/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-white font-bold text-lg tracking-wider">UG Admin</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="space-y-2">
          {buttonEntries.map(([label, onClick], index) => (
            <Button
              key={index}
              label={label}
              onClick={() => handleButtonClick(label, onClick)}
            />
          ))}
          <Anchor label="Torna alla home" href="/" />
          <Button label="Disconnetti" onClick={() => {
            fetch("api/logout", {
              method: "POST"
            }).then(() => {
              window.location.href = "/login";
            })
          }}/> 
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;