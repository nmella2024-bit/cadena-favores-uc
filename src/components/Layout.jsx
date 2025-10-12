import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-[rgb(var(--bg-canvas))] text-[rgb(var(--text-primary))]">
    <a href="#main-content" className="skip-link">
      Saltar al contenido principal
    </a>
    <Navbar />
    <main id="main-content" className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
