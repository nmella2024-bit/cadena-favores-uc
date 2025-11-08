import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import TextareaField from '../components/ui/TextareaField';

const Registro = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    carrera: '',
    año: '',
    telefono: '',
    intereses: '',
    descripcion: '',
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Validación especial para el campo de correo
    if (name === 'correo') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validar correo UC en tiempo real
      const ucEmailRegex = /^[a-zA-Z0-9._-]+@(uc\.cl|estudiante\.uc\.cl)$/;
      if (value && !ucEmailRegex.test(value)) {
        setEmailError('Debes usar un correo UC válido (@uc.cl o @estudiante.uc.cl)');
      } else {
        setEmailError('');
      }
    }
    // Validación especial para el campo de teléfono
    else if (name === 'telefono') {
      // Solo permitir números, el símbolo + y limitar a 12 caracteres (+56912345678)
      const cleaned = value.replace(/[^\d+]/g, '');

      // Limitar a 12 caracteres máximo
      if (cleaned.length <= 12) {
        setFormData((prev) => ({
          ...prev,
          [name]: cleaned,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validar correo UC
    const ucEmailRegex = /^[a-zA-Z0-9._-]+@(uc\.cl|estudiante\.uc\.cl)$/;
    if (!ucEmailRegex.test(formData.correo)) {
      setError('Debes usar un correo UC válido (@uc.cl o @estudiante.uc.cl)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.telefono) {
      setError('El número de WhatsApp es requerido para conectar con otros estudiantes');
      return;
    }

    // Validar formato de teléfono chileno (+569 + 8 dígitos)
    const telefonoRegex = /^\+569\d{8}$/;
    if (!telefonoRegex.test(formData.telefono)) {
      setError('El número de WhatsApp debe tener el formato +569 seguido de 8 dígitos (Ej: +56912345678)');
      return;
    }

    try {
      const interesesArray = formData.intereses
        .split(',')
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0);

      await register({
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        carrera: formData.carrera,
        año: parseInt(formData.año, 10),
        telefono: formData.telefono,
        intereses: interesesArray,
        descripcion: formData.descripcion,
      });

      // No redirigir automáticamente - el AuthContext manejará la redirección
      // a la página de verificación de email
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-text-primary">Crear Cuenta</h2>
          <p className="text-base text-text-muted">Únete a la comunidad de NexUC</p>
        </div>

        <div className="mb-6 rounded-xl border border-brand/30 bg-brand/10 p-4 text-sm text-brand dark:border-brand/20 dark:bg-brand/15">
          <p>
            <strong>Correo UC válido:</strong> Solo se aceptan correos @uc.cl o @estudiante.uc.cl
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {emailError && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-500">
            {emailError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="nombre"
              name="nombre"
              label="Nombre Completo *"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <TextField
              id="correo"
              name="correo"
              type="email"
              label="Correo UC *"
              placeholder="tunombre@uc.cl o @estudiante.uc.cl"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="password"
              name="password"
              type="password"
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar Contraseña *"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              id="carrera"
              name="carrera"
              label="Carrera *"
              value={formData.carrera}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu carrera</option>
              <option value="Ingeniería Civil">Ingeniería Civil</option>
              <option value="Ingeniería Comercial">Ingeniería Comercial</option>
              <option value="Derecho">Derecho</option>
              <option value="Medicina">Medicina</option>
              <option value="Enfermería">Enfermería</option>
              <option value="College">College</option>
              <option value="Construcción Civil">Construcción Civil</option>
            </SelectField>

            <SelectField id="año" name="año" label="Año *" value={formData.año} onChange={handleChange} required>
              <option value="">Selecciona</option>
              <option value="1">1º año</option>
              <option value="2">2º año</option>
              <option value="3">3º año</option>
              <option value="4">4º año</option>
              <option value="5">5º año</option>
              <option value="6">Postgrado</option>
            </SelectField>
          </div>

          <TextField
            id="telefono"
            name="telefono"
            type="tel"
            label="Número de WhatsApp *"
            placeholder="+56912345678 (11 dígitos)"
            value={formData.telefono}
            onChange={handleChange}
            hint="Formato: +569 seguido de 8 dígitos. Solo visible para quienes conectes."
            required
            maxLength={12}
          />

          <TextField
            id="intereses"
            name="intereses"
            label="Intereses (separados por comas)"
            placeholder="Ej: Matemáticas, Programación, Deportes"
            value={formData.intereses}
            onChange={handleChange}
          />

          <TextareaField
            id="descripcion"
            name="descripcion"
            label="Breve descripción"
            placeholder="Cuéntanos un poco sobre ti..."
            rows={3}
            value={formData.descripcion}
            onChange={handleChange}
          />

          <PrimaryButton type="submit" className="w-full justify-center py-2 text-base font-semibold">
            Crear Cuenta
          </PrimaryButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand/80 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
