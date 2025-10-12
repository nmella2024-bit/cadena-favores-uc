import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import TextareaField from '../components/ui/TextareaField';

const initialFormState = {
  titulo: '',
  descripcion: '',
  categoria: '',
  disponibilidad: '',
};

const validateForm = ({ titulo, descripcion, categoria }) => {
  const errors = {};

  if (!titulo || titulo.trim().length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres.';
  } else if (titulo.length > 80) {
    errors.titulo = 'El título no puede superar los 80 caracteres.';
  }

  if (!descripcion || descripcion.trim().length < 30) {
    errors.descripcion = 'Describe el favor con al menos 30 caracteres.';
  }

  if (!categoria) {
    errors.categoria = 'Selecciona una categoría para tu favor.';
  }

  return errors;
};

const PublicarFavor = () => {
  const navigate = useNavigate();
  const { currentUser, publishFavor } = useAuth();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      publishFavor(formData);
      setShowSuccess(true);
      setFormData(initialFormState);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-canvas))] py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-4 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Publicar un favor</h1>
          <p className="mx-auto max-w-2xl text-[rgb(var(--text-muted))]">
            Comparte con la comunidad UC qué necesitas o en qué puedes ayudar. Mientras más claro seas, más rápido
            conectará contigo la persona indicada.
          </p>
        </header>

        {showSuccess && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Tu favor fue publicado.</h2>
                <p className="text-sm text-green-800">
                  Puedes revisar cómo luce en el feed y responder a quienes ofrezcan ayuda.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton as={Link} to="/favores" className="px-4 py-2">
                Ver en el feed
              </PrimaryButton>
              <GhostButton type="button" className="px-4 py-2" onClick={() => setShowSuccess(false)}>
                Seguir editando
              </GhostButton>
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-8 shadow-card"
          noValidate
        >
          <TextField
            id="titulo"
            name="titulo"
            label="Título del favor"
            placeholder="Ej: Busco apuntes de Economía II"
            value={formData.titulo}
            onChange={handleChange}
            error={errors.titulo}
            required
            maxLength={80}
          />

          <TextareaField
            id="descripcion"
            name="descripcion"
            label="Descripción"
            placeholder="Explica los detalles: por qué necesitas ayuda, plazos, qué ofreces a cambio, etc."
            value={formData.descripcion}
            onChange={handleChange}
            error={errors.descripcion}
            required
            rows={6}
          />

          <SelectField
            id="categoria"
            name="categoria"
            label="Categoría"
            value={formData.categoria}
            onChange={handleChange}
            error={errors.categoria}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </SelectField>

          <TextField
            id="disponibilidad"
            name="disponibilidad"
            label="Disponibilidad (opcional)"
            placeholder="Ej: Lunes y miércoles después de las 18:00"
            value={formData.disponibilidad}
            onChange={handleChange}
            hint="Si ofreces apoyo, describe horarios sugeridos para coordinar."
          />

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
            <div className="flex items-start gap-3">
              <Info className="mt-1 h-5 w-5" aria-hidden="true" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Tips para destacar:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Resume el objetivo del favor en la primera frase.</li>
                  <li>Incluye datos concretos: curso, materia, recursos necesarios.</li>
                  <li>Explica cómo puede ayudarte la otra persona y qué ofreces de vuelta.</li>
                  <li>Actualiza la publicación cuando recibas la ayuda que necesitas.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <GhostButton type="button" className="sm:w-auto" onClick={() => navigate('/favores')}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              type="submit"
              className="sm:w-auto"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Publicando…' : 'Publicar favor'}
            </PrimaryButton>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[rgb(var(--text-muted))]">
          Tus datos se almacenan localmente en tu navegador. Puedes editar o eliminar tus favores desde tu perfil.
        </p>
      </div>
    </div>
  );
};

export default PublicarFavor;
