import React from 'react';
import { NavLink } from 'react-router-dom';

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
            <span className={`whitespace-nowrap ${isMobile ? '' : 'hidden lg:inline'}`}>{item.label}</span>
        </NavLink>
    );
};

export default NavItem;
