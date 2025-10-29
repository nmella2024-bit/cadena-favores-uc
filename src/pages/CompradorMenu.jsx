/*
 * TEMPORALMENTE DESHABILITADO: UCloseMeal
 * Este componente está deshabilitado pero se mantiene para una posible implementación futura.
 * Para reactivar: descomentar rutas en App.jsx y entrada en Navbar.jsx
 */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { getRestaurantById, DELIVERY_FEE } from '../data/restaurants';
import { formatearPrecio } from '../services/marketplaceService';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useAuth } from '../context/AuthContext';

const CompradorMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-text-muted">Restaurante no encontrado</p>
        </div>
      </div>
    );
  }

  // Agrupar menú por categoría
  const menuByCategory = useMemo(() => {
    const grouped = {};
    restaurant.menu.forEach((item) => {
      if (!grouped[item.categoria]) {
        grouped[item.categoria] = [];
      }
      grouped[item.categoria].push(item);
    });
    return grouped;
  }, [restaurant]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((p) =>
          p.id === itemId ? { ...p, quantity: p.quantity - 1 } : p
        );
      }
      return prev.filter((p) => p.id !== itemId);
    });
  };

  const deleteFromCart = (itemId) => {
    setCart((prev) => prev.filter((p) => p.id !== itemId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  const handleCheckout = () => {
    if (!usuario) {
      alert('Debes iniciar sesión para realizar un pedido');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Navegar al checkout con el carrito
    navigate('/uclosemeal/comprador/checkout', {
      state: { cart, restaurant, subtotal, total },
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/uclosemeal/comprador')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a restaurantes</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {restaurant.nombre}
          </h1>
          <p className="text-text-muted">{restaurant.descripcion}</p>
          <p className="text-sm text-text-muted mt-1">{restaurant.horario}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(menuByCategory).map(([categoria, items]) => (
              <div key={categoria}>
                <h2 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border">
                  {categoria}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const cartItem = cart.find((p) => p.id === item.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {item.nombre}
                          </h3>
                          <p className="text-lg font-bold text-brand">
                            {formatearPrecio(item.precio)}
                          </p>
                        </div>

                        {quantity === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-brand text-white p-2 rounded-lg hover:bg-brand/90 transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-card border border-border text-text-primary p-2 rounded-lg hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-colors"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="font-bold text-text-primary min-w-[24px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-brand text-white p-2 rounded-lg hover:bg-brand/90 transition-colors"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-bold text-text-primary">Tu Pedido</h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted text-sm">
                    Tu carrito está vacío
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {item.nombre}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatearPrecio(item.precio)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary whitespace-nowrap">
                            {formatearPrecio(item.precio * item.quantity)}
                          </span>
                          <button
                            onClick={() => deleteFromCart(item.id)}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="font-semibold text-text-primary">
                        {formatearPrecio(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Cargo por delivery</span>
                      <span className="font-semibold text-text-primary">
                        {formatearPrecio(DELIVERY_FEE)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span className="text-text-primary">Total</span>
                      <span className="text-brand">{formatearPrecio(total)}</span>
                    </div>
                  </div>

                  <PrimaryButton onClick={handleCheckout} className="w-full">
                    Proceder al pago
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompradorMenu;
