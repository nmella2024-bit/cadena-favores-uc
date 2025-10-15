import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, DollarSign, CheckCircle, Bike, AlertCircle, MessageCircle } from 'lucide-react';
import { escucharPedidosPendientes, escucharMisPedidosActivos, aceptarPedido, marcarEnCamino, marcarEntregado, marcarComoCompletado } from '../services/orderService';
import { formatearPrecio } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';

const RepartidorDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('disponibles');
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    setLoading(true);

    // Suscribirse a pedidos pendientes en tiempo real
    const unsubscribeDisponibles = escucharPedidosPendientes((pedidos) => {
      console.log('Pedidos disponibles actualizados:', pedidos);
      setPedidosDisponibles(pedidos);
      setLoading(false);
    });

    // Suscribirse a pedidos activos del repartidor en tiempo real
    const unsubscribeActivos = escucharMisPedidosActivos(usuario.uid, (pedidos) => {
      console.log('Pedidos activos actualizados:', pedidos);
      setPedidosActivos(pedidos);
    });

    // Cleanup: cancelar suscripciones cuando el componente se desmonte
    return () => {
      unsubscribeDisponibles();
      unsubscribeActivos();
    };
  }, [usuario, navigate]);

  const handleAceptarPedido = async (pedidoId) => {
    try {
      setProcessingId(pedidoId);
      await aceptarPedido(pedidoId, usuario);
      setActiveTab('activos');
    } catch (error) {
      console.error('Error aceptando pedido:', error);
      alert(error.message || 'Error al aceptar el pedido');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarcarEnCamino = async (pedidoId) => {
    try {
      setProcessingId(pedidoId);
      await marcarEnCamino(pedidoId, usuario.uid);
    } catch (error) {
      console.error('Error marcando en camino:', error);
      alert(error.message || 'Error al actualizar el pedido');
    } finally {
      setProcessingId(null);
    }
  };

  const abrirWhatsApp = (telefono, pedidoId, restaurante) => {
    if (!telefono) {
      alert('Este comprador no tiene WhatsApp registrado');
      return;
    }

    // Limpiar el número (remover caracteres no numéricos)
    const numeroLimpio = telefono.replace(/\D/g, '');

    // Mensaje predefinido
    const mensaje = `Hola! Soy tu repartidor de UCloseMeal. He aceptado tu pedido de ${restaurante} (ID: ${pedidoId.slice(0, 8)}). ¿En qué punto de entrega nos vemos?`;

    // Abrir WhatsApp con el mensaje
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleMarcarEntregado = async (pedidoId) => {
    try {
      setProcessingId(pedidoId);
      await marcarEntregado(pedidoId);
    } catch (error) {
      console.error('Error marcando entregado:', error);
      alert(error.message || 'Error al actualizar el pedido');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarcarCompletado = async (pedidoId) => {
    try {
      setProcessingId(pedidoId);
      await marcarComoCompletado(pedidoId, usuario.uid);
    } catch (error) {
      console.error('Error marcando como completado:', error);
      alert(error.message || 'Error al marcar el pedido como completado');
    } finally {
      setProcessingId(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', label: 'Pendiente' },
      aceptado: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', label: 'Aceptado' },
      'en-camino': { color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', label: 'En Camino' },
      entregado: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', label: 'Entregado' },
      completado: { color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', label: 'Completado' },
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const renderPedidoCard = (pedido, isDisponible = false) => {
    const isProcessing = processingId === pedido.id;

    return (
      <div key={pedido.id} className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              {pedido.restaurante}
            </h3>
            <p className="text-sm text-text-muted">Pedido #{pedido.id.slice(0, 8)}</p>
          </div>
          {getEstadoBadge(pedido.estado)}
        </div>

        {/* Items */}
        <div className="bg-background/50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-text-muted mb-2">Productos:</p>
          <div className="space-y-1">
            {pedido.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-text-primary">
                  {item.nombre} × {item.cantidad}
                </span>
                <span className="font-semibold text-text-primary">
                  {formatearPrecio(item.precio * item.cantidad)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-text-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Punto de Entrega</p>
              <p className="text-sm font-medium text-text-primary">{pedido.puntoEntrega}</p>
            </div>
          </div>

          {pedido.instrucciones && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Instrucciones</p>
                <p className="text-sm text-text-primary">{pedido.instrucciones}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-text-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Total a Cobrar</p>
              <p className="text-lg font-bold text-brand">{formatearPrecio(pedido.total)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-text-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Solicitado hace</p>
              <p className="text-sm text-text-primary">
                {pedido.fecha ? Math.floor((Date.now() - pedido.fecha) / 60000) : 0} minutos
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isDisponible && (
          <PrimaryButton
            onClick={() => handleAceptarPedido(pedido.id)}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Aceptando...' : 'Aceptar Pedido'}
          </PrimaryButton>
        )}

        {!isDisponible && pedido.estado === 'aceptado' && (
          <div className="space-y-2">
            {/* Botón de WhatsApp */}
            {pedido.solicitanteWhatsapp && (
              <button
                onClick={() => abrirWhatsApp(pedido.solicitanteWhatsapp, pedido.id, pedido.restaurante)}
                className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contactar Comprador
              </button>
            )}
            <button
              onClick={() => handleMarcarEnCamino(pedido.id)}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {isProcessing ? 'Actualizando...' : 'Marcar En Camino'}
            </button>
          </div>
        )}

        {!isDisponible && pedido.estado === 'en-camino' && (
          <button
            onClick={() => handleMarcarEntregado(pedido.id)}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Actualizando...' : 'Marcar como Entregado'}
          </button>
        )}

        {!isDisponible && pedido.estado === 'entregado' && (
          <>
            {pedido.codigoQR && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-emerald-600 font-semibold">Código de confirmación</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Código: {pedido.codigoQR}</p>
              </div>
            )}
            <button
              onClick={() => handleMarcarCompletado(pedido.id)}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Marcando...' : 'Marcar como Completado'}
            </button>
          </>
        )}

        {!isDisponible && pedido.estado === 'completado' && (
          <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
            <CheckCircle className="h-5 w-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-semibold">Pedido Finalizado</p>
            {pedido.codigoQR && (
              <p className="text-xs text-text-muted mt-1 font-mono">Código: {pedido.codigoQR}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Bike className="h-8 w-8 text-emerald-600" />
            Dashboard Repartidor
          </h1>
          <p className="text-text-muted">
            Acepta pedidos y gana por cada entrega
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('disponibles')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'disponibles'
                ? 'text-brand'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Pedidos Disponibles
            {pedidosDisponibles.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand rounded-full">
                {pedidosDisponibles.length}
              </span>
            )}
            {activeTab === 'disponibles' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activos')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'activos'
                ? 'text-brand'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Mis Pedidos Activos
            {pedidosActivos.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                {pedidosActivos.length}
              </span>
            )}
            {activeTab === 'activos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto" />
            <p className="text-text-muted mt-4">Cargando pedidos...</p>
          </div>
        ) : (
          <>
            {activeTab === 'disponibles' && (
              <div>
                {pedidosDisponibles.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Package className="h-12 w-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-muted">No hay pedidos disponibles en este momento</p>
                    <p className="text-sm text-text-muted mt-2">
                      Los nuevos pedidos aparecerán aquí automáticamente
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pedidosDisponibles.map((pedido) => renderPedidoCard(pedido, true))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activos' && (
              <div>
                {pedidosActivos.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Bike className="h-12 w-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-muted">No tienes pedidos activos</p>
                    <p className="text-sm text-text-muted mt-2">
                      Acepta pedidos disponibles para comenzar a repartir
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pedidosActivos.map((pedido) => renderPedidoCard(pedido, false))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RepartidorDashboard;
