import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Plus, Inbox, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerProductos, eliminarProducto } from '../services/marketplaceService';
import MarketplaceCard from '../components/MarketplaceCard';
import CrearProductoModal from '../components/CrearProductoModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-border bg-card/70 p-6 shadow-sm dark:bg-card/60">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 w-2/3 rounded bg-border/80 dark:bg-border/40" />
      <div className="h-6 w-24 rounded bg-border/80 dark:bg-border/40" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 w-full rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-5/6 rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-4/6 rounded bg-border/80 dark:bg-border/40" />
    </div>
    <div className="h-48 w-full rounded bg-border/80 dark:bg-border/40 mb-4" />
    <div className="h-4 w-32 rounded bg-border/80 dark:bg-border/40" />
  </div>
);

const Marketplace = () => {
  const { currentUser } = useAuth();
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  const cargarProductos = async () => {
    try {
      setIsLoading(true);
      setError('');
      const productosData = await obtenerProductos();
      setProductos(productosData);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos. Intenta recargar la página.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Efecto para simular carga cuando cambia el filtro
  useEffect(() => {
    if (productos.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filtrar productos por búsqueda
  const filteredProductos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productos.filter((producto) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        producto.titulo.toLowerCase().includes(normalizedQuery) ||
        producto.descripcion.toLowerCase().includes(normalizedQuery);

      return matchesSearch;
    });
  }, [productos, searchQuery]);

  const handleEliminarProducto = async (productoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      setEliminando(productoId);
      await eliminarProducto(productoId);
      setProductos(productos.filter(p => p.id !== productoId));
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto. Intenta nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  const handleProductoCreado = () => {
    cargarProductos();
  };

  return (
    <div className="bg-[rgb(var(--bg-canvas))] min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="h-8 w-8 text-brand" />
                <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  Marketplace
                </h1>
              </div>
              <p className="text-text-muted">
                Compra y vende productos dentro de la comunidad UC
              </p>
            </div>

            {currentUser && (
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Publicar producto
              </PrimaryButton>
            )}
          </div>

          {/* Buscador */}
          <div className="max-w-md">
            <TextField
              id="search-marketplace"
              label="Buscar productos"
              placeholder="Buscar por título o descripción..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              icon={Search}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProductos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:bg-card/30">
            <Inbox className="mb-4 h-16 w-16 text-text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No hay productos publicados
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {currentUser
                ? 'Sé el primero en publicar un producto en el marketplace.'
                : 'Aún no hay productos disponibles. Vuelve más tarde.'}
            </p>
            {currentUser && (
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Publicar primer producto
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Productos List */}
        {!isLoading && filteredProductos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProductos.map((producto) => (
              <MarketplaceCard
                key={producto.id}
                producto={producto}
                esAutor={currentUser?.uid === producto.autor}
                currentUserId={currentUser?.uid}
                onEliminar={handleEliminarProducto}
              />
            ))}
          </div>
        )}

        {/* Modal para crear producto */}
        {currentUser && (
          <CrearProductoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            usuario={currentUser}
            onProductoCreado={handleProductoCreado}
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;
