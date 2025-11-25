import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Copy, Check, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserReferralCode, getUserReferralCount, generateReferralLink } from '../services/referralService';

const ReferralStats = ({ compact = false }) => {
  const { currentUser } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadReferralData();
    }
  }, [currentUser]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const code = await getUserReferralCode(currentUser.uid);
      const count = await getUserReferralCount(currentUser.uid);
      const link = generateReferralLink(code);

      setReferralCode(code);
      setReferralCount(count);
      setReferralLink(link);
    } catch (error) {
      console.error('Error al cargar datos de referidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar código:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar link:', error);
    }
  };

  const handleShare = async () => {
    const shareText = `¡Únete a NexU+ usando mi código de referido: ${referralCode}!\n\nRegistrate aquí: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a NexU+',
          text: shareText,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      await handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-8 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
              <Users className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Referidos</p>
              <p className="text-2xl font-bold text-text-primary">{referralCount}</p>
            </div>
          </div>
          <Link
            to="/mis-referidos"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
          <Users className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Programa de Referidos</h3>
          <p className="text-sm text-text-muted">Invita amigos y ayuda a crecer la comunidad</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">Tu código de referido</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand transition hover:bg-brand/10"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copiar
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-md bg-white p-3 dark:bg-gray-800">
          <code className="text-2xl font-bold tracking-wider text-brand">{referralCode}</code>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-text-muted">Link para compartir</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary dark:bg-gray-800"
          />
          <button
            onClick={handleCopyLink}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/10 dark:bg-gray-800"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
          <button
            onClick={handleShare}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted">Total de referidos</p>
            <p className="text-3xl font-bold text-brand">{referralCount}</p>
          </div>
          <Link
            to="/mis-referidos"
            className="text-sm font-medium text-brand hover:underline"
          >
            Ver lista completa →
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
        <p className="font-medium">¿Cómo funciona?</p>
        <ol className="mt-2 ml-4 list-decimal space-y-1">
          <li>Comparte tu código o link con tus amigos</li>
          <li>Ellos lo usan al registrarse en NexU+</li>
          <li>Se suman automáticamente a tu contador</li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralStats;
