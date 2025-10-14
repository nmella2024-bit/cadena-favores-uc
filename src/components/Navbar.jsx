import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi_logo_actualizado.png.jpg';
import ThemeToggle from './ui/ThemeToggle';
import FeedbackModal from './FeedbackModal';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const navigation = currentUser
    ? [
        { label: 'Ver favores', to: '/favores' },
        { label: 'Publicar favor', to: '/publicar' },
        { label: 'Anuncios', to: '/anuncios' },
        { label: 'Mi perfil', to: '/perfil' },
      ]
    : [
        { label: 'Ver favores', to: '/favores' },
        { label: 'Publicar favor', to: '/publicar' },
        { label: 'Anuncios', to: '/anuncios' },
        { label: 'Ingresar', to: '/login' },
      ];

  const renderLink = (item, isMobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        [
          'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
          isMobile ? 'w-full justify-start' : 'justify-center',
          isActive
            ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20'
            : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  );

  return (
    <>
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6 supports-[backdrop-filter]:bg-card/60 dark:bg-card/60"
    >
      {({ open }) => (
        <>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-card/80 dark:hover:bg-card/60"
            >
              <img src={logo} alt="Red UC" className="h-10 w-10 rounded object-cover" />
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight text-text-primary">
                  Red UC
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Comunidad solidaria
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navigation.map((item) => renderLink(item))}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
              >
                <MessageSquare className="h-4 w-4" />
                Danos tu feedback
              </button>
              <ThemeToggle />
              {currentUser ? (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))] dark:bg-card/60"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/registro"
                  className="inline-flex items-center rounded-lg bg-[rgb(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
                >
                  Registrarse
                </Link>
              )}
            </div>

            <div className="md:hidden">
              <Disclosure.Button
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card/70 p-2 text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))] dark:bg-card/60"
                aria-label="Abrir menú de navegación"
              >
                {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </Disclosure.Button>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 border-t border-border bg-card/70 py-3 dark:bg-card/60">
              {navigation.map((item) => renderLink(item, true))}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
              >
                <MessageSquare className="h-4 w-4" />
                Danos tu feedback
              </button>
              {currentUser ? (
                <div className="flex items-center justify-between gap-3 px-3 pt-2">
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <span className="text-sm text-text-muted">
                      Hola,{' '}
                      <span className="font-semibold text-text-primary">
                        {currentUser.nombre.split(' ')[0]}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-3 pt-2">
                  <ThemeToggle className="self-start" />
                  <Link
                    to="/registro"
                    className="inline-flex items-center justify-center rounded-lg bg-[rgb(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};

export default Navbar;
