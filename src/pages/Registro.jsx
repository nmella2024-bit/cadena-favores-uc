import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import TextareaField from '../components/ui/TextareaField';
import SearchableSelect from '../components/ui/SearchableSelect';
import { CARRERAS_UC } from '../data/carreras';
import { validateReferralCode } from '../services/referralService';

const Registro = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

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
    codigoReferido: '',
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [referralStatus, setReferralStatus] = useState(null); // null, 'valid', 'invalid'
  const [referralUser, setReferralUser] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);

  // Leer código de referido de la URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData((prev) => ({
        ...prev,
        codigoReferido: refCode,
      }));
      // Validar el código automáticamente
      validateReferralCodeInput(refCode);
    }
  }, [searchParams]);

  // Validar código de referido
  const validateReferralCodeInput = async (code) => {
    if (!code || code.trim().length === 0) {
      setReferralStatus(null);
      setReferralUser(null);
      return;
    }

    setValidatingReferral(true);
    try {
      const user = await validateReferralCode(code);
      if (user) {
        setReferralStatus('valid');
        setReferralUser(user);
      } else {
        setReferralStatus('invalid');
        setReferralUser(null);
      }
    } catch (error) {
      console.error('Error validando código:', error);
      setReferralStatus('invalid');
      setReferralUser(null);
    } finally {
      setValidatingReferral(false);
    }
  };

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
    }
    // Validación para código de referido
    else if (name === 'codigoReferido') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
      // Validar el código cuando el usuario deja de escribir
      if (value.length >= 3) {
        validateReferralCodeInput(value);
      } else {
        setReferralStatus(null);
        setReferralUser(null);
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

      await register(
        {
          nombre: formData.nombre,
          correo: formData.correo,
          password: formData.password,
          carrera: formData.carrera,
          año: parseInt(formData.año, 10),
          telefono: formData.telefono,
          intereses: interesesArray,
          descripcion: formData.descripcion,
        },
        formData.codigoReferido || null
      );

      // Redirigir a la página de verificación de email
      navigate('/verificar-email');
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
            <SearchableSelect
              id="carrera"
              name="carrera"
              label="Carrera"
              value={formData.carrera}
              onChange={handleChange}
              options={CARRERAS_UC}
              placeholder="Busca tu carrera..."
              required
              hint="Escribe para buscar entre las 75 carreras UC"
            />

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

          <div className="relative">
            <TextField
              id="codigoReferido"
              name="codigoReferido"
              label="Código de Referido (Opcional)"
              placeholder="Ej: ABC123"
              value={formData.codigoReferido}
              onChange={handleChange}
              hint="Si alguien te invitó, ingresa su código aquí"
            />
            {validatingReferral && (
              <div className="absolute right-3 top-9 text-sm text-text-muted">
                Validando...
              </div>
            )}
            {referralStatus === 'valid' && referralUser && (
              <div className="mt-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-500">
                ✓ Código válido: Te invitó <strong>{referralUser.nombre}</strong>
              </div>
            )}
            {referralStatus === 'invalid' && formData.codigoReferido && (
              <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
                ⚠ Código no válido (puedes continuar sin él)
              </div>
            )}
          </div>

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
