import React, { lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';

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

const AppRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Página principal */}
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />

                {/* Autenticación */}
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/registro" element={<PageTransition><Registro /></PageTransition>} />
                <Route path="/verificar-email" element={<EmailVerificationPending />} />

                {/* Favores - Vista pública, publicación protegida */}
                <Route path="/favores" element={<PageTransition><Favores /></PageTransition>} />
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
                <Route path="/anuncios" element={<PageTransition><Anuncios /></PageTransition>} />

                {/* Marketplace - Vista pública */}
                <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />

                {/* Material - Vista pública */}
                <Route path="/material" element={<PageTransition><Material /></PageTransition>} />
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
        </AnimatePresence>
    );
};

export default AppRoutes;
