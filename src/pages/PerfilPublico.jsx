import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserData } from '../services/userService';
import { obtenerFavoresPorUsuario } from '../services/favorService';
import { obtenerCalificacionesUsuario } from '../services/ratingService';
import StarRating from '../components/StarRating';
import { ArrowLeft, Star, TrendingUp, User, Loader2 } from 'lucide-react';

const PerfilPublico = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userFavors, setUserFavors] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');

        // Cargar datos del usuario
        const user = await getUserData(userId);
        if (!user) {
          setError('Usuario no encontrado');
          return;
        }
        setUserData(user);

        // Cargar favores completados del usuario
        const favores = await obtenerFavoresPorUsuario(userId);
        setUserFavors(favores);

        // Cargar calificaciones
        const cals = await obtenerCalificacionesUsuario(userId);
        setCalificaciones(cals);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      cargarDatos();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const completedFavors = userFavors.filter(f => f.estado === 'completado');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start gap-6 mb-6">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-card border-2 border-border">
                {userData.fotoPerfil ? (
                  <img
                    src={userData.fotoPerfil}
                    alt={userData.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-brand/5">
                    <User className="h-12 w-12 sm:h-14 sm:w-14 text-brand/40" />
                  </div>
                )}
              </div>
            </div>

            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                {userData.nombre}
              </h1>
              <p className="text-text-muted">{userData.email}</p>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-text-primary">
                  {userData.reputacion?.toFixed(1) || '5.0'}
                </span>
              </div>
              {userData.totalCalificaciones > 0 && (
                <span className="text-xs text-text-muted">
                  {userData.totalCalificaciones} {userData.totalCalificaciones === 1 ? 'calificación' : 'calificaciones'}
                </span>
              )}
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            {userData.carrera && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-card border border-border text-sm text-text-muted">
                {userData.carrera}
              </span>
            )}
            {userData.año && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-card border border-border text-sm text-text-muted">
                {userData.año}° año
              </span>
            )}
            {userData.intereses && userData.intereses.length > 0 && (
              userData.intereses.slice(0, 3).map((interes, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-md bg-card border border-border text-sm text-text-muted"
                >
                  {interes}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-brand/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Favores publicados</p>
              <p className="text-3xl font-bold text-text-primary">
                {userFavors.length}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-emerald-500/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Completados</p>
              <p className="text-3xl font-bold text-emerald-500">
                {completedFavors.length}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-blue-500/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Ayudados</p>
              <p className="text-3xl font-bold text-blue-500">
                {userData.favoresCompletados?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Calificaciones */}
        {calificaciones.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Calificaciones</h2>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="space-y-3">
              {calificaciones.map((cal) => (
                <div key={cal.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-text-primary text-sm">{cal.calificadorNombre}</p>
                      <p className="text-xs text-text-muted">{cal.fecha}</p>
                    </div>
                    <StarRating rating={cal.estrellas} interactive={false} size="sm" />
                  </div>
                  {cal.comentario && (
                    <p className="text-sm text-text-muted italic">"{cal.comentario}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay calificaciones */}
        {calificaciones.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Star className="h-12 w-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">
              Este usuario aún no tiene calificaciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilPublico;
