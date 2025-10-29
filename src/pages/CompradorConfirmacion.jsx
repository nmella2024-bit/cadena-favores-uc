/*
 * TEMPORALMENTE DESHABILITADO: UCloseMeal
 * Este componente está deshabilitado pero se mantiene para una posible implementación futura.
 * Para reactivar: descomentar rutas en App.jsx y entrada en Navbar.jsx
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { formatearPrecio } from '../services/marketplaceService';
import PrimaryButton from '../components/ui/PrimaryButton';

const CompradorConfirmacion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData, restaurant } = location.state || {};

  if (!orderData || !restaurant) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-text-muted">No hay información de pedido</p>
          <button
            onClick={() => navigate('/uclosemeal/comprador')}
            className="mt-4 text-brand hover:underline"
          >
            Volver a restaurantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-text-muted">
            Tu pedido ha sido creado exitosamente
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            Detalles del Pedido
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted mb-1">Restaurante</p>
              <p className="font-semibold text-text-primary">{restaurant.nombre}</p>
            </div>

            <div>
              <p className="text-sm text-text-muted mb-2">Productos</p>
              <div className="space-y-1">
                {orderData.items.map((item, index) => (
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

            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-primary">{formatearPrecio(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Cargo por delivery</span>
                <span className="text-text-primary">{formatearPrecio(orderData.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-brand">{formatearPrecio(orderData.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />
            Información de Entrega
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-muted mb-1">Punto de Entrega</p>
              <p className="font-semibold text-text-primary">{orderData.puntoEntrega}</p>
            </div>

            {orderData.instrucciones && (
              <div>
                <p className="text-sm text-text-muted mb-1">Instrucciones</p>
                <p className="text-text-primary">{orderData.instrucciones}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-text-muted mb-1">Método de Pago</p>
              <p className="font-semibold text-text-primary capitalize">
                {orderData.metodoPago}
              </p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-brand mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                ¿Qué sigue ahora?
              </h3>
              <p className="text-sm text-text-muted">
                Tu pedido está pendiente de aceptación. Un repartidor lo aceptará pronto y podrás
                seguir el estado en tiempo real desde tu perfil.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <PrimaryButton
            onClick={() => navigate('/uclosemeal/mis-pedidos')}
            className="w-full"
          >
            Ver mis pedidos
          </PrimaryButton>

          <button
            onClick={() => navigate('/uclosemeal/comprador')}
            className="w-full py-2.5 px-4 bg-card border border-border text-text-primary rounded-lg hover:bg-background transition-colors font-medium"
          >
            Hacer otro pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompradorConfirmacion;
