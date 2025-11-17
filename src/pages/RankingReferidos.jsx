import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReferralRanking, getReferralStats } from '../services/referralService';
import { Trophy, Users, TrendingUp, Award, Download } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const RankingReferidos = () => {
  const { currentUser } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [rankingData, statsData] = await Promise.all([
        getReferralRanking(50),
        getReferralStats(),
      ]);

      setRanking(rankingData);
      setStats(statsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Posición', 'Nombre', 'Email', 'Carrera', 'Total Referidos', 'Código'];
    const rows = ranking.map((user, index) => [
      index + 1,
      user.nombre,
      user.email,
      user.carrera || 'N/A',
      user.totalReferidos,
      user.codigoReferido,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ranking_referidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  // Solo permitir acceso a admins y usuarios exclusivos
  if (currentUser && currentUser.rol !== 'admin' && currentUser.rol !== 'exclusivo') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-canvas))] py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Ranking de Referidos</h1>
            <p className="text-text-muted">Concurso activo hasta el 21 de noviembre de 2025</p>
          </div>
          {ranking.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand/90"
            >
              <Download className="h-5 w-5" />
              Exportar CSV
            </button>
          )}
        </div>

        {/* Estadísticas generales */}
        {stats && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
                  <Users className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Total Referidos</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalReferidos}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Usuarios activos</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.totalUsuariosConReferidos}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Con código</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.totalUsuariosConCodigo}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Promedio</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.promedioReferidosPorUsuario}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de ranking */}
        <div className="rounded-xl border border-border bg-[rgb(var(--bg-card))] shadow-card">
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Top {ranking.length} usuarios con más referidos
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-border bg-white p-4 dark:bg-gray-800"
                  >
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
            ) : ranking.length === 0 ? (
              <div className="rounded-lg border border-border bg-white p-8 text-center dark:bg-gray-800">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-text-muted opacity-50" />
                <p className="mb-2 text-lg font-medium text-text-primary">
                  Aún no hay referidos registrados
                </p>
                <p className="text-sm text-text-muted">
                  Los usuarios comenzarán a aparecer cuando empiecen a referir
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm font-medium text-text-muted">
                      <th className="pb-3 pr-4">Posición</th>
                      <th className="pb-3 pr-4">Usuario</th>
                      <th className="pb-3 pr-4">Carrera</th>
                      <th className="pb-3 pr-4">Código</th>
                      <th className="pb-3 text-right">Referidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          index < 3 ? 'bg-yellow-50/50 dark:bg-yellow-500/5' : ''
                        }`}
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(index + 1)}
                            <span
                              className={`text-lg font-bold ${
                                index < 3 ? 'text-brand' : 'text-text-muted'
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {user.fotoPerfil ? (
                              <img
                                src={user.fotoPerfil}
                                alt={user.nombre}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                                <span className="font-semibold text-brand">
                                  {user.nombre?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/perfil/${user.id}`}
                                className="font-medium text-text-primary hover:text-brand hover:underline"
                              >
                                {user.nombre}
                              </Link>
                              <p className="text-xs text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-text-muted">{user.carrera || 'N/A'}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-brand dark:bg-gray-800">
                            {user.codigoReferido}
                          </code>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-2xl font-bold text-brand">{user.totalReferidos}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
          <h3 className="mb-3 font-semibold text-blue-600 dark:text-blue-400">
            Información del concurso
          </h3>
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
            <li>• El ranking se actualiza en tiempo real</li>
            <li>• Solo se cuentan referidos con registro completo y email verificado</li>
            <li>• El concurso finaliza el 21 de noviembre de 2025 a las 23:59</li>
            <li>• Puedes exportar el ranking en formato CSV para análisis externo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RankingReferidos;
