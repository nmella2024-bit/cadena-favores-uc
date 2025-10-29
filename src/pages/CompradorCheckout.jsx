/*
 * TEMPORALMENTE DESHABILITADO: UCloseMeal
 * Este componente está deshabilitado pero se mantiene para una posible implementación futura.
 * Para reactivar: descomentar rutas en App.jsx y entrada en Navbar.jsx
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, CheckCircle, Loader } from 'lucide-react';
import { PUNTOS_ENTREGA } from '../data/restaurants';
import { formatearPrecio } from '../services/marketplaceService';
import { crearPedidoConCarrito } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import SelectField from '../components/ui/SelectField';
import TextareaField from '../components/ui/TextareaField';
import PrimaryButton from '../components/ui/PrimaryButton';

const CompradorCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { cart, restaurant, subtotal, total } = location.state || {};

  const [puntoEntrega, setPuntoEntrega] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!cart || !restaurant) {
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

  const handleConfirmOrder = async () => {
    setError('');

    // Validaciones
    if (!puntoEntrega) {
      setError('Debes seleccionar un punto de entrega');
      return;
    }

    if (!metodoPago) {
      setError('Debes seleccionar un método de pago');
      return;
    }

    try {
      setIsProcessing(true);

      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Crear pedido en Firestore
      const orderData = {
        restaurante: restaurant.nombre,
        restauranteId: restaurant.id,
        items: cart.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.quantity,
        })),
        subtotal,
        deliveryFee: total - subtotal,
        total,
        puntoEntrega,
        instrucciones,
        metodoPago,
      };

      await crearPedidoConCarrito(orderData, usuario);

      // Navegar a página de confirmación
      navigate('/uclosemeal/comprador/confirmacion', {
        state: { orderData, restaurant },
      });
    } catch (err) {
      console.error('Error al crear pedido:', err);
      setError(err.message || 'Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al menú</span>
        </button>

        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Confirmar Pedido
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Point */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-text-primary">
                  Punto de Entrega
                </h2>
              </div>

              <SelectField
                id="puntoEntrega"
                name="puntoEntrega"
                label="Selecciona dónde recibirás tu pedido *"
                value={puntoEntrega}
                onChange={(e) => setPuntoEntrega(e.target.value)}
                required
              >
                <option value="">Selecciona un punto de entrega</option>
                {PUNTOS_ENTREGA.map((punto) => (
                  <option key={punto.id} value={punto.nombre}>
                    {punto.nombre}
                  </option>
                ))}
              </SelectField>

              <TextareaField
                id="instrucciones"
                name="instrucciones"
                label="Instrucciones adicionales (opcional)"
                placeholder="Ej: Sin cebolla, llamar al llegar, etc."
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-text-primary">
                  Método de Pago
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-brand transition-colors">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="efectivo"
                    checked={metodoPago === 'efectivo'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="text-brand focus:ring-brand"
                  />
                  <div>
                    <p className="font-medium text-text-primary">Efectivo</p>
                    <p className="text-sm text-text-muted">
                      Paga en efectivo al repartidor
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-brand transition-colors">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="transferencia"
                    checked={metodoPago === 'transferencia'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="text-brand focus:ring-brand"
                  />
                  <div>
                    <p className="font-medium text-text-primary">Transferencia</p>
                    <p className="text-sm text-text-muted">
                      Transferir al repartidor (coordinación vía chat)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">
                Resumen del Pedido
              </h2>

              <div className="mb-4 pb-4 border-b border-border">
                <p className="font-semibold text-text-primary mb-2">
                  {restaurant.nombre}
                </p>
                <div className="space-y-1 text-sm">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-text-muted">
                        {item.nombre} × {item.quantity}
                      </span>
                      <span className="text-text-primary">
                        {formatearPrecio(item.precio * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-semibold text-text-primary">
                    {formatearPrecio(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Cargo por delivery</span>
                  <span className="font-semibold text-text-primary">
                    {formatearPrecio(total - subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-text-primary">Total</span>
                  <span className="text-brand">{formatearPrecio(total)}</span>
                </div>
              </div>

              <PrimaryButton
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </PrimaryButton>

              <p className="text-xs text-text-muted text-center mt-4">
                Al confirmar, tu pedido será visible para repartidores disponibles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompradorCheckout;
