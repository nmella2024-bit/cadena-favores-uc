import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, User, Heart, Home, ShoppingBag, BookOpen } from 'lucide-react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // Toggle with Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const pages = [
        { name: 'Inicio', icon: Home, href: '/' },
        { name: 'Favores', icon: Heart, href: '/favores' },
        { name: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        { name: 'Material de Estudio', icon: BookOpen, href: '/material' },
        { name: 'Mi Perfil', icon: User, href: '/perfil' },
    ];

    const filteredPages = query === ''
        ? pages
        : pages.filter((page) =>
            page.name.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (href) => {
        navigate(href);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="mx-auto max-w-xl transform divide-y divide-border overflow-hidden rounded-xl bg-card shadow-2xl ring-1 ring-black/5 transition-all dark:bg-card/95 dark:ring-white/10">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-text-muted" aria-hidden="true" />
                                <input
                                    type="text"
                                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:ring-0 sm:text-sm"
                                    placeholder="¿Qué necesitas hoy?..."
                                    onChange={(event) => setQuery(event.target.value)}
                                    value={query}
                                />
                            </div>

                            {filteredPages.length > 0 && (
                                <ul className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                                    {filteredPages.map((page) => (
                                        <li key={page.name}>
                                            <button
                                                onClick={() => handleSelect(page.href)}
                                                className="group flex w-full select-none items-center rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-brand/10 hover:text-brand"
                                            >
                                                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-card border border-border group-hover:border-brand/30">
                                                    <page.icon className="h-5 w-5 text-text-muted group-hover:text-brand" aria-hidden="true" />
                                                </div>
                                                <span className="ml-3 flex-auto truncate text-left font-medium">{page.name}</span>
                                                <span className="ml-3 flex-none text-xs text-text-muted">Ir a...</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {query !== '' && filteredPages.length === 0 && (
                                <div className="px-6 py-14 text-center text-sm sm:px-14">
                                    <Command className="mx-auto h-6 w-6 text-text-muted" aria-hidden="true" />
                                    <p className="mt-4 font-semibold text-text-primary">No se encontraron resultados</p>
                                    <p className="mt-2 text-text-muted">Intenta buscar otra cosa.</p>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center bg-card/50 px-4 py-2.5 text-xs text-text-muted border-t border-border">
                                <span className="mr-2">Consejo:</span>
                                <span>Busca "Comida", "Libros" o "Ayuda"</span>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CommandPalette;
