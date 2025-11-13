import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User } from 'lucide-react';
import { updateUserData } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';
import SearchableSelect from './ui/SearchableSelect';
import { CARRERAS_UC } from '../data/carreras';

const INTERESES_DISPONIBLES = [
  'Deportes',
  'Música',
  'Arte',
  'Tecnología',
  'Cocina',
  'Fotografía',
  'Viajes',
  'Lectura',
  'Gaming',
  'Voluntariado',
  'Emprendimiento',
  'Cine'
];

const EditarPerfilModal = ({ isOpen, onClose, onActualizacionExitosa }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    carrera: '',
    año: 1,
    telefono: '',
    descripcion: '',
    intereses: []
  });

  // Cargar datos actuales del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        nombre: currentUser.nombre || '',
        carrera: currentUser.carrera || '',
        año: currentUser.año || 1,
        telefono: currentUser.telefono || '',
        descripcion: currentUser.descripcion || '',
        intereses: currentUser.intereses || []
      });
    }
  }, [isOpen, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInteresesChange = (interes) => {
    setFormData(prev => {
      const intereses = prev.intereses.includes(interes)
        ? prev.intereses.filter(i => i !== interes)
        : [...prev.intereses, interes];
      return { ...prev, intereses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar nombre
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    // Validar teléfono si se ingresó
    if (formData.telefono.trim()) {
      const telefonoRegex = /^\+569\d{8}$/;
      if (!telefonoRegex.test(formData.telefono)) {
        alert('El número de WhatsApp debe tener el formato +569 seguido de 8 dígitos (Ej: +56912345678)');
        return;
      }
    }

    try {
      setLoading(true);

      // Actualizar datos del usuario
      await updateUserData(currentUser.uid, {
        nombre: formData.nombre.trim(),
        carrera: formData.carrera,
        año: parseInt(formData.año),
        telefono: formData.telefono.trim(),
        descripcion: formData.descripcion.trim(),
        intereses: formData.intereses
      });

      alert('Perfil actualizado exitosamente');

      if (onActualizacionExitosa) {
        onActualizacionExitosa();
      }

      onClose();

      // Recargar la página para actualizar el AuthContext
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(error.message || 'Error al actualizar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-[95vw] sm:max-w-xl md:max-w-2xl w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl dark:bg-card/95 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-brand/10 flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="text-lg sm:text-xl font-bold text-text-primary">
                  Editar Perfil
                </Dialog.Title>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 hidden sm:block">
                  Actualiza tu información personal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 sm:p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Nombre */}
            <TextField
              label="Nombre"
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />

            {/* Carrera */}
            <SearchableSelect
              label="Carrera"
              id="carrera"
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
              options={CARRERAS_UC}
              placeholder="Busca tu carrera..."
            />

            {/* Año */}
            <SelectField
              label="Año"
              id="año"
              name="año"
              value={formData.año}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6].map((año) => (
                <option key={año} value={año}>
                  {año}° año
                </option>
              ))}
            </SelectField>

            {/* WhatsApp */}
            <TextField
              label="WhatsApp"
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d+]/g, '');
                if (cleaned.length <= 12) {
                  setFormData(prev => ({ ...prev, telefono: cleaned }));
                }
              }}
              placeholder="+56912345678"
              maxLength={12}
              helpText="Formato: +569 seguido de 8 dígitos. Solo visible para tus contactos."
            />

            {/* Descripción */}
            <TextareaField
              label="Descripción"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={4}
              maxLength={500}
              helpText={`${formData.descripcion.length}/500 caracteres`}
            />

            {/* Intereses */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 sm:mb-3">
                Intereses
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {INTERESES_DISPONIBLES.map((interes) => (
                  <button
                    key={interes}
                    type="button"
                    onClick={() => handleInteresesChange(interes)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      formData.intereses.includes(interes)
                        ? 'bg-brand text-white'
                        : 'bg-card border border-border text-text-muted hover:border-brand/50'
                    }`}
                  >
                    {interes}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <GhostButton
                type="button"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </GhostButton>
              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Guardando...' : (
                  <>
                    <span className="hidden sm:inline">Guardar cambios</span>
                    <span className="inline sm:hidden">Guardar</span>
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditarPerfilModal;
