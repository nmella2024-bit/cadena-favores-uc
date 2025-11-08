import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/authService';
import PrimaryButton from '../components/ui/PrimaryButton';

const EmailVerificationPending = () => {
  const { currentUser, firebaseUser, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Countdown para habilitar el botón de reenvío
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setMessage('');

    try {
      await resendVerificationEmail();
      setMessage('¡Correo de verificación reenviado! Revisa tu bandeja de entrada y spam.');
      setCanResend(false);
      setCountdown(60); // 60 segundos antes de poder reenviar nuevamente
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      // Recargar el usuario de Firebase para obtener el estado actualizado
      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        setMessage('¡Email verificado! Recargando...');
        // El AuthContext detectará el cambio y actualizará automáticamente
        window.location.reload();
      } else {
        setError('El correo aún no ha sido verificado. Por favor revisa tu email.');
      }
    } catch (err) {
      setError('Error al verificar el estado. Por favor intenta nuevamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Error al cerrar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-[rgb(var(--bg-card))] p-8 shadow-card animate-fade-in dark:bg-card/80">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
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
          <h2 className="mb-2 text-3xl font-bold text-text-primary">Verifica tu correo UC</h2>
          <p className="text-base text-text-muted">
            Hemos enviado un correo de verificación a:
          </p>
          <p className="mt-2 text-lg font-semibold text-brand">{currentUser?.email}</p>
        </div>

        <div className="mb-6 rounded-xl border border-brand/30 bg-brand/10 p-6 text-sm text-text-primary dark:border-brand/20 dark:bg-brand/15">
          <h3 className="mb-3 font-semibold text-brand">Instrucciones:</h3>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Revisa tu bandeja de entrada de Outlook o tu correo UC</li>
            <li>Busca el correo de verificación de NexUC (puede estar en spam)</li>
            <li>Haz clic en el enlace de verificación dentro del correo</li>
            <li>Regresa a esta página y presiona "Verificar Estado"</li>
          </ol>
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
            onClick={handleRefreshStatus}
            className="w-full justify-center py-3 text-base font-semibold"
          >
            Verificar Estado
          </PrimaryButton>

          <button
            onClick={handleResendEmail}
            disabled={!canResend || isResending}
            className="w-full rounded-xl border border-border bg-[rgb(var(--bg-card))] px-4 py-3 text-base font-medium text-text-primary transition-colors hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-card/50"
          >
            {isResending
              ? 'Reenviando...'
              : canResend
              ? 'Reenviar correo de verificación'
              : `Reenviar en ${countdown}s`}
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-[rgb(var(--bg-hover))] hover:text-text-primary"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-500">
          <p className="font-semibold mb-1">Nota importante:</p>
          <p>
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
            Los correos de verificación pueden tardar hasta 5 minutos en llegar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
