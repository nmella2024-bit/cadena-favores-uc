import React, { useState, useEffect, useMemo } from 'react';
import { obtenerMaterialesPorCarpeta, eliminarMaterial, fijarMaterial } from '../services/materialService';
import { obtenerCarpetasPorNivel, crearCarpeta, renombrarCarpeta, eliminarCarpeta, obtenerRutaCarpeta, obtenerCarpetaPorId, moverCarpeta } from '../services/folderService';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Plus, Inbox, AlertCircle, FolderPlus } from 'lucide-react';
import SubirMaterialModal from '../components/SubirMaterialModal';
import MaterialCard from '../components/MaterialCard';
import FolderCard from '../components/FolderCard';
import Breadcrumb from '../components/Breadcrumb';
import CreateFolderModal from '../components/CreateFolderModal';
import MoveFolderModal from '../components/MoveFolderModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import MaterialSearch from '../components/MaterialSearch';

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-border bg-card/70 p-6 shadow-sm dark:bg-card/60">
    <div className="h-6 w-2/3 rounded bg-border/80 dark:bg-border/40 mb-4" />
    <div className="space-y-2 mb-4">
      <div className="h-4 w-full rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-5/6 rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-4/6 rounded bg-border/80 dark:bg-border/40" />
    </div>
    <div className="h-4 w-32 rounded bg-border/80 dark:bg-border/40" />
  </div>
);

