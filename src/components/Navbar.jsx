import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Disclosure, Menu as HeadlessMenu } from '@headlessui/react';
import { Menu, X, MessageSquare, ChevronDown, Megaphone, ShoppingCart, HandHeart, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo-v4.png';
import ThemeToggle from './ui/ThemeToggle';
import FeedbackModal from './FeedbackModal';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

const NAVIGATION_ITEMS = [
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
  { label: 'Material', to: '/material', icon: BookOpen },
];

const NavItem = ({ item, isMobile, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-1 lg:gap-2 rounded-lg px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
          isMobile ? 'w-full justify-start' : 'justify-center',
          isActive
            ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20'
            : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60',
        ].join(' ')
      }
      title={item.label}
    >
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
      <span className="whitespace-nowrap hidden lg:inline">{item.label}</span>
    </NavLink>
  );
};

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  const profileButton = currentUser
    ? { label: 'Mi perfil', to: '/perfil', icon: User }
    : { label: 'Ingresar', to: '/login', icon: User };

  return (
    <>
      <Disclosure as="nav" className="sticky top-0 z-50 border-b border-border bg-card/80 px-3 sm:px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60 dark:bg-card/60">
        {({ open }) => (
          <>
            <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-1 md:gap-2">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-2 rounded-lg py-1 transition-colors hover:bg-card/80 dark:hover:bg-card/60 flex-shrink-0">
                <img src={logo} alt="NexU+" className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded object-cover dark:invert flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-tight text-text-primary truncate">NexU+</span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-medium uppercase tracking-wide text-text-muted hidden sm:block truncate">Tu Espacio en la U</span>
                </div>
              </Link>

              {/* Búsqueda global - Desktop */}
              <div className="hidden md:flex items-center mx-2">
                <GlobalSearch />
              </div>

              {/* Acciones Mobile */}
              <div className="flex md:hidden items-center gap-0.5 sm:gap-1.5 flex-shrink-0 ml-auto">
                <div className="flex-shrink-0"><GlobalSearch /></div>
                {currentUser && <div className="flex-shrink-0"><NotificationBell /></div>}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-lg border border-border bg-card/70 p-1.5 sm:p-2 text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 dark:bg-card/60 flex-shrink-0" aria-label="Abrir menú">
                  {open ? <X className="h-6 w-6 sm:h-7 sm:w-7" /> : <Menu className="h-6 w-6 sm:h-7 sm:w-7" />}
                </Disclosure.Button>
              </div>

              {/* Navegación Desktop */}
              <div className="hidden items-center gap-1 lg:gap-2 md:flex flex-shrink-0 ml-auto">
                {NAVIGATION_ITEMS.map((item) => {
                  if (item.submenu) {
                    const isActive = item.submenu.some(sub => location.pathname.startsWith(sub.to));
                    const Icon = item.icon;
                    return (
                      <HeadlessMenu as="div" className="relative" key={item.label}>
                        <HeadlessMenu.Button className={`inline-flex items-center gap-1 lg:gap-2 rounded-lg px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${isActive ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4 dark:bg-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-card/80 dark:hover:bg-card/60'}`}>
                          <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                          <span className="whitespace-nowrap hidden lg:inline">{item.label}</span>
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        </HeadlessMenu.Button>
                        <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {item.submenu.map((subItem) => (
                              <HeadlessMenu.Item key={subItem.to}>
                                {({ active }) => (
                                  <Link to={subItem.to} className={`block px-4 py-2 text-sm transition-colors ${location.pathname === subItem.to ? 'bg-brand/10 text-brand font-medium' : active ? 'bg-card/80 text-text-primary' : 'text-text-muted'}`}>
                                    {subItem.label}
                                  </Link>
                                )}
                              </HeadlessMenu.Item>
                            ))}
                          </div>
                        </HeadlessMenu.Items>
                      </HeadlessMenu>
                    );
                  }
                  return <NavItem key={item.to} item={item} />;
                })}

                <button type="button" onClick={() => setIsFeedbackOpen(true)} className="hidden lg:inline-flex items-center gap-1 lg:gap-2 rounded-lg border border-brand/30 bg-brand/10 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-brand transition-colors hover:bg-brand/20">
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Feedback</span>
                </button>
                {currentUser && <NotificationBell />}
                <div className="hidden lg:block"><ThemeToggle /></div>

                {currentUser ? (
                  <button type="button" onClick={logout} className="inline-flex items-center whitespace-nowrap rounded-lg border border-border bg-card/70 px-2 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 dark:bg-card/60">
                    <span className="hidden lg:inline">Cerrar sesión</span>
                    <span className="lg:hidden">Salir</span>
                  </button>
                ) : (
                  <Link to="/registro" className="inline-flex items-center whitespace-nowrap rounded-lg bg-[rgb(var(--brand))] px-2 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))]">
                    Registro
                  </Link>
                )}
                <NavItem item={profileButton} />
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              {({ close }) => (
                <div className="space-y-0.5 sm:space-y-1 border-t border-border bg-card/70 py-2 sm:py-3 px-2 sm:px-3 dark:bg-card/60">
                  {NAVIGATION_ITEMS.map((item) => {
                    if (item.submenu) {
                      const isActive = item.submenu.some(sub => location.pathname.startsWith(sub.to));
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="space-y-0.5 sm:space-y-1">
                          <div className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium w-full ${isActive ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                            {item.label}
                          </div>
                          <div className="ml-6 sm:ml-8 space-y-0.5 sm:space-y-1">
                            {item.submenu.map((subItem) => (
                              <NavLink key={subItem.to} to={subItem.to} onClick={() => close()} className={({ isActive }) => `block rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand underline decoration-2 underline-offset-4' : 'text-text-muted hover:text-text-primary hover:bg-card/80'}`}>
                                {subItem.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return <NavItem key={item.to} item={item} isMobile onClick={() => close()} />;
                  })}

                  <NavItem item={profileButton} isMobile onClick={() => close()} />

                  <button type="button" onClick={() => setIsFeedbackOpen(true)} className="w-full inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-brand/30 bg-brand/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-brand transition-colors hover:bg-brand/20">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Feedback
                  </button>

                  {currentUser ? (
                    <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 pt-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <ThemeToggle />
                        <span className="text-xs sm:text-sm text-text-muted truncate">Hola, <span className="font-semibold text-text-primary">{currentUser.nombre.split(' ')[0]}</span></span>
                      </div>
                      <button type="button" onClick={logout} className="inline-flex items-center rounded-lg bg-brand/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-brand transition-colors hover:bg-brand/20 whitespace-nowrap flex-shrink-0">
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:gap-3 px-2 sm:px-3 pt-2">
                      <ThemeToggle className="self-start" />
                      <Link to="/registro" className="inline-flex items-center justify-center rounded-lg bg-[rgb(var(--brand))] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))]">
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
