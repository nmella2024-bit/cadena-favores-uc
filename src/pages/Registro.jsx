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
    aA�o: '',
    intereses: '',
    descripcion: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseA�as no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseA�a debe tener al menos 6 caracteres');
      return;
    }

    try {
      const interesesArray = formData.intereses
        .split(',')
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0);

      register({
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        carrera: formData.carrera,
        aA�o: parseInt(formData.aA�o, 10),
        intereses: interesesArray,
        descripcion: formData.descripcion,
      });

      alert('A�Cuenta creada exitosamente!');
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-text-primary">Crear Cuenta</h2>
          <p className="text-base text-text-muted">Asnete a la comunidad de Red UC</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="nombre"
              name="nombre"
              label="Nombre Completo *"
              placeholder="Juan PAcrez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <TextField
              id="correo"
              name="correo"
              type="email"
              label="Correo UC *"
              placeholder="tunombre@uc.cl"
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
              label="ContraseA�a *"
              placeholder="MA-nimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar ContraseA�a *"
              placeholder="Repite tu contraseA�a"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="carrera"
              name="carrera"
              label="Carrera *"
              placeholder="Ej: IngenierA-a, Derecho"
              value={formData.carrera}
              onChange={handleChange}
              required
            />

            <SelectField id="aA�o" name="aA�o" label="AA�o *" value={formData.aA�o} onChange={handleChange} required>
              <option value="">Selecciona</option>
              <option value="1">1A� aA�o</option>
              <option value="2">2A� aA�o</option>
              <option value="3">3A� aA�o</option>
              <option value="4">4A� aA�o</option>
              <option value="5">5A� aA�o</option>
              <option value="6">Postgrado</option>
            </SelectField>
          </div>

          <TextField
            id="intereses"
            name="intereses"
            label="Intereses (separados por comas)"
            placeholder="Ej: MatemA�ticas, ProgramaciA3n, Deportes"
            value={formData.intereses}
            onChange={handleChange}
          />

          <TextareaField
            id="descripcion"
            name="descripcion"
            label="Breve descripciA3n"
            placeholder="CuAcntanos un poco sobre ti..."
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
            A�Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand/80 hover:underline">
              Inicia sesiA3n aquA-
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
