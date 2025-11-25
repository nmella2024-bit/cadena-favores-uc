import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendPasswordReset } from '../services/authService';
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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

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

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess(false);

    try {
      await sendPasswordReset(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-text-primary">
            {showResetPassword ? 'Restablecer Contraseña' : 'Iniciar Sesión'}
          </h2>
          <p className="text-base text-text-muted">
            {showResetPassword
              ? 'Te enviaremos un enlace para restablecer tu contraseña'
              : 'Bienvenido de vuelta a NexU+'}
          </p>
        </div>

        {!showResetPassword ? (
          <>
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

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-brand hover:text-brand/80 hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

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
          </>
        ) : (
          <>
            {resetSuccess && (
              <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
                <p className="font-semibold mb-1">Correo enviado</p>
                <p className="mb-2">
                  Hemos enviado un enlace de restablecimiento a tu correo electrónico.
                </p>
                <p className="text-xs">
                  <strong>Nota:</strong> Si no ves el correo, revisa tu carpeta de spam.
                </p>
              </div>
            )}

            {resetError && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                <p className="font-semibold mb-1">Error</p>
                <p>{resetError}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <TextField
                id="resetEmail"
                name="resetEmail"
                label="Correo UC"
                type="email"
                placeholder="tunombre@uc.cl"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-500">
                <p className="font-semibold mb-1">Importante:</p>
                <p>
                  El correo será enviado desde Firebase Authentication.
                  Si no lo encuentras en tu bandeja principal, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelReset}
                  className="flex-1 rounded-xl border border-border bg-transparent py-2 text-base font-semibold text-text-primary hover:bg-[rgb(var(--bg-hover))] transition-colors"
                >
                  Cancelar
                </button>
                <PrimaryButton type="submit" className="flex-1 justify-center py-2 text-base font-semibold">
                  Enviar enlace
                </PrimaryButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
