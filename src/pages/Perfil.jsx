import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerFavoresPorUsuario, obtenerFavoresConContactos } from '../services/favorService';
import { updateUserData, uploadProfilePicture, deleteUserProfile } from '../services/userService';
import { obtenerCalificacionesUsuario } from '../services/ratingService';
// TEMPORALMENTE DESHABILITADO: UCloseMeal
// import { obtenerMisPedidos } from '../services/orderService';
import StarRating from '../components/StarRating';
import EditarPerfilModal from '../components/EditarPerfilModal';
import VerifiedBadge from '../components/VerifiedBadge';
import ReferralStats from '../components/ReferralStats';
import { Plus, ExternalLink, Star, AlertCircle, TrendingUp, Camera, User, Edit2, Trash2 } from 'lucide-react';
import SolicitudesProfesores from '../components/admin/SolicitudesProfesores';
import { esAdmin } from '../utils/adminUtils';

const Perfil = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userFavors, setUserFavors] = useState([]);
  const [favoresConContactos, setFavoresConContactos] = useState({ publicados: [], respondidos: [] });
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [calificaciones, setCalificaciones] = useState([]);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(true);
  // TEMPORALMENTE DESHABILITADO: UCloseMeal
  // const [pedidos, setPedidos] = useState([]);
  // const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Cargar favores del usuario
  useEffect(() => {
    const cargarFavores = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const favores = await obtenerFavoresPorUsuario(currentUser.uid);
        setUserFavors(favores);

        // Cargar también los favores con información de contacto
        const favoresContactos = await obtenerFavoresConContactos(currentUser.uid);
        setFavoresConContactos(favoresContactos);
      } catch (error) {
        console.error('Error al cargar favores del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarFavores();
  }, [currentUser]);

  // Cargar calificaciones del usuario
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!currentUser) return;

      try {
        setLoadingCalificaciones(true);
        const cals = await obtenerCalificacionesUsuario(currentUser.uid);
        setCalificaciones(cals);
      } catch (error) {
        console.error('Error al cargar calificaciones:', error);
      } finally {
        setLoadingCalificaciones(false);
      }
    };

    cargarCalificaciones();
  }, [currentUser]);

  // TEMPORALMENTE DESHABILITADO: UCloseMeal - Cargar pedidos del usuario
  // useEffect(() => {
  //   const cargarPedidos = async () => {
  //     if (!currentUser) return;

  //     try {
  //       setLoadingPedidos(true);
  //       const misPedidos = await obtenerMisPedidos(currentUser.uid);
  //       setPedidos(misPedidos);
  //     } catch (error) {
  //       console.error('Error al cargar pedidos:', error);
  //     } finally {
  //       setLoadingPedidos(false);
  //     }
  //   };

  //   cargarPedidos();
  // }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  // Calcular estadísticas
  const activeFavors = userFavors.filter(f => f.estado === 'activo');
  const completedFavors = userFavors.filter(f => f.estado === 'completado');

  // TEMPORALMENTE DESHABILITADO: UCloseMeal - Estadísticas de pedidos
  // const pedidosActivos = pedidos.filter(p => ['pendiente', 'aceptado', 'en-camino', 'entregado'].includes(p.estado));

  // Función para guardar el teléfono
  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    // Validar formato de teléfono chileno (+569 + 8 dígitos)
    const telefonoRegex = /^\+569\d{8}$/;
    if (!telefonoRegex.test(phoneNumber)) {
      alert('El número de WhatsApp debe tener el formato +569 seguido de 8 dígitos (Ej: +56912345678)');
      return;
    }

    try {
      await updateUserData(currentUser.uid, { telefono: phoneNumber });
      alert('Número de WhatsApp guardado exitosamente');
      setShowPhoneModal(false);
      window.location.reload(); // Recargar para actualizar los datos
    } catch (error) {
      console.error('Error al guardar teléfono:', error);
      alert('Error al guardar el número. Intenta nuevamente.');
    }
  };

  // Función para manejar la subida de foto de perfil
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen no puede superar los 3MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const photoURL = await uploadProfilePicture(currentUser.uid, file);
      alert('Foto de perfil actualizada exitosamente');
      // Recargar para actualizar el AuthContext con la nueva foto
      window.location.reload();
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert(error.message || 'Error al subir la foto. Intenta nuevamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await deleteUserProfile(currentUser.uid);
      alert('Tu cuenta ha sido eliminada exitosamente');
      // Redirigir al home
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);

      // Si el error es por necesidad de reautenticación
      if (error.code === 'auth/requires-recent-login') {
        alert('Por seguridad, necesitas volver a iniciar sesión antes de eliminar tu cuenta. Por favor, cierra sesión e inicia sesión nuevamente, luego intenta eliminar tu cuenta.');
      } else {
        alert(error.message || 'Error al eliminar la cuenta. Intenta nuevamente.');
      }
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Minimalista */}
        <div className="mb-12">
          <div className="flex items-start gap-6 mb-6">
            {/* Foto de perfil */}
            <div className="relative group flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-card border-2 border-border">
                {currentUser.fotoPerfil ? (
                  <img
                    src={currentUser.fotoPerfil}
                    alt={currentUser.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-brand/5">
                    <User className="h-12 w-12 sm:h-14 sm:w-14 text-brand/40" />
                  </div>
                )}
              </div>

              {/* Botón para cambiar foto */}
              <label
                htmlFor="profile-photo-upload"
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${uploadingPhoto ? 'opacity-100' : ''}`}
              >
                {uploadingPhoto ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </div>

            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <span>{currentUser.nombre}</span>
                {currentUser.rol && <VerifiedBadge userRole={currentUser.rol} size="lg" />}
              </h1>
              <p className="text-text-muted">{currentUser.correo}</p>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar perfil
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar cuenta
                </button>
              </div>
            </div>

            {/* Rating en el header */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-text-primary">
                  {currentUser.reputacion?.toFixed(1) || '5.0'}
                </span>
              </div>
              {currentUser.totalCalificaciones > 0 && (
                <span className="text-xs text-text-muted">
                  {currentUser.totalCalificaciones} {currentUser.totalCalificaciones === 1 ? 'calificación' : 'calificaciones'}
                </span>
              )}
            </div>
          </div>

          {/* Info badges - Limpia y horizontal */}
          <div className="flex flex-wrap gap-2">
            {currentUser.carrera && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-card border border-border text-sm text-text-muted">
                {currentUser.carrera}
              </span>
            )}
            {currentUser.año && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-card border border-border text-sm text-text-muted">
                {currentUser.año}° año
              </span>
            )}
            {currentUser.intereses && currentUser.intereses.length > 0 && (
              currentUser.intereses.slice(0, 3).map((interes, index) => (
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

        {/* Alerta de WhatsApp - Más sutil */}
        {!currentUser.telefono && (
          <div className="mb-8 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-text-primary mb-2 font-medium">
                  Agrega tu número de WhatsApp para conectar con otros usuarios
                </p>
                <button
                  onClick={() => setShowPhoneModal(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Agregar número →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Minimalista y elegante */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-brand/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Publicados</p>
              <p className="text-3xl font-bold text-text-primary">
                {loading ? '—' : userFavors.length}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-emerald-500/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Completados</p>
              <p className="text-3xl font-bold text-emerald-500">
                {loading ? '—' : completedFavors.length}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-blue-500/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Ayudados</p>
              <p className="text-3xl font-bold text-blue-500">
                {currentUser.favoresCompletados?.length || 0}
              </p>
            </div>
          </div>

          {/* TEMPORALMENTE DESHABILITADO: UCloseMeal - Tarjeta de pedidos */}
          {/* <div
            onClick={() => navigate('/uclosemeal/mis-pedidos')}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-orange-500/50 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <p className="text-sm text-text-muted mb-1">Pedidos</p>
              <p className="text-3xl font-bold text-orange-500">
                {loadingPedidos ? '—' : pedidosActivos.length}
              </p>
            </div>
          </div> */}
        </div>

        {/* Sistema de Referidos */}
        <div className="mb-12">
          <ReferralStats />
        </div>

        {/* Panel de Administración - Solicitudes de Profesores */}
        {esAdmin(currentUser) && (
          <SolicitudesProfesores />
        )}

        {/* Secciones en grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mis Favores */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Mis Favores</h2>
              <button
                onClick={() => navigate('/publicar')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent" />
              </div>
            ) : activeFavors.length > 0 ? (
              <div className="space-y-3">
                {activeFavors.slice(0, 3).map(favor => (
                  <div
                    key={favor.id}
                    onClick={() => navigate(`/favor/${favor.id}`)}
                    className="p-4 rounded-lg border border-border hover:border-brand/50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium text-text-primary mb-1 line-clamp-1">
                      {favor.titulo}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-1 mb-2">
                      {favor.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{favor.fecha}</span>
                      <div className="flex items-center gap-2">
                        {favor.ayudantes && favor.ayudantes.length > 0 && (
                          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
                            {favor.ayudantes.length} {favor.ayudantes.length === 1 ? 'oferta' : 'ofertas'}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${favor.estado === 'pendiente' || favor.estado === 'activo'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : favor.estado === 'en_proceso'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-gray-500/10 text-gray-600'
                          }`}>
                          {favor.estado === 'pendiente' || favor.estado === 'activo' ? 'Pendiente' : favor.estado === 'en_proceso' ? 'En proceso' : 'Completado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {activeFavors.length > 3 && (
                  <button
                    onClick={() => navigate('/favores')}
                    className="w-full py-2 text-sm text-brand hover:text-brand-hover transition-colors"
                  >
                    Ver todos ({activeFavors.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-muted mb-4">No tienes favores activos</p>
                <button
                  onClick={() => navigate('/publicar')}
                  className="text-sm text-brand hover:underline"
                >
                  Publicar tu primer favor
                </button>
              </div>
            )}
          </div>

          {/* TEMPORALMENTE DESHABILITADO: UCloseMeal - Sección de pedidos */}
          {/* {!loadingPedidos && pedidos.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">UCloseMeal</h2>
                <button
                  onClick={() => navigate('/uclosemeal/mis-pedidos')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  Ver todos
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {pedidosActivos.length > 0 ? (
                <div className="space-y-3">
                  {pedidosActivos.slice(0, 3).map(pedido => (
                    <div
                      key={pedido.id}
                      onClick={() => navigate('/uclosemeal/mis-pedidos')}
                      className="p-4 rounded-lg border border-border hover:border-orange-500/50 transition-colors cursor-pointer"
                    >
                      <h3 className="font-medium text-text-primary mb-1">
                        {pedido.restaurante}
                      </h3>
                      <p className="text-sm text-text-muted mb-2">
                        ${pedido.total?.toLocaleString() || pedido.precio?.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">📍 {pedido.puntoEntrega}</span>
                        <span className="text-xs text-orange-600">
                          {pedido.estado === 'pendiente' && '⏳ Pendiente'}
                          {pedido.estado === 'aceptado' && '✅ Aceptado'}
                          {pedido.estado === 'en-camino' && '🚗 En camino'}
                          {pedido.estado === 'entregado' && '📦 Entregado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-muted mb-4">No tienes pedidos activos</p>
                  <button
                    onClick={() => navigate('/uclosemeal')}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Hacer un pedido
                  </button>
                </div>
              )}
            </div>
          )} */}

          {/* Calificaciones */}
          {!loadingCalificaciones && calificaciones.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Calificaciones</h2>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-3">
                {calificaciones.slice(0, 3).map((cal) => (
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

          {/* Contactos WhatsApp */}
          {!loading && favoresConContactos.respondidos.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Mis Contactos</h2>
              <p className="text-sm text-text-muted mb-4">
                Favores donde ofreciste ayuda
              </p>

              <div className="space-y-3">
                {favoresConContactos.respondidos.slice(0, 3).map((favor) => (
                  <div key={favor.id} className="p-4 rounded-lg border border-border">
                    <h3 className="font-medium text-text-primary mb-2 text-sm">
                      {favor.titulo}
                    </h3>

                    {favor.miContacto && favor.miContacto.solicitanteTelefono && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-text-muted mb-2">
                          {favor.miContacto.solicitanteNombre}
                        </p>
                        <a
                          href={`https://wa.me/${favor.miContacto.solicitanteTelefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${favor.miContacto.solicitanteNombre}! Me ofrecí a ayudarte con: "${favor.titulo}" a través de NexU+. ¿Sigues necesitando ayuda?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          WhatsApp
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Favores completados - Lista simple al final */}
        {completedFavors.length > 0 && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Completados ({completedFavors.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedFavors.map(favor => (
                <div
                  key={favor.id}
                  onClick={() => navigate(`/favor/${favor.id}`)}
                  className="p-3 rounded-lg border border-border bg-card/50 hover:border-brand/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-text-primary line-clamp-1 mb-1">
                    {favor.titulo}
                  </p>
                  <p className="text-xs text-text-muted">{favor.fecha}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar WhatsApp - Minimalista */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPhoneModal(false)}
        >
          <div
            className="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Agregar WhatsApp
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Solo será visible para personas con las que te conectes
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d+]/g, '');
                if (cleaned.length <= 12) {
                  setPhoneNumber(cleaned);
                }
              }}
              placeholder="+56912345678"
              maxLength={12}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand mb-2"
            />
            <p className="text-xs text-text-muted mb-6">
              Formato: +569 seguido de 8 dígitos
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-muted border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePhone}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar perfil */}
      <EditarPerfilModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onActualizacionExitosa={() => {
          // Recargar la página después de actualizar
          window.location.reload();
        }}
      />

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  ¿Eliminar cuenta?
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Esta acción no se puede deshacer. Se eliminarán todos tus datos de forma permanente:
                </p>
                <ul className="text-sm text-text-muted space-y-1 mb-4 list-disc list-inside">
                  <li>Tu perfil y toda tu información personal</li>
                  <li>Tus favores publicados</li>
                  <li>Tu historial de calificaciones</li>
                  <li>Tu cuenta de acceso</li>
                </ul>
                <p className="text-sm font-semibold text-red-600">
                  Para confirmar, por favor escribe "ELIMINAR" en el campo de abajo.
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Escribe ELIMINAR para confirmar"
              id="delete-confirmation-input"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-muted border border-border rounded-lg hover:bg-card/80 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('delete-confirmation-input');
                  if (input.value === 'ELIMINAR') {
                    handleDeleteAccount();
                  } else {
                    alert('Por favor escribe "ELIMINAR" para confirmar');
                  }
                }}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingAccount ? 'Eliminando...' : 'Eliminar permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
