import { useState, useEffect } from 'react';
import { X, Folder, Home, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { obtenerCarpetasPorNivel, obtenerTodasLasCarpetas, obtenerRutaCarpeta } from '../services/folderService';
import PrimaryButton from './ui/PrimaryButton';

const MoveFolderModal = ({ isOpen, onClose, carpetaAMover, onMover }) => {
  const [carpetasActuales, setCarpetasActuales] = useState([]);
  const [carpetaNavegacionActual, setCarpetaNavegacionActual] = useState(null);
  const [rutaNavegacion, setRutaNavegacion] = useState([]);
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState(null);
  const [carpetasExpandidas, setCarpetasExpandidas] = useState(new Set());
  const [carpetasInvalidas, setCarpetasInvalidas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moviendo, setMoviendo] = useState(false);

  useEffect(() => {
    if (isOpen && carpetaAMover) {
      inicializarModal();
    }
  }, [isOpen, carpetaAMover]);

  const inicializarModal = async () => {
    try {
      setLoading(true);
      setError('');
      setCarpetaNavegacionActual(null);
      setRutaNavegacion([]);
      setCarpetaSeleccionada(null);
      setCarpetasExpandidas(new Set());

      // Obtener todas las carpetas para calcular descendientes
      const todasLasCarpetas = await obtenerTodasLasCarpetas();
      const descendientes = obtenerDescendientes(carpetaAMover.id, todasLasCarpetas);
      setCarpetasInvalidas(descendientes);

      // Cargar carpetas del nivel raíz
      await cargarCarpetasNivel(null);
    } catch (err) {
      console.error('Error al inicializar modal:', err);
      setError('Error al cargar carpetas');
    } finally {
      setLoading(false);
    }
  };

  const cargarCarpetasNivel = async (carpetaPadreId) => {
    try {
      const carpetas = await obtenerCarpetasPorNivel(carpetaPadreId);
      // Filtrar carpetas inválidas
      const carpetasValidas = carpetas.filter(c => !carpetasInvalidas.has(c.id));
      setCarpetasActuales(carpetasValidas);
    } catch (err) {
      console.error('Error al cargar carpetas:', err);
      setError('Error al cargar carpetas');
    }
  };

  // Función recursiva para encontrar todas las subcarpetas de una carpeta
  const obtenerDescendientes = (carpetaId, todasLasCarpetas) => {
    const descendientes = new Set([carpetaId]);
    const hijos = todasLasCarpetas.filter(c => c.carpetaPadreId === carpetaId);

    hijos.forEach(hijo => {
      const subDescendientes = obtenerDescendientes(hijo.id, todasLasCarpetas);
      subDescendientes.forEach(d => descendientes.add(d));
    });

    return descendientes;
  };

  const handleNavegar = async (carpeta) => {
    try {
      setLoading(true);
      setCarpetaNavegacionActual(carpeta);

      // Actualizar ruta de navegación
      if (carpeta) {
        const ruta = await obtenerRutaCarpeta(carpeta.id);
        setRutaNavegacion(ruta);
      } else {
        setRutaNavegacion([]);
      }

      // Cargar subcarpetas
      await cargarCarpetasNivel(carpeta?.id || null);
    } catch (err) {
      console.error('Error al navegar:', err);
      setError('Error al navegar');
    } finally {
      setLoading(false);
    }
  };

  const handleRetroceder = async () => {
    if (rutaNavegacion.length === 0) return;

    if (rutaNavegacion.length === 1) {
      // Volver a la raíz
      await handleNavegar(null);
    } else {
      // Volver a la carpeta padre
      const carpetaPadre = rutaNavegacion[rutaNavegacion.length - 2];
      await handleNavegar(carpetaPadre);
    }
  };

  const handleSeleccionarCarpeta = (carpetaId) => {
    setCarpetaSeleccionada(carpetaId);
  };

  const handleMover = async () => {
    if (moviendo) return;

    try {
      setMoviendo(true);
      setError('');
      await onMover(carpetaAMover.id, carpetaSeleccionada);
      onClose();
    } catch (err) {
      console.error('Error al mover carpeta:', err);
      setError(err.message || 'Error al mover la carpeta');
    } finally {
      setMoviendo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mover Carpeta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Moviendo: <span className="font-semibold text-purple-600">{carpetaAMover?.nombre}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={moviendo}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Breadcrumb de navegación */}
        {!loading && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => handleNavegar(null)}
                className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                <Home className="w-4 h-4 mr-1" />
                Raíz
              </button>
              {rutaNavegacion.map((carpeta, index) => (
                <div key={carpeta.id} className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => handleNavegar(carpeta)}
                    className="text-gray-600 hover:text-purple-600 font-medium"
                  >
                    {carpeta.nombre}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {carpetaNavegacionActual
                    ? `Navega dentro de "${carpetaNavegacionActual.nombre}" o selecciónala como destino`
                    : 'Selecciona la carpeta destino o navega dentro de una carpeta'}
                </p>
                {rutaNavegacion.length > 0 && (
                  <button
                    onClick={handleRetroceder}
                    className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                )}
              </div>

              {/* Opción: Seleccionar carpeta actual como destino */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {carpetaNavegacionActual ? `Mover dentro de "${carpetaNavegacionActual.nombre}"` : 'Mover a la raíz'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {carpetaNavegacionActual
                          ? 'La carpeta se moverá como subcarpeta de esta carpeta'
                          : 'La carpeta se moverá al nivel principal'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSeleccionarCarpeta(carpetaNavegacionActual?.id || null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      carpetaSeleccionada === (carpetaNavegacionActual?.id || null)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {carpetaSeleccionada === (carpetaNavegacionActual?.id || null) ? 'Seleccionado' : 'Seleccionar'}
                  </button>
                </div>
              </div>

              {/* Lista de carpetas */}
              {carpetasActuales.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Folder className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No hay subcarpetas aquí</p>
                  <p className="text-sm mt-1">
                    {carpetaNavegacionActual
                      ? 'Esta carpeta no contiene subcarpetas'
                      : 'Puedes mover la carpeta a la raíz seleccionando la opción de arriba'}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Carpetas disponibles ({carpetasActuales.length})
                  </h3>
                  <div className="space-y-2">
                    {carpetasActuales.map((carpeta) => (
                      <div
                        key={carpeta.id}
                        className="bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Folder className="w-6 h-6 text-purple-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{carpeta.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(carpeta.fechaCreacion).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleNavegar(carpeta)}
                            className="ml-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>Abrir</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {carpetaSeleccionada !== undefined ? (
                carpetaSeleccionada === null ? (
                  <span className="font-medium text-purple-600">✓ Destino: Raíz</span>
                ) : (
                  <span className="font-medium text-purple-600">✓ Destino seleccionado</span>
                )
              ) : (
                <span>Selecciona un destino para continuar</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={moviendo}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <PrimaryButton
                onClick={handleMover}
                disabled={moviendo || carpetaSeleccionada === undefined}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {moviendo ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Moviendo...
                  </>
                ) : (
                  'Mover Carpeta'
                )}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveFolderModal;
