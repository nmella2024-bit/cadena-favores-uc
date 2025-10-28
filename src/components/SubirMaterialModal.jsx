import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { subirMaterial } from '../services/materialService';
import PrimaryButton from './ui/PrimaryButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';

const SubirMaterialModal = ({ isOpen, onClose, usuario, onMaterialSubido }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [carrera, setCarrera] = useState('');
  const [anio, setAnio] = useState('');
  const [ramo, setRamo] = useState('');
  const [tags, setTags] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [enlaceExterno, setEnlaceExterno] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Opciones de filtros
  const carreras = [
    'Ingeniería',
    'Arquitectura',
    'Economía',
    'College',
    'Otras'
  ];

  const anios = [1, 2, 3, 4, 5];

  // Ramos dinámicos según carrera
  const ramosPorCarrera = {
    'Ingeniería': [
      'Cálculo I',
      'Cálculo II',
      'Cálculo III',
      'Álgebra Lineal',
      'Física I',
      'Física II',
      'Química General',
      'Programación',
      'Estructuras de Datos',
      'Ecuaciones Diferenciales'
    ],
    'Arquitectura': [
      'Taller de Arquitectura',
      'Historia de la Arquitectura',
      'Estructuras',
      'Construcción',
      'Teoría de la Arquitectura'
    ],
    'Economía': [
      'Microeconomía',
      'Macroeconomía',
      'Econometría',
      'Matemáticas para Economistas',
      'Finanzas'
    ],
    'College': [
      'Antropología',
      'Filosofía',
      'Historia',
      'Biología',
      'Química'
    ],
    'Otras': []
  };

  const ramosDisponibles = carrera ? ramosPorCarrera[carrera] || [] : [];

  // Resetear ramo cuando cambia la carrera
  useEffect(() => {
    setRamo('');
  }, [carrera]);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!tiposPermitidos.includes(file.type)) {
      setError('Solo se permiten archivos PDF y DOCX');
      e.target.value = '';
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar los 10MB');
      e.target.value = '';
      return;
    }

    setArchivo(file);
    setArchivoNombre(file.name);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!carrera) {
      setError('Debes seleccionar una carrera');
      return;
    }

    if (!anio) {
      setError('Debes seleccionar un año');
      return;
    }

    if (!ramo) {
      setError('Debes seleccionar un ramo');
      return;
    }

    // Validar que haya archivo O enlace externo
    if (!archivo && !enlaceExterno.trim()) {
      setError('Debes subir un archivo o proporcionar un enlace externo');
      return;
    }

    // Validar formato de URL si hay enlace externo
    if (enlaceExterno.trim()) {
      try {
        new URL(enlaceExterno.trim());
      } catch {
        setError('El enlace externo no es una URL válida');
        return;
      }
    }

    setEnviando(true);

    try {
      // Procesar tags
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await subirMaterial(
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          carrera,
          anio,
          ramo,
          tags: tagsArray,
          enlaceExterno: enlaceExterno.trim() || null,
        },
        usuario,
        archivo
      );

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setCarrera('');
      setAnio('');
      setRamo('');
      setTags('');
      setArchivo(null);
      setArchivoNombre('');
      setEnlaceExterno('');

      // Notificar que se subió el material
      if (onMaterialSubido) {
        onMaterialSubido();
      }

      onClose();
    } catch (err) {
      console.error('Error al subir material:', err);
      setError('Error al subir el material. Intenta nuevamente.');
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
      setRamo('');
      setTags('');
      setArchivo(null);
      setArchivoNombre('');
      setEnlaceExterno('');
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
                    Subir Material de Estudio
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
                    label="Título del material"
                    placeholder="Ej: Resumen Álgebra Lineal - 2024"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    maxLength={100}
                  />

                  <TextareaField
                    id="descripcion"
                    name="descripcion"
                    label="Descripción"
                    placeholder="Describe el contenido del material..."
                    rows={4}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Carrera */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Carrera *
                      </label>
                      <select
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      >
                        <option value="">Selecciona...</option>
                        {carreras.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Año */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Año *
                      </label>
                      <select
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      >
                        <option value="">Selecciona...</option>
                        {anios.map(a => (
                          <option key={a} value={a}>{a}º año</option>
                        ))}
                      </select>
                    </div>

                    {/* Ramo */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Ramo *
                      </label>
                      <select
                        value={ramo}
                        onChange={(e) => setRamo(e.target.value)}
                        required
                        disabled={!carrera}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Selecciona...</option>
                        {ramosDisponibles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TextField
                    id="tags"
                    name="tags"
                    label="Etiquetas (opcional)"
                    placeholder="Ej: matrices, vectores, resumen"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    helperText="Separa las etiquetas con comas"
                  />

                  {/* Enlace externo */}
                  <div>
                    <TextField
                      id="enlaceExterno"
                      name="enlaceExterno"
                      label="Enlace externo (opcional)"
                      placeholder="https://drive.google.com/... o https://dropbox.com/..."
                      value={enlaceExterno}
                      onChange={(e) => setEnlaceExterno(e.target.value)}
                      helperText="Link a Google Drive, Dropbox, OneDrive, etc."
                    />
                    {enlaceExterno && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        ℹ️ Si proporcionas un enlace externo, el archivo adjunto es opcional
                      </p>
                    )}
                  </div>

                  {/* Subir archivo */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Archivo {enlaceExterno.trim() ? '(opcional)' : '*'}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary">
                        <Upload className="h-4 w-4" />
                        {archivo ? 'Cambiar archivo' : 'Seleccionar archivo'}
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleArchivoChange}
                          className="hidden"
                          disabled={enviando}
                        />
                      </label>
                      {archivoNombre && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-xs">{archivoNombre}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      Formatos permitidos: PDF, DOCX. Tamaño máximo: 10MB
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
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir material
                        </>
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

export default SubirMaterialModal;
