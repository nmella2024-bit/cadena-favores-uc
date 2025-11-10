import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Disclosure, Menu as HeadlessMenu } from '@headlessui/react';
import { Menu, X, MessageSquare, ChevronDown, Megaphone, ShoppingCart, HandHeart, UtensilsCrossed, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo-v4.png';
import ThemeToggle from './ui/ThemeToggle';
import FeedbackModal from './FeedbackModal';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  // Navegación principal (sin perfil/ingresar)
  const mainNavigation = [
    { label: 'Anuncios', to: '/anuncios', icon: Megaphone },
    { label: 'Marketplace', to: '/marketplace', icon: ShoppingCart },
    {
      label: 'Favores',
      icon: HandHeart,
      submenu: [
        { label: 'Ver favores', to: '/favores' },
        { label: 'Publicar favor', to: '/publicar' },
      ]
    },
    // TEMPORALMENTE DESHABILITADO: UCloseMeal
    // { label: 'UCloseMeal', to: '/uclosemeal', icon: UtensilsCrossed },
    { label: 'Material', to: '/material', icon: BookOpen },
  ];

  // Botón de perfil/ingresar (separado para ponerlo al final)
  const profileButton = currentUser
    ? { label: 'Mi perfil', to: '/perfil', icon: User }
    : { label: 'Ingresar', to: '/login', icon: User };

  const renderLink = (item, isMobile = false, onClick = null) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClick}
        className={({ isActive }) =>
          [
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
            isMobile ? 'w-full justify-start' : 'justify-center',
            isActive
              ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20'
              : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60',
          ].join(' ')
        }
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 border-b border-border bg-card/80 px-3 sm:px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60 dark:bg-card/60"
    >
      {({ open }) => (
        <>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 rounded-lg py-1 transition-colors hover:bg-card/80 dark:hover:bg-card/60 flex-shrink-0"
            >
              <img src={logo} alt="NexUC" className="h-10 w-10 sm:h-16 sm:w-16 rounded object-cover dark:invert" />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold leading-tight text-text-primary">
                  NexUC
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted hidden sm:block">
                  Tu Espacio UC
                </span>
              </div>
            </Link>

            {/* Búsqueda global - Desktop (centrado) */}
            <div className="hidden md:block flex-1 max-w-2xl mx-4">
              <GlobalSearch />
            </div>

            {/* Acciones de la derecha - Mobile */}
            <div className="flex md:hidden items-center gap-2 flex-shrink-0">
              <GlobalSearch />
              {currentUser && (
                <div className="relative">
                  <NotificationBell />
                </div>
              )}
              <Disclosure.Button
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card/70 p-2 text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 dark:bg-card/60 flex-shrink-0"
                aria-label="Abrir menú de navegación"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Disclosure.Button>
            </div>

            {/* Navegación desktop */}
            <div className="hidden items-center gap-2 md:flex">
              {/* Navegación principal */}
              {mainNavigation.map((item) => {
                // Si tiene submenú, renderizar dropdown
                if (item.submenu) {
                  const isActive = item.submenu.some(sub => location.pathname.startsWith(sub.to));
                  const Icon = item.icon;

                  return (
                    <HeadlessMenu as="div" className="relative" key={item.label}>
                      {({ open }) => (
                        <>
                          <HeadlessMenu.Button
                            className={[
                              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
                              isActive
                                ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20'
                                : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60',
                            ].join(' ')}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                            {item.label}
                            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </HeadlessMenu.Button>
                          <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {item.submenu.map((subItem) => (
                                <HeadlessMenu.Item key={subItem.to}>
                                  {({ active }) => (
                                    <Link
                                      to={subItem.to}
                                      className={[
                                        'block px-4 py-2 text-sm transition-colors',
                                        location.pathname === subItem.to
                                          ? 'bg-brand/10 text-brand font-medium'
                                          : active
                                          ? 'bg-card/80 text-text-primary'
                                          : 'text-text-muted',
                                      ].join(' ')}
                                    >
                                      {subItem.label}
                                    </Link>
                                  )}
                                </HeadlessMenu.Item>
                              ))}
                            </div>
                          </HeadlessMenu.Items>
                        </>
                      )}
                    </HeadlessMenu>
                  );
                }

                // Link normal
                return renderLink(item);
              })}

              {/* Botones de acción centrales */}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </button>
              {currentUser && <NotificationBell />}
              <ThemeToggle />

              {/* Botones de autenticación */}
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

              {/* Botón de perfil/ingresar - SIEMPRE AL FINAL */}
              {renderLink(profileButton)}
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            {({ close }) => (
            <div className="space-y-1 border-t border-border bg-card/70 py-3 dark:bg-card/60">
              {/* Navegación principal */}
              {mainNavigation.map((item) => {
                // Si tiene submenú, renderizar items expandidos
                if (item.submenu) {
                  const isActive = item.submenu.some(sub => location.pathname.startsWith(sub.to));
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="space-y-1">
                      <div
                        className={[
                          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium w-full',
                          isActive
                            ? 'bg-brand/10 text-brand'
                            : 'text-text-muted',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                        {item.label}
                      </div>
                      <div className="ml-8 space-y-1">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to}
                            onClick={() => close()}
                            className={({ isActive }) =>
                              [
                                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4'
                                  : 'text-text-muted hover:text-text-primary hover:bg-card/80',
                              ].join(' ')
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Link normal con close
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => close()}
                    className={({ isActive }) =>
                      [
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
                        'w-full justify-start',
                        isActive
                          ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20'
                          : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60',
                      ].join(' ')
                    }
                  >
                    {item.icon && <item.icon className="h-4 w-4" strokeWidth={2} />}
                    {item.label}
                  </NavLink>
                );
              })}

              {/* Botón de perfil/ingresar */}
              {renderLink(profileButton, true, () => close())}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
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
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};

export default Navbar;
