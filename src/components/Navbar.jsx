import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo.png.jpg';
import ThemeToggle from './ui/ThemeToggle';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  const navigation = currentUser
    ? [
        { label: 'Ver favores', to: '/favores' },
        { label: 'Publicar favor', to: '/publicar' },
        { label: 'Mi perfil', to: '/perfil' },
      ]
    : [
        { label: 'Ver favores', to: '/favores' },
        { label: 'Publicar favor', to: '/publicar' },
        { label: 'Ingresar', to: '/login' },
      ];

  const renderLink = (item, isMobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        [
          'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-offset-2',
          isMobile ? 'w-full justify-start' : 'justify-center',
          isActive
            ? 'bg-slate-100 text-brand underline decoration-2 underline-offset-4'
            : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-slate-100',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  );

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-white/80 backdrop-blur px-4 sm:px-6"
    >
      {({ open }) => (
        <>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
            >
              <img src={logo} alt="Red UC" className="h-10 w-10 rounded object-cover" />
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight text-[rgb(var(--text-primary))]">
                  Red UC
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  Comunidad solidaria
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navigation.map((item) => renderLink(item))}
              <ThemeToggle />
              {currentUser ? (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm font-medium text-[rgb(var(--text-muted))] transition-colors hover:bg-slate-100 hover:text-[rgb(var(--text-primary))]"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/registro"
                  className="inline-flex items-center rounded-lg bg-[rgb(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))]"
                >
                  Registrarse
                </Link>
              )}
            </div>

            <div className="md:hidden">
              <Disclosure.Button
                className="inline-flex items-center justify-center rounded-lg border border-[rgb(var(--border))] p-2 text-[rgb(var(--text-muted))] transition-colors hover:bg-slate-100 hover:text-[rgb(var(--text-primary))]"
                aria-label="Abrir menú de navegación"
              >
                {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </Disclosure.Button>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 border-t border-[rgb(var(--border))] py-3">
              {navigation.map((item) => renderLink(item, true))}
              {currentUser ? (
                <div className="flex items-center justify-between gap-3 px-3 pt-2">
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <span className="text-sm text-[rgb(var(--text-muted))]">
                      Hola,{' '}
                      <span className="font-semibold text-[rgb(var(--text-primary))]">
                        {currentUser.nombre.split(' ')[0]}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-[rgb(var(--text-primary))] transition-colors hover:bg-slate-200"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-3 pt-2">
                  <ThemeToggle className="self-start" />
                  <Link
                    to="/registro"
                    className="inline-flex items-center justify-center rounded-lg bg-[rgb(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))]"
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
  );
};

export default Navbar;
