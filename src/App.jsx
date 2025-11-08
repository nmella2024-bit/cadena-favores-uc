import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Favores from './pages/Favores';
import PublicarFavor from './pages/PublicarFavor';
import Perfil from './pages/Perfil';
import PerfilPublico from './pages/PerfilPublico';
import FavorDetalle from './pages/FavorDetalle';
import Anuncios from './pages/Anuncios';
import Marketplace from './pages/Marketplace';
import Material from './pages/Material';
import EmailVerificationPending from './pages/EmailVerificationPending';
import AdminSeedFolders from './components/AdminSeedFolders';
import MigrarMaterialesExistentes from './components/MigrarMaterialesExistentes';
import DiagnosticoMaterial from './components/DiagnosticoMaterial';

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
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<Home />} />

            {/* Autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificar-email" element={<EmailVerificationPending />} />

            {/* Favores - Protegidas */}
            <Route
              path="/favores"
              element={
                <ProtectedRoute>
                  <Favores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/publicar"
              element={
                <ProtectedRoute>
                  <PublicarFavor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favor/:id"
              element={
                <ProtectedRoute>
                  <FavorDetalle />
                </ProtectedRoute>
              }
            />

            {/* Anuncios - Protegidas */}
            <Route
              path="/anuncios"
              element={
                <ProtectedRoute>
                  <Anuncios />
                </ProtectedRoute>
              }
            />

            {/* Marketplace - Protegidas */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            {/* Material - Protegidas */}
            <Route
              path="/material"
              element={
                <ProtectedRoute>
                  <Material />
                </ProtectedRoute>
              }
            />
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

            {/* Ruta por defecto - redirige a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
