import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MessageSquare, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import NavItem from './NavItem';
import { NAVIGATION_ITEMS } from './constants';

const MobileMenu = ({ currentUser, logout, setIsFeedbackOpen, location }) => {
    const profileButton = currentUser
        ? { label: 'Mi perfil', to: '/perfil', icon: User }
        : { label: 'Ingresar', to: '/login', icon: User };

    return (
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
                        if (item.label === 'Christmas UC') {
                            const isAdmin = currentUser?.rol === 'admin';
                            if (!isAdmin) {
                                return (
                                    <div key={item.label} className="flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-text-muted/50 cursor-not-allowed line-through w-full">
                                        <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                                        {item.label}
                                    </div>
                                );
                            }
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
    );
};

export default MobileMenu;
