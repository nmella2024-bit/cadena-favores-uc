import { useAuth } from '../context/AuthContext';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente temporal para mostrar tu User ID
 *
 * USO:
 * 1. Importar en cualquier página
 * 2. Ver tu User ID
 * 3. Copiar y usar en el script
 * 4. ELIMINAR este componente cuando termines
 */
const MostrarUserID = () => {
  const { currentUser } = useAuth();
  const [copiado, setCopiado] = useState(false);

  if (!currentUser) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md">
        <p className="text-sm text-yellow-800">
          ⚠️ Debes iniciar sesión para ver tu User ID
        </p>
      </div>
    );
  }

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(currentUser.uid);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border-2 border-blue-400 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="text-sm font-bold text-blue-900 mb-2">
        🆔 Tu User ID (para el script):
      </h3>

      <div className="bg-white rounded p-3 mb-3 border border-blue-200">
        <code className="text-xs text-blue-800 break-all font-mono">
          {currentUser.uid}
        </code>
      </div>

      <button
        onClick={copiarAlPortapapeles}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
      >
        {copiado ? (
          <>
            <Check className="w-4 h-4" />
            ¡Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar User ID
          </>
        )}
      </button>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-700 mb-2">
          📋 Información adicional:
        </p>
        <div className="space-y-1 text-xs text-blue-600">
          <p>• Email: {currentUser.email}</p>
          <p>• Nombre: {currentUser.nombre || currentUser.displayName || 'N/A'}</p>
          <p>• Rol: {currentUser.rol || 'usuario'}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          💡 Copia este ID y pégalo en:
          <br />
          <code className="bg-blue-100 px-2 py-1 rounded mt-1 block">
            scripts/import-materiales-from-csv.js
          </code>
          <span className="text-blue-600">Línea 21: const AUTOR_ID = '...'</span>
        </p>
      </div>
    </div>
  );
};

export default MostrarUserID;
