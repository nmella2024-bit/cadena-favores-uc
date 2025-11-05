import { Home, ChevronRight } from 'lucide-react';

const Breadcrumb = ({ ruta, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-4 overflow-x-auto">
      {/* Raíz / Home */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-purple-600 font-medium whitespace-nowrap"
      >
        <Home className="w-4 h-4" />
        <span>Material</span>
      </button>

      {/* Carpetas en la ruta */}
      {ruta.map((carpeta, index) => (
        <div key={carpeta.id} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => onNavigate(carpeta.id)}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              index === ruta.length - 1
                ? 'text-purple-600 bg-purple-50 font-semibold'
                : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600 font-medium'
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
