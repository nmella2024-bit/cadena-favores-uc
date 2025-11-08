import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(formData.correo, formData.password);
      // No redirigir manualmente - el ProtectedRoute manejará la redirección
      // basándose en el estado de verificación del email
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-text-primary">Iniciar Sesión</h2>
          <p className="text-base text-text-muted">Bienvenido de vuelta a NexUC</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            <p className="font-semibold mb-1">Error al iniciar sesión</p>
            <p>{error}</p>
            {error.includes('no está registrada') && (
              <Link
                to="/registro"
                className="mt-3 inline-block font-semibold underline hover:text-red-400"
              >
                → Ir a registro
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            id="correo"
            name="correo"
            label="Correo UC"
            type="email"
            placeholder="tunombre@uc.cl"
            value={formData.correo}
            onChange={handleChange}
            required
          />

          <TextField
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <PrimaryButton type="submit" className="w-full justify-center py-2 text-base font-semibold">
            Ingresar
          </PrimaryButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-brand hover:text-brand/80 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
