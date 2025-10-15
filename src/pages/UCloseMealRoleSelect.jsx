import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bike, ArrowRight } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';

const UCloseMealRoleSelect = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'comprador') {
      navigate('/uclosemeal/comprador');
    } else {
      navigate('/uclosemeal/repartidor');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Bienvenido a UCloseMeal
          </h1>
          <p className="text-lg text-text-muted">
            Elige tu rol para comenzar
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Comprador Card */}
          <div
            className="bg-card border-2 border-border rounded-2xl p-8 hover:border-brand transition-all cursor-pointer group"
            onClick={() => handleRoleSelect('comprador')}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-brand/10 p-6 rounded-full group-hover:bg-brand/20 transition-colors">
                <ShoppingBag className="h-16 w-16 text-brand" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Comprador
                </h2>
                <p className="text-text-muted">
                  Explora restaurantes del campus, elige tus productos favoritos y recibe tu pedido en el punto de entrega que prefieras.
                </p>
              </div>

              <div className="space-y-2 text-sm text-text-muted text-left w-full">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Ver menús de restaurantes</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Agregar productos al carrito</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Confirmar y pagar tu pedido</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Seguir el estado de tu entrega</span>
                </div>
              </div>

              <PrimaryButton className="w-full">
                Continuar como Comprador
              </PrimaryButton>
            </div>
          </div>

          {/* Repartidor Card */}
          <div
            className="bg-card border-2 border-border rounded-2xl p-8 hover:border-emerald-500 transition-all cursor-pointer group"
            onClick={() => handleRoleSelect('repartidor')}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-emerald-500/10 p-6 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                <Bike className="h-16 w-16 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Repartidor
                </h2>
                <p className="text-text-muted">
                  Acepta pedidos disponibles, retira la comida del restaurante y entrégala en el campus ganando por cada entrega.
                </p>
              </div>

              <div className="space-y-2 text-sm text-text-muted text-left w-full">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Ver pedidos disponibles</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Aceptar pedidos para repartir</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Actualizar estado en tiempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Ver historial de entregas</span>
                </div>
              </div>

              <button className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                Continuar como Repartidor
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-text-muted">
            <strong className="text-text-primary">UCloseMeal</strong> es el sistema de entrega de comida del campus UC.
            Conecta a estudiantes que quieren comida con estudiantes dispuestos a hacer entregas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UCloseMealRoleSelect;
