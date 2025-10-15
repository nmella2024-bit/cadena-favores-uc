import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, DollarSign, CheckCircle, ArrowLeft } from 'lucide-react';
import { escucharMisPedidosCreados } from '../services/orderService';
import { formatearPrecio } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';

const MisPedidosUCloseMeal = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    setLoading(true);

    // Suscribirse a mis pedidos creados en tiempo real
    const unsubscribe = escucharMisPedidosCreados(usuario.uid, (pedidosActualizados) => {
      console.log('Mis pedidos actualizados:', pedidosActualizados);
      setPedidos(pedidosActualizados);
      setLoading(false);
    });

    // Cleanup: cancelar suscripción
    return () => unsubscribe();
  }, [usuario, navigate]);

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', label: 'Pendiente', desc: 'Esperando repartidor' },
      aceptado: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', label: 'Aceptado', desc: 'Repartidor asignado' },
      'en-camino': { color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', label: 'En Camino', desc: 'Tu pedido va en camino' },
      entregado: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', label: 'Entregado', desc: 'Pedido completado' },
      cancelado: { color: 'bg-red-500/10 text-red-600 border-red-500/30', label: 'Cancelado', desc: 'Pedido cancelado' },
    };
    return badges[estado] || badges.pendiente;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al perfil</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Package className="h-8 w-8 text-brand" />
            Mis Pedidos UCloseMeal
          </h1>
          <p className="text-text-muted">
            Todos los pedidos que has creado
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto" />
            <p className="text-text-muted mt-4">Cargando tus pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Package className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted mb-2">No has creado ningún pedido aún</p>
            <button
              onClick={() => navigate('/uclosemeal/comprador')}
              className="text-brand hover:underline mt-2"
            >
              Hacer mi primer pedido
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.map((pedido) => {
              const estadoBadge = getEstadoBadge(pedido.estado);

              return (
                <div key={pedido.id} className="bg-card border border-border rounded-xl p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary mb-1">
                        {pedido.restaurante}
                      </h3>
                      <p className="text-sm text-text-muted">
                        Pedido #{pedido.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${estadoBadge.color}`}>
                      {estadoBadge.label}
                    </span>
                  </div>

                  {/* Estado Description */}
                  <div className="mb-4 p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-text-muted">{estadoBadge.desc}</p>
                    {pedido.repartidorNombre && pedido.estado !== 'pendiente' && (
                      <p className="text-xs text-text-primary mt-1">
                        <strong>Repartidor:</strong> {pedido.repartidorNombre}
                      </p>
                    )}
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Subtotal:</span>
                      <span className="text-text-primary">{formatearPrecio(pedido.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Delivery:</span>
                      <span className="text-text-primary">{formatearPrecio(pedido.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-border">
                      <span className="text-text-primary">Total:</span>
                      <span className="text-brand">{formatearPrecio(pedido.total)}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-text-muted mt-0.5 flex-shrink-0" />
                      <span className="text-text-muted">{pedido.puntoEntrega}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-3 w-3 text-text-muted mt-0.5 flex-shrink-0" />
                      <span className="text-text-muted">
                        {pedido.fecha ? Math.floor((Date.now() - pedido.fecha) / 60000) : 0} minutos atrás
                      </span>
                    </div>
                  </div>

                  {/* QR Code if delivered */}
                  {pedido.estado === 'entregado' && pedido.codigoQR && (
                    <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs text-emerald-600 font-semibold">Código de confirmación</p>
                      <p className="text-xs text-text-muted mt-1 font-mono">{pedido.codigoQR}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidosUCloseMeal;
