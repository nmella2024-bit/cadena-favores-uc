import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo-v4.png';
import FeedbackModal from './FeedbackModal';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import DesktopMenu from './navbar/DesktopMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

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
              <DesktopMenu
                currentUser={currentUser}
                logout={logout}
                setIsFeedbackOpen={setIsFeedbackOpen}
                location={location}
              />
            </div>

            {/* Menú Mobile */}
            <MobileMenu
              currentUser={currentUser}
              logout={logout}
              setIsFeedbackOpen={setIsFeedbackOpen}
              location={location}
            />
          </>
        )}
      </Disclosure>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};

export default Navbar;

