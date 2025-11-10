import { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2, Move } from 'lucide-react';

const FolderCard = ({ folder, onOpen, onRename, onDelete, onMove, canEdit }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleOpenFolder = () => {
    onOpen(folder.id);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const nuevoNombre = prompt('Nuevo nombre de carpeta:', folder.nombre);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      onRename(folder.id, nuevoNombre.trim());
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`¿Estás seguro de eliminar la carpeta "${folder.nombre}" y todo su contenido?`)) {
      onDelete(folder.id);
    }
  };

  const handleMove = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onMove(folder.id);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="group relative bg-card rounded-lg border border-border hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleOpenFolder}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Icono y Nombre */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Folder className="w-10 h-10 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary truncate">
                {folder.nombre}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                Creada el {formatearFecha(folder.fechaCreacion)}
              </p>
            </div>
          </div>

          {/* Menú de opciones */}
          {canEdit && (
            <div className="relative flex-shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-canvas transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop para cerrar el menú */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />

                  {/* Menú desplegable */}
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-20">
                    <button
                      onClick={handleRename}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-canvas flex items-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Renombrar</span>
                    </button>
                    <button
                      onClick={handleMove}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-canvas flex items-center space-x-2"
                    >
                      <Move className="w-4 h-4" />
                      <span>Mover</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-3 flex items-center text-xs text-text-muted">
          <span>Por {folder.autorNombre}</span>
        </div>
      </div>

      {/* Efecto hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-300 dark:group-hover:border-purple-600/50 rounded-lg pointer-events-none transition-colors" />
    </div>
  );
};

export default FolderCard;
