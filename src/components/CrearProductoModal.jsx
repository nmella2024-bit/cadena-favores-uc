import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { publicarProducto } from '../services/marketplaceService';
import PrimaryButton from './ui/PrimaryButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';
import SearchableSelect from './ui/SearchableSelect';
import { FACULTADES_UC } from '../data/facultades';

const CrearProductoModal = ({ isOpen, onClose, usuario, onProductoCreado }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreviews, setImagenesPreviews] = useState([]);
  const [facultadObjetivo, setFacultadObjetivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Opciones de facultades: todas las facultades UC + opción "Todas"
  const opcionesFacultades = ['Todas las facultades', ...FACULTADES_UC];

  const handleImagenesChange = async (e) => {
    const files = Array.from(e.target.files);

    if (imagenes.length + files.length > 5) {
      setError('Máximo 5 imágenes permitidas');
      e.target.value = ''; // Resetear el input
      return;
    }

    const nuevasImagenes = [];
    const nuevosPreviewsPromises = [];

    for (const file of files) {
      // Validar tamaño (máximo 5MB por imagen)
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagen no puede superar los 5MB');
        e.target.value = ''; // Resetear el input
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        e.target.value = ''; // Resetear el input
        return;
      }

      nuevasImagenes.push(file);

      // Crear preview de forma asíncrona pero ordenada
      const previewPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
      nuevosPreviewsPromises.push(previewPromise);
    }

    // Esperar a que todos los previews estén listos
    const nuevosPreviews = await Promise.all(nuevosPreviewsPromises);

    setImagenes([...imagenes, ...nuevasImagenes]);
    setImagenesPreviews([...imagenesPreviews, ...nuevosPreviews]);
    setError('');

    // Resetear el input para permitir seleccionar las mismas imágenes nuevamente si es necesario
    e.target.value = '';
  };

  const eliminarImagen = (index) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    const nuevosPreviews = imagenesPreviews.filter((_, i) => i !== index);
    setImagenes(nuevasImagenes);
    setImagenesPreviews(nuevosPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
      setError('El precio debe ser un número mayor a 0');
      return;
    }

    setEnviando(true);

    try {
      // Preparar datos del producto
      const facultadFinal = facultadObjetivo === 'Todas las facultades' || !facultadObjetivo ? 'Todas' : facultadObjetivo;
      const facultadesArray = facultadFinal === 'Todas' ? ['Todas'] : [facultadFinal];

      await publicarProducto(
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          precio: parseFloat(precio),
          facultades: facultadesArray // Cambio de carreras a facultades
        },
        usuario,
        imagenes
      );

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagenes([]);
      setImagenesPreviews([]);
      setFacultadObjetivo('');

      // Notificar que se creó el producto
      if (onProductoCreado) {
        onProductoCreado();
      }

      onClose();
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError('Error al publicar el producto. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    if (!enviando) {
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagenes([]);
      setImagenesPreviews([]);
      setFacultadObjetivo('');
      setError('');
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl transform overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                  <Dialog.Title className="text-lg sm:text-xl font-semibold text-text-primary">
                    Publicar producto en Marketplace
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={enviando}
                    className="rounded-lg p-1.5 sm:p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TextField
                    id="titulo"
                    name="titulo"
                    label="Título del producto"
                    placeholder="Ej: MacBook Pro 2020"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    maxLength={100}
                  />

                  <TextareaField
                    id="descripcion"
                    name="descripcion"
                    label="Descripción"
                    placeholder="Describe el producto con detalle (estado, características, etc.)..."
                    rows={6}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />

                  <TextField
                    id="precio"
                    name="precio"
                    type="number"
                    label="Precio (CLP)"
                    placeholder="50000"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    min="0"
                    step="1"
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Imágenes (opcional, máximo 5)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary">
                        <ImageIcon className="h-4 w-4" />
                        {imagenes.length > 0 ? `Agregar más (${imagenes.length}/5)` : 'Subir imágenes'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImagenesChange}
                          className="hidden"
                          disabled={enviando || imagenes.length >= 5}
                        />
                      </label>
                    </div>

                    {imagenesPreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {imagenesPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => eliminarImagen(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={enviando}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-xs text-text-muted">
                      Tamaño máximo: 5MB por imagen. Formatos: JPG, PNG, GIF.
                    </p>
                  </div>

                  <SearchableSelect
                    id="facultadObjetivo"
                    name="facultadObjetivo"
                    label="Dirigido a (opcional)"
                    value={facultadObjetivo}
                    onChange={(e) => setFacultadObjetivo(e.target.value)}
                    options={opcionesFacultades}
                    placeholder="Todas las facultades"
                    hint="Busca una facultad específica o deja en blanco para todas"
                    disabled={enviando}
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={enviando}
                      className="flex-1 rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <PrimaryButton
                      type="submit"
                      disabled={enviando}
                      className="flex-1 justify-center"
                    >
                      {enviando ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Publicando...
                        </>
                      ) : (
                        'Publicar producto'
                      )}
                    </PrimaryButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CrearProductoModal;
