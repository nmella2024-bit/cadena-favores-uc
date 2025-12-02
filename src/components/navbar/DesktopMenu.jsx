import React from 'react';
import { Link } from 'react-router-dom';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { MessageSquare, ChevronDown, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../NotificationBell';
import NavItem from './NavItem';
import { NAVIGATION_ITEMS } from './constants';

const DesktopMenu = ({ currentUser, logout, setIsFeedbackOpen, location }) => {
    const profileButton = currentUser
        ? { label: 'Mi perfil', to: '/perfil', icon: User }
        : { label: 'Ingresar', to: '/login', icon: User };

    return (
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
                if (item.label === 'Christmas UC') {
                    const isAdmin = currentUser?.rol === 'admin';
                    if (!isAdmin) {
                        return (
                            <div key={item.label} className="inline-flex items-center gap-1 lg:gap-2 rounded-lg px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-text-muted/50 cursor-not-allowed line-through" title="Próximamente">
                                <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                                <span className="whitespace-nowrap hidden lg:inline">{item.label}</span>
                            </div>
                        );
                    }
                }
                return <NavItem key={item.to} item={item} />;
            })}

            <button type="button" onClick={() => setIsFeedbackOpen(true)} className="hidden lg:inline-flex items-center justify-center rounded-lg border border-brand/30 bg-brand/10 p-2 text-brand transition-colors hover:bg-brand/20" title="Dar Feedback">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
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
    );
};

export default DesktopMenu;
