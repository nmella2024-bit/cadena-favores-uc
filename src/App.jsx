import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AppRoutes from './routes';
import LoadingFallback from './components/ui/LoadingFallback';

import CommandPalette from './components/ui/CommandPalette';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CommandPalette />
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

