import { Home, ChevronRight } from 'lucide-react';

const Breadcrumb = ({ ruta, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-4 overflow-x-auto">
      {/* Raíz / Home */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-canvas transition-colors text-text-primary hover:text-purple-600 dark:hover:text-purple-400 font-medium whitespace-nowrap"
      >
        <Home className="w-4 h-4" />
        <span>Material</span>
      </button>

      {/* Carpetas en la ruta */}
      {ruta.map((carpeta, index) => (
        <div key={carpeta.id} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <button
            onClick={() => onNavigate(carpeta.id)}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              index === ruta.length - 1
                ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 font-semibold'
                : 'text-text-primary hover:bg-canvas hover:text-purple-600 dark:hover:text-purple-400 font-medium'
            }`}
          >
            {carpeta.nombre}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
