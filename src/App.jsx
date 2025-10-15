import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Favores from './pages/Favores';
import PublicarFavor from './pages/PublicarFavor';
import Perfil from './pages/Perfil';
import Anuncios from './pages/Anuncios';
import Marketplace from './pages/Marketplace';

// UCloseMeal Pages
import UCloseMealRoleSelect from './pages/UCloseMealRoleSelect';
import CompradorRestaurantes from './pages/CompradorRestaurantes';
import CompradorMenu from './pages/CompradorMenu';
import CompradorCheckout from './pages/CompradorCheckout';
import CompradorConfirmacion from './pages/CompradorConfirmacion';
import RepartidorDashboard from './pages/RepartidorDashboard';
import MisPedidosUCloseMeal from './pages/MisPedidosUCloseMeal';

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

            {/* Favores */}
            <Route path="/favores" element={<Favores />} />
            <Route path="/publicar" element={<PublicarFavor />} />

            {/* Anuncios */}
            <Route path="/anuncios" element={<Anuncios />} />

            {/* Marketplace */}
            <Route path="/marketplace" element={<Marketplace />} />

            {/* UCloseMeal */}
            <Route path="/uclosemeal" element={<UCloseMealRoleSelect />} />
            <Route path="/uclosemeal/comprador" element={<CompradorRestaurantes />} />
            <Route path="/uclosemeal/comprador/restaurante/:id" element={<CompradorMenu />} />
            <Route path="/uclosemeal/comprador/checkout" element={<CompradorCheckout />} />
            <Route path="/uclosemeal/comprador/confirmacion" element={<CompradorConfirmacion />} />
            <Route path="/uclosemeal/repartidor" element={<RepartidorDashboard />} />
            <Route path="/uclosemeal/mis-pedidos" element={<MisPedidosUCloseMeal />} />

            {/* Perfil */}
            <Route path="/perfil" element={<Perfil />} />

            {/* Ruta por defecto - redirige a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
