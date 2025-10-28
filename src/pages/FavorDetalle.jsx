import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  obtenerFavor,
  aceptarAyudante,
  completarFavorConAyudante
} from '../services/favorService';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import RatingModal from '../components/RatingModal';

const FavorDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favor, setFavor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mostrarRating, setMostrarRating] = useState(false);

  useEffect(() => {
    cargarFavor();
  }, [id]);

  const cargarFavor = async () => {
    try {
      setLoading(true);
      const favorData = await obtenerFavor(id);

      if (!favorData) {
        setError('Favor no encontrado');
        return;
      }

      // Verificar que el usuario actual sea el creador del favor
      if (favorData.usuarioId !== currentUser?.uid) {
        setError('No tienes permiso para ver esta página');
        return;
      }

      setFavor(favorData);
    } catch (err) {
      console.error('Error al cargar favor:', err);
      setError('Error al cargar el favor');
    } finally {
      setLoading(false);
    }
  };

  const handleAceptarAyudante = async (ayudanteId) => {
    if (!confirm('¿Estás seguro de que quieres aceptar a este ayudante? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setProcesando(true);
      await aceptarAyudante(id, currentUser.uid, ayudanteId);
      await cargarFavor(); // Recargar para ver cambios
      alert('¡Ayudante aceptado! Ahora puedes contactarlo por WhatsApp.');
    } catch (err) {
      console.error('Error al aceptar ayudante:', err);
      alert(err.message || 'Error al aceptar el ayudante');
    } finally {
      setProcesando(false);
    }
  };

  const handleCompletarFavor = async () => {
    if (!confirm('¿Estás seguro de que el favor ha sido completado?')) {
      return;
    }

    try {
      setProcesando(true);
      await completarFavorConAyudante(id, currentUser.uid);
      setMostrarRating(true); // Mostrar modal de rating
    } catch (err) {
      console.error('Error al completar favor:', err);
      alert(err.message || 'Error al completar el favor');
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoBadge = () => {
    if (!favor) return null;

    const badges = {
      activo: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      pendiente: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      en_proceso: { text: 'En proceso', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      completado: { text: 'Completado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }
    };

    const badge = badges[favor.estado] || badges.pendiente;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--text-primary)] mb-4">{error}</p>
          <button
            onClick={() => navigate('/perfil')}
            className="text-brand hover:underline"
          >
            Volver al perfil
          </button>
        </div>
      </div>
    );
  }

  if (!favor) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón volver */}
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al perfil
        </button>

        {/* Card principal del favor */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 mb-6">
          {/* Header con título y badge */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {favor.titulo}
            </h1>
            {getEstadoBadge()}
          </div>

          {/* Descripción */}
          <p className="text-[var(--text-secondary)] mb-6">
            {favor.descripcion}
          </p>

          {/* Información del favor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <MapPin className="h-5 w-5 text-brand" />
              <span>{favor.ubicacion}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Clock className="h-5 w-5 text-brand" />
              <span>{new Date(favor.fechaCreacion?.toDate()).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Botón completar favor (solo si está en proceso) */}
          {favor.estado === 'en_proceso' && (
            <button
              onClick={handleCompletarFavor}
              disabled={procesando}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {procesando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Marcar como completado
                </>
              )}
            </button>
          )}

          {/* Información del ayudante seleccionado */}
          {favor.ayudanteSeleccionado && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-3">
                Ayudante seleccionado
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {favor.ayudanteSeleccionado.fotoPerfil ? (
                    <img
                      src={favor.ayudanteSeleccionado.fotoPerfil}
                      alt={favor.ayudanteSeleccionado.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">
                    {favor.ayudanteSeleccionado.nombre}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {favor.ayudanteSeleccionado.carrera}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${favor.ayudanteSeleccionado.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Lista de ayudantes (solo si no hay ayudante seleccionado) */}
        {!favor.ayudanteSeleccionado && favor.ayudantes && favor.ayudantes.length > 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Usuarios que se han ofrecido a ayudar ({favor.ayudantes.length})
            </h2>

            <div className="space-y-4">
              {favor.ayudantes.map((ayudante) => (
                <div
                  key={ayudante.idUsuario}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:border-brand/30 transition-colors"
                >
                  {/* Foto de perfil */}
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ayudante.fotoPerfil ? (
                      <img
                        src={ayudante.fotoPerfil}
                        alt={ayudante.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-7 w-7 text-white" />
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">
                      {ayudante.nombre}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {ayudante.carrera}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Se ofreció el {new Date(ayudante.fechaOferta?.toDate()).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2">
                    <Link
                      to={`/perfil/${ayudante.idUsuario}`}
                      className="px-4 py-2 border border-[var(--border-color)] hover:border-brand text-[var(--text-secondary)] hover:text-brand rounded-lg transition-colors text-sm"
                    >
                      Ver perfil
                    </Link>
                    <button
                      onClick={() => handleAceptarAyudante(ayudante.idUsuario)}
                      disabled={procesando}
                      className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      Aceptar ayuda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay ayudantes */}
        {!favor.ayudanteSeleccionado && (!favor.ayudantes || favor.ayudantes.length === 0) && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-8 text-center">
            <User className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">
              Aún no hay usuarios que se hayan ofrecido a ayudar
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              Espera a que alguien se ofrezca para poder aceptar su ayuda
            </p>
          </div>
        )}
      </div>

      {/* Modal de rating */}
      {mostrarRating && favor.ayudanteSeleccionado && (
        <RatingModal
          isOpen={mostrarRating}
          onClose={() => setMostrarRating(false)}
          ayudanteId={favor.ayudanteSeleccionado.idUsuario}
          ayudanteNombre={favor.ayudanteSeleccionado.nombre}
          onRatingComplete={() => {
            cargarFavor();
            navigate('/perfil');
          }}
        />
      )}
    </div>
  );
};

export default FavorDetalle;
