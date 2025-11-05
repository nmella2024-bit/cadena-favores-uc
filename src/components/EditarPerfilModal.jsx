import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User } from 'lucide-react';
import { updateUserData } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';
import SelectField from './ui/SelectField';

const CARRERAS_UC = [
  'Ingeniería Civil',
  'Ingeniería Comercial',
  'Derecho',
  'Medicina',
  'Psicología',
  'Arquitectura',
  'Diseño',
  'Pedagogía',
  'Enfermería',
  'Agronomía',
  'Periodismo',
  'Otra'
];

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
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-2xl border border-border bg-card p-6 shadow-2xl dark:bg-card/95 my-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <User className="h-6 w-6 text-brand" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-text-primary">
                  Editar Perfil
                </Dialog.Title>
                <p className="text-sm text-text-muted mt-1">
                  Actualiza tu información personal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <SelectField
              label="Carrera"
              id="carrera"
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
              options={CARRERAS_UC}
            />

            {/* Año */}
            <SelectField
              label="Año"
              id="año"
              name="año"
              value={formData.año}
              onChange={handleChange}
              options={[1, 2, 3, 4, 5, 6]}
            />

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
              <label className="block text-sm font-medium text-text-primary mb-3">
                Intereses
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESES_DISPONIBLES.map((interes) => (
                  <button
                    key={interes}
                    type="button"
                    onClick={() => handleInteresesChange(interes)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <div className="flex gap-3 pt-4">
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
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </PrimaryButton>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditarPerfilModal;
