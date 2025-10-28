import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { publicarAnuncio } from '../services/anuncioService';
import PrimaryButton from './ui/PrimaryButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';

const CrearAnuncioModal = ({ isOpen, onClose, usuario, onAnuncioCreado }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [carrera, setCarrera] = useState('');
  const [anio, setAnio] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Opciones de filtros
  const carreras = [
    'Ingeniería',
    'Arquitectura',
    'Economía',
    'College',
    'Todas'
  ];

  const anios = [1, 2, 3, 4, 5];

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB');
        e.target.value = ''; // Resetear el input
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        e.target.value = ''; // Resetear el input
        return;
      }

      setImagen(file);
      setError('');

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Resetear el input para permitir seleccionar la misma imagen nuevamente si es necesario
      e.target.value = '';
    }
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

    setEnviando(true);

    try {
      await publicarAnuncio(
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          carrera: carrera || 'Todas',
          anio: anio ? parseInt(anio) : null
        },
        usuario,
        imagen
      );

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setCarrera('');
      setAnio('');
      setImagen(null);
      setImagenPreview('');

      // Notificar que se creó el anuncio
      if (onAnuncioCreado) {
        onAnuncioCreado();
      }

      onClose();
    } catch (err) {
      console.error('Error al crear anuncio:', err);
      setError('Error al publicar el anuncio. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    if (!enviando) {
      setTitulo('');
      setDescripcion('');
      setCarrera('');
      setAnio('');
      setImagen(null);
      setImagenPreview('');
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold text-text-primary">
                    Publicar nuevo anuncio
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={enviando}
                    className="rounded-lg p-1 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
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
                    label="Título del anuncio"
                    placeholder="Ej: Nuevo horario de biblioteca"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    maxLength={100}
                  />

                  <TextareaField
                    id="descripcion"
                    name="descripcion"
                    label="Descripción"
                    placeholder="Describe el anuncio con detalle..."
                    rows={6}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Carrera */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Carrera (opcional)
                      </label>
                      <select
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      >
                        <option value="">Todas las carreras</option>
                        {carreras.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Año */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Año (opcional)
                      </label>
                      <select
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      >
                        <option value="">Todos los años</option>
                        {anios.map(a => (
                          <option key={a} value={a}>{a}º año</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Imagen (opcional)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary">
                        <ImageIcon className="h-4 w-4" />
                        {imagen ? 'Cambiar imagen' : 'Subir imagen'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImagenChange}
                          className="hidden"
                          disabled={enviando}
                        />
                      </label>
                      {imagen && (
                        <span className="text-sm text-text-muted">{imagen.name}</span>
                      )}
                    </div>
                    {imagenPreview && (
                      <div className="mt-3">
                        <img
                          src={imagenPreview}
                          alt="Preview"
                          className="max-h-48 rounded-lg border border-border"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-xs text-text-muted">
                      Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF.
                    </p>
                  </div>

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
                        'Publicar anuncio'
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

export default CrearAnuncioModal;
