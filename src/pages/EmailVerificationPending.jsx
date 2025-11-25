import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/authService';
import PrimaryButton from '../components/ui/PrimaryButton';

const EmailVerificationPending = () => {
  const navigate = useNavigate();
  const { currentUser, logout, firebaseUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Función para reenviar el correo de verificación
  const handleResendEmail = async () => {
    setError('');
    setMessage('');
    setResending(true);

    try {
      await resendVerificationEmail();
      setMessage('Correo de verificación reenviado. Por favor revisa tu bandeja de entrada.');

      // Iniciar countdown de 60 segundos
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // Función para verificar el estado de verificación
  const handleCheckVerification = async () => {
    setError('');
    setMessage('');
    setChecking(true);

    try {
      // Recargar el usuario de Firebase para obtener el estado actualizado
      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        setMessage('¡Email verificado! Redirigiendo...');
        setTimeout(() => {
          navigate('/'); // Redirigir a la página principal
        }, 1000);
      } else {
        setError('Tu email aún no ha sido verificado. Por favor revisa tu correo y haz clic en el enlace.');
      }
    } catch (err) {
      setError('Error al verificar el estado. Intenta más tarde.');
    } finally {
      setChecking(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Error al cerrar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
            <svg
              className="h-8 w-8 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-text-primary">Verifica tu Email</h2>
          <p className="text-base text-text-muted">
            Te hemos enviado un correo de verificación a:
          </p>
          <p className="mt-2 text-lg font-semibold text-brand">{currentUser?.correo}</p>
        </div>

        <div className="mb-6 rounded-xl border border-brand/30 bg-brand/10 p-4 text-sm text-text-primary dark:border-brand/20 dark:bg-brand/15">
          <p className="mb-2 font-semibold">Instrucciones:</p>
          <ol className="list-decimal list-inside space-y-1 text-text-muted">
            <li>Abre tu correo electrónico</li>
            <li>Busca el email de NexU+</li>
            <li>Haz clic en el enlace de verificación</li>
            <li>Regresa aquí y haz clic en "Verificar estado"</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-brand/30">
            <p className="text-xs text-text-muted">
              <span className="font-medium">Nota:</span> El correo puede tardar entre 1 y 2 minutos en llegar.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-500">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <PrimaryButton
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full justify-center py-2 text-base font-semibold"
          >
            {checking ? 'Verificando...' : 'Verificar Estado'}
          </PrimaryButton>

          <button
            onClick={handleResendEmail}
            disabled={resending || countdown > 0}
            className="w-full rounded-xl border border-border bg-transparent py-2 px-4 text-base font-semibold text-text-primary transition-all hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending
              ? 'Reenviando...'
              : countdown > 0
              ? `Reenviar en ${countdown}s`
              : 'Reenviar Correo'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-border bg-transparent py-2 px-4 text-base font-semibold text-text-muted transition-all hover:bg-[rgb(var(--bg-hover))] hover:text-text-primary"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-6 rounded-xl border-2 border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 p-5 shadow-lg animate-pulse">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 rounded-full p-2 flex-shrink-0">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-2">
                ¿No recibiste el correo?
              </p>
              <p className="text-base text-orange-800 dark:text-orange-300 leading-relaxed">
                <span className="font-extrabold text-red-600 dark:text-red-400 text-lg">¡REVISA TU CARPETA DE SPAM!</span>
                <br />
                Los correos de verificación frecuentemente llegan a spam o correos no deseados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
