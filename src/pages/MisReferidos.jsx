import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserReferrals } from '../services/referralService';
import ReferralStats from '../components/ReferralStats';
import { Calendar, User, Mail, Users } from 'lucide-react';

const MisReferidos = () => {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadReferrals();
    }
  }, [currentUser]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserReferrals(currentUser.uid);
      setReferrals(data);
    } catch (err) {
      console.error('Error al cargar referidos:', err);
      setError('Error al cargar la lista de referidos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';

    // Manejar Timestamp de Firestore
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-canvas))] py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Mis Referidos</h1>
          <p className="text-text-muted">
            Gestiona tus invitaciones y ve quién se ha unido usando tu código
          </p>
        </div>

        {/* Componente de estadísticas */}
        <div className="mb-8">
          <ReferralStats />
        </div>

        {/* Lista de referidos */}
        <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">
            Usuarios referidos ({referrals.length})
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border bg-white p-4 dark:bg-gray-800">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-500">
              {error}
            </div>
          ) : referrals.length === 0 ? (
            <div className="rounded-lg border border-border bg-white p-8 text-center dark:bg-gray-800">
              <Users className="mx-auto mb-4 h-16 w-16 text-text-muted opacity-50" />
              <p className="mb-2 text-lg font-medium text-text-primary">
                Aún no has referido a nadie
              </p>
              <p className="text-sm text-text-muted">
                Comparte tu código con tus amigos para que aparezcan aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="rounded-lg border border-border bg-white p-4 transition hover:shadow-md dark:bg-gray-800"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {referral.usuarioReferido?.fotoPerfil ? (
                        <img
                          src={referral.usuarioReferido.fotoPerfil}
                          alt={referral.usuarioReferido.nombre}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                          <User className="h-6 w-6 text-brand" />
                        </div>
                      )}
                    </div>

                    {/* Información del usuario */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-text-primary">
                            {referral.usuarioReferido?.nombre || 'Usuario'}
                          </h3>
                          <p className="flex items-center gap-1 text-sm text-text-muted">
                            <Mail className="h-3 w-3" />
                            {referral.emailReferido}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            referral.estado === 'completado'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-500'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                          }`}
                        >
                          {referral.estado === 'completado' ? 'Completado' : 'Pendiente'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>Registrado: {formatDate(referral.fechaRegistro)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
          <h3 className="mb-3 font-semibold text-blue-600 dark:text-blue-400">
            Sobre tus referidos
          </h3>
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
            <li>• Esta lista es privada, solo tú puedes verla</li>
            <li>• Los referidos se cuentan desde el momento del registro</li>
            <li>• Solo se cuentan usuarios que completen su registro y verifiquen su email</li>
            <li>• Comparte tu código con amigos para sumar más referidos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MisReferidos;
