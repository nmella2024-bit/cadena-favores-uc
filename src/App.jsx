import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))]">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      <p className="mt-4 text-sm text-text-muted">Cargando...</p>
    </div>
  </div>
);

// Pages - Lazy loaded para code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Favores = lazy(() => import('./pages/Favores'));
const ClasesParticulares = lazy(() => import('./pages/ClasesParticulares'));
const PublicarFavor = lazy(() => import('./pages/PublicarFavor'));
const Perfil = lazy(() => import('./pages/Perfil'));
const PerfilPublico = lazy(() => import('./pages/PerfilPublico'));
const FavorDetalle = lazy(() => import('./pages/FavorDetalle'));
const Anuncios = lazy(() => import('./pages/Anuncios'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Material = lazy(() => import('./pages/Material'));
const EmailVerificationPending = lazy(() => import('./pages/EmailVerificationPending'));
const AdminSeedFolders = lazy(() => import('./components/AdminSeedFolders'));
const MigrarMaterialesExistentes = lazy(() => import('./components/MigrarMaterialesExistentes'));
const DiagnosticoMaterial = lazy(() => import('./components/DiagnosticoMaterial'));
const MisReferidos = lazy(() => import('./pages/MisReferidos'));
const RankingReferidos = lazy(() => import('./pages/RankingReferidos'));

// UCloseMeal Pages - TEMPORALMENTE DESHABILITADO
// import UCloseMealRoleSelect from './pages/UCloseMealRoleSelect';
// import CompradorRestaurantes from './pages/CompradorRestaurantes';
// import CompradorMenu from './pages/CompradorMenu';
// import CompradorCheckout from './pages/CompradorCheckout';
// import CompradorConfirmacion from './pages/CompradorConfirmacion';
// import RepartidorDashboard from './pages/RepartidorDashboard';
// import MisPedidosUCloseMeal from './pages/MisPedidosUCloseMeal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Página principal */}
              <Route path="/" element={<Home />} />

              {/* Autenticación */}
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/verificar-email" element={<EmailVerificationPending />} />

              {/* Favores - Vista pública, publicación protegida */}
              <Route path="/favores" element={<Favores />} />
              <Route
                path="/publicar"
                element={
                  <ProtectedRoute>
                    <PublicarFavor />
                  </ProtectedRoute>
                }
              />
              <Route path="/favor/:id" element={<FavorDetalle />} />
              <Route path="/clases-particulares" element={<ClasesParticulares />} />

              {/* Anuncios - Vista pública */}
              <Route path="/anuncios" element={<Anuncios />} />

              {/* Marketplace - Vista pública */}
              <Route path="/marketplace" element={<Marketplace />} />

              {/* Material - Vista pública */}
              <Route path="/material" element={<Material />} />
              <Route
                path="/admin/seed-folders"
                element={
                  <ProtectedRoute>
                    <AdminSeedFolders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/migrar-materiales"
                element={
                  <ProtectedRoute>
                    <MigrarMaterialesExistentes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/diagnostico"
                element={
                  <ProtectedRoute>
                    <DiagnosticoMaterial />
                  </ProtectedRoute>
                }
              />

              {/* UCloseMeal - TEMPORALMENTE DESHABILITADO */}
              {/* <Route path="/uclosemeal" element={<UCloseMealRoleSelect />} /> */}
              {/* <Route path="/uclosemeal/comprador" element={<CompradorRestaurantes />} /> */}
              {/* <Route path="/uclosemeal/comprador/restaurante/:id" element={<CompradorMenu />} /> */}
              {/* <Route path="/uclosemeal/comprador/checkout" element={<CompradorCheckout />} /> */}
              {/* <Route path="/uclosemeal/comprador/confirmacion" element={<CompradorConfirmacion />} /> */}
              {/* <Route path="/uclosemeal/repartidor" element={<RepartidorDashboard />} /> */}
              {/* <Route path="/uclosemeal/mis-pedidos" element={<MisPedidosUCloseMeal />} /> */}

              {/* Perfil - Protegidas */}
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/:userId"
                element={
                  <ProtectedRoute>
                    <PerfilPublico />
                  </ProtectedRoute>
                }
              />

              {/* Referidos - Protegidas */}
              <Route
                path="/mis-referidos"
                element={
                  <ProtectedRoute>
                    <MisReferidos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ranking-referidos"
                element={
                  <ProtectedRoute>
                    <RankingReferidos />
                  </ProtectedRoute>
                }
              />

              {/* Ruta por defecto - redirige a home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
