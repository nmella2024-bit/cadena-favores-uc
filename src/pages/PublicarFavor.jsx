import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';
import { publicarFavor } from '../services/favorService';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import TextareaField from '../components/ui/TextareaField';
import SearchableSelect from '../components/ui/SearchableSelect';
import { FACULTADES_UC } from '../data/facultades';

const initialFormState = {
  titulo: '',
  descripcion: '',
  categoria: '',
  disponibilidad: '',
  facultadObjetivo: '', // Facultad a la que va dirigido
  duracion: '2', // Duración por defecto: 2 días
};

const validateForm = ({ titulo, descripcion, categoria }) => {
  const errors = {};

  if (!titulo || titulo.trim().length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres.';
  } else if (titulo.length > 80) {
    errors.titulo = 'El título no puede superar los 80 caracteres.';
  }

  // Description is now optional - no minimum character requirement

  if (!categoria) {
    errors.categoria = 'Selecciona una categoría para tu favor.';
  }

  return errors;
};

const PublicarFavor = () => {
  const navigate = useNavigate();
  const { currentUser, firebaseUser } = useAuth();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Opciones de facultades: todas las facultades UC + opción "Todas"
  const opcionesFacultades = ['Todas las facultades', ...FACULTADES_UC];

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

    if (!firebaseUser) {
      setFormError('Debes iniciar sesión para publicar un favor');
      return;
    }

    try {
      setIsSubmitting(true);

      // Preparar datos del favor
      const facultadFinal = formData.facultadObjetivo === 'Todas las facultades' || !formData.facultadObjetivo
        ? 'Todas'
        : formData.facultadObjetivo;
      const facultadesArray = facultadFinal === 'Todas' ? ['Todas'] : [facultadFinal];

      // Publicar favor usando el servicio de Firebase
      await publicarFavor({ ...formData, facultades: facultadesArray }, firebaseUser);

      setShowSuccess(true);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error al publicar favor:', error);
      setFormError(error.message || 'Error al publicar el favor. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-canvas))] py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-4 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Publicar un favor</h1>
          <p className="mx-auto max-w-2xl text-text-muted">
            Comparte con la comunidad UC qué necesitas o en qué puedes ayudar. Mientras más claro seas, más rápido
            conectará contigo la persona indicada.
          </p>
        </header>

        {showSuccess && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-400 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Tu favor fue publicado.</h2>
                <p className="text-sm text-emerald-300">
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
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-border bg-card dark:bg-card/80 p-8 shadow-card"
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
            label="Descripción (opcional)"
            placeholder="Explica los detalles: por qué necesitas ayuda, plazos, qué ofreces a cambio, etc."
            value={formData.descripcion}
            onChange={handleChange}
            error={errors.descripcion}
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

          <SelectField
            id="duracion"
            name="duracion"
            label="Duración de la publicación"
            value={formData.duracion}
            onChange={handleChange}
            required
          >
            <option value="1">1 día</option>
            <option value="2">2 días (recomendado)</option>
            <option value="3">3 días</option>
            <option value="7">7 días</option>
          </SelectField>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400">
            <div className="flex items-start gap-3">
              <Info className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm">
                Tu favor se eliminará automáticamente después del tiempo seleccionado. Si alguien fija tu favor, este permanecerá visible de forma indefinida.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4 text-brand">
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

          <SearchableSelect
            id="facultadObjetivo"
            name="facultadObjetivo"
            label="Dirigido a (opcional)"
            value={formData.facultadObjetivo}
            onChange={handleChange}
            options={opcionesFacultades}
            placeholder="Todas las facultades"
            hint="Busca una facultad específica o deja en blanco para todas"
          />

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

        <p className="mt-6 text-center text-xs text-text-muted">
          Tus datos se almacenan localmente en tu navegador. Puedes editar o eliminar tus favores desde tu perfil.
        </p>
      </div>
    </div>
  );
};

export default PublicarFavor;