const Material = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [materiales, setMateriales] = useState([]);
  const [carpetas, setCarpetas] = useState([]);
  const [carpetaActual, setCarpetaActual] = useState(null);
  const [rutaCarpeta, setRutaCarpeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMoveFolderModalOpen, setIsMoveFolderModalOpen] = useState(false);
  const [carpetaAMover, setCarpetaAMover] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const esUsuarioExclusivo = currentUser?.rol === 'exclusivo' || currentUser?.rol === 'admin';

  // Efecto para navegar a carpeta desde URL
  useEffect(() => {
    const folderId = searchParams.get('folder');
    if (folderId) {
      // Navegar a la carpeta especificada
      obtenerCarpetaPorId(folderId).then(carpeta => {
        if (carpeta) {
          setCarpetaActual(carpeta);
        }
      }).catch(error => {
        console.error('Error al cargar carpeta desde URL:', error);
      });
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Cargar contenido (carpetas y materiales) de la carpeta actual
  const cargarContenido = async (carpetaId = null) => {
    try {
      setLoading(true);
      setError('');

      // Cargar carpetas del nivel actual
      try {
        const carpetasData = await obtenerCarpetasPorNivel(carpetaId);
        setCarpetas(carpetasData);
      } catch (carpetasError) {
        console.warn('Error al cargar carpetas:', carpetasError);
        setCarpetas([]); // Si no hay carpetas, lista vacía
      }

      // Cargar materiales de la carpeta actual
      try {
        const materialesData = await obtenerMaterialesPorCarpeta(carpetaId);
        setMateriales(materialesData);
      } catch (materialesError) {
        console.warn('Error al cargar materiales:', materialesError);
        setMateriales([]); // Si no hay materiales, lista vacía
      }

      // Actualizar la ruta si estamos en una carpeta
      if (carpetaId) {
        try {
          const ruta = await obtenerRutaCarpeta(carpetaId);
          setRutaCarpeta(ruta);
          const carpeta = await obtenerCarpetaPorId(carpetaId);
          setCarpetaActual(carpeta);
        } catch (rutaError) {
          console.warn('Error al cargar ruta:', rutaError);
          setRutaCarpeta([]);
          setCarpetaActual(null);
        }
      } else {
        setRutaCarpeta([]);
        setCarpetaActual(null);
      }
    } catch (err) {
      console.error('Error al cargar contenido:', err);
      setError('Error al cargar el contenido. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContenido(carpetaActual?.id || null);
  }, [carpetaActual?.id]);

  // Ordenar materiales (fijados primero, luego por fecha)
  const sortedMateriales = useMemo(() => {
    return [...materiales].sort((a, b) => {
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fechaSubida) - new Date(a.fechaSubida);
    });
  }, [materiales]);

  // Manejar eliminación de material
  const handleEliminarMaterial = async (materialId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este material?')) {
      return;
    }

    try {
      setEliminando(materialId);
      await eliminarMaterial(materialId, currentUser.uid);
      // Recargar materiales
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al eliminar material:', err);
      alert(err.message || 'Error al eliminar el material. Intenta nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  // Manejar cuando se sube un nuevo material
  const handleMaterialSubido = () => {
    cargarContenido(carpetaActual?.id || null);
  };

  // Manejar fijar material
  const handleFijarMaterial = async (materialId, nuevoEstado) => {
    // Validación adicional: verificar que el usuario sea exclusivo
    if (!esUsuarioExclusivo) {
      alert('Solo los usuarios con rol exclusivo pueden fijar materiales.');
      return;
    }

    try {
      await fijarMaterial(materialId, nuevoEstado, currentUser);
      // Actualizar el estado local
      setMateriales(materiales.map(m =>
        m.id === materialId ? { ...m, fijado: nuevoEstado } : m
      ));
    } catch (err) {
      console.error('Error al fijar/desfijar material:', err);
      alert(err.message || 'Error al actualizar el material. Intenta nuevamente.');
    }
  };

  // Navegación de carpetas
  const handleAbrirCarpeta = (carpetaId) => {
    cargarContenido(carpetaId);
  };

  const handleNavegar = (carpetaId) => {
    cargarContenido(carpetaId);
  };

  // Crear carpeta
  const handleCrearCarpeta = async (nombreCarpeta) => {
    try {
      await crearCarpeta({
        nombre: nombreCarpeta,
        carpetaPadreId: carpetaActual?.id || null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName || 'Usuario'
      });
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al crear carpeta:', err);
      throw err;
    }
  };

  // Renombrar carpeta
  const handleRenombrarCarpeta = async (carpetaId, nuevoNombre) => {
    try {
      await renombrarCarpeta(carpetaId, nuevoNombre, currentUser.uid);
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al renombrar carpeta:', err);
      alert(err.message || 'Error al renombrar la carpeta. Intenta nuevamente.');
    }
  };

  // Eliminar carpeta
  const handleEliminarCarpeta = async (carpetaId) => {
    try {
      await eliminarCarpeta(carpetaId, currentUser.uid);
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al eliminar carpeta:', err);
      alert(err.message || 'Error al eliminar la carpeta. Intenta nuevamente.');
    }
  };

  // Mover carpeta
  const handleMoverCarpeta = (carpetaId) => {
    const carpeta = carpetas.find(c => c.id === carpetaId);
    if (carpeta) {
      setCarpetaAMover(carpeta);
      setIsMoveFolderModalOpen(true);
    }
  };

  const handleConfirmarMoverCarpeta = async (carpetaId, nuevaCarpetaPadreId) => {
    try {
      await moverCarpeta(carpetaId, nuevaCarpetaPadreId, currentUser.uid);
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
      setIsMoveFolderModalOpen(false);
      setCarpetaAMover(null);
    } catch (err) {
      console.error('Error al mover carpeta:', err);
      throw err; // Propagar el error al modal para mostrarlo
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <BookOpen className="h-10 w-10 text-brand" />
                <h1 className="text-4xl font-bold text-text-primary">
                  Material de Estudio UC
                </h1>
              </div>
              <p className="text-lg text-text-muted">
                Encuentra resúmenes, guías y material según tu carrera, año o ramo
              </p>
            </div>

            {currentUser && (
              <div className="flex gap-3">
                {esUsuarioExclusivo && (
                  <PrimaryButton
                    onClick={() => setIsFolderModalOpen(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap bg-purple-600 hover:bg-purple-700"
                  >
                    <FolderPlus className="h-5 w-5" />
                    Nueva Carpeta
                  </PrimaryButton>
                )}
                <PrimaryButton
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" />
                  Subir Material
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumb ruta={rutaCarpeta} onNavigate={handleNavegar} />

        {/* Buscador de Material */}
        <div className="mb-6">
          <MaterialSearch carpetaActualId={carpetaActual?.id} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedMateriales.length === 0 && carpetas.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:bg-card/30">
            <Inbox className="mb-4 h-16 w-16 text-text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {carpetaActual ? 'Carpeta vacía' : 'No hay contenido'}
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {currentUser
                ? 'No se encontraron carpetas ni materiales. Crea una carpeta o sube material para comenzar.'
                : 'No hay contenido disponible en este momento.'}
            </p>
            {currentUser && (
              <div className="flex gap-3 mt-6">
                {esUsuarioExclusivo && (
                  <PrimaryButton
                    onClick={() => setIsFolderModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <FolderPlus className="h-5 w-5" />
                    Crear Carpeta
                  </PrimaryButton>
                )}
                <PrimaryButton
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Subir Material
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {/* Carpetas y Materiales */}
        {!loading && (carpetas.length > 0 || sortedMateriales.length > 0) && (
          <>
            {/* Contador */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">
                {carpetas.length > 0 && `${carpetas.length} ${carpetas.length === 1 ? 'carpeta' : 'carpetas'}`}
                {carpetas.length > 0 && sortedMateriales.length > 0 && ' • '}
                {sortedMateriales.length > 0 && `${sortedMateriales.length} ${sortedMateriales.length === 1 ? 'archivo' : 'archivos'}`}
              </p>
            </div>

            {/* Grid de Carpetas */}
            {carpetas.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Carpetas</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {carpetas.map((carpeta) => (
                    <FolderCard
                      key={carpeta.id}
                      folder={carpeta}
                      onOpen={handleAbrirCarpeta}
                      onRename={handleRenombrarCarpeta}
                      onDelete={handleEliminarCarpeta}
                      onMove={handleMoverCarpeta}
                      canEdit={esUsuarioExclusivo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grid de Materiales */}
            {sortedMateriales.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Archivos</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedMateriales.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      esExclusivo={esUsuarioExclusivo}
                      onEliminar={handleEliminarMaterial}
                      onFijar={handleFijarMaterial}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal para subir material */}
        {currentUser && (
          <>
            <SubirMaterialModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              usuario={currentUser}
              onMaterialSubido={handleMaterialSubido}
              carpetaActual={carpetaActual}
            />
            <CreateFolderModal
              isOpen={isFolderModalOpen}
              onClose={() => setIsFolderModalOpen(false)}
              onCrear={handleCrearCarpeta}
              carpetaPadre={carpetaActual}
            />
            {carpetaAMover && (
              <MoveFolderModal
                isOpen={isMoveFolderModalOpen}
                onClose={() => {
                  setIsMoveFolderModalOpen(false);
                  setCarpetaAMover(null);
                }}
                carpetaAMover={carpetaAMover}
                onMover={handleConfirmarMoverCarpeta}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Material;
