import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, Megaphone, ShoppingBag, BookOpen, Clock, User } from 'lucide-react';
import { formatearItemFeed } from '../services/feedService';

const FeedItem = ({ item }) => {
    const formattedItem = formatearItemFeed(item);

    const getIconoTipo = (tipo) => {
        switch (tipo) {
            case 'favor':
                return <HandHeart className="w-5 h-5" />;
            case 'anuncio':
                return <Megaphone className="w-5 h-5" />;
            case 'marketplace':
                return <ShoppingBag className="w-5 h-5" />;
            case 'material':
                return <BookOpen className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const getColorBadge = (tipo) => {
        switch (tipo) {
            case 'favor':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'anuncio':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'marketplace':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'material':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatearFecha = (timestamp) => {
        if (!timestamp) return '';

        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMinutos = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMinutos < 1) return 'Ahora';
        if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias}d`;

        return fecha.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <Link
            to={formattedItem.link}
            className="block bg-card border border-border rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-brand/30 transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${getColorBadge(item.type)}`}>
                        {getIconoTipo(item.type)}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${getColorBadge(item.type)}`}>
                            {formattedItem.badge}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatearFecha(item.timestamp)}
                        </span>
                    </div>
                </div>
                {formattedItem.fijado && (
                    <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded flex-shrink-0">
                        Fijado
                    </span>
                )}
            </div>

            {/* Contenido */}
            <div className="space-y-1.5 sm:space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-text-primary line-clamp-2">
                    {formattedItem.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted line-clamp-2">
                    {formattedItem.descripcion}
                </p>

                {/* Info adicional según tipo */}
                {item.type === 'marketplace' && formattedItem.precio && (
                    <p className="text-lg font-bold text-brand">
                        ${formattedItem.precio.toLocaleString('es-CL')}
                    </p>
                )}

                {item.type === 'material' && (
                    <div className="flex flex-wrap gap-2">
                        {formattedItem.carrera && (
                            <span className="text-xs bg-canvas px-2 py-1 rounded">
                                {formattedItem.carrera}
                            </span>
                        )}
                        {formattedItem.ramo && (
                            <span className="text-xs bg-canvas px-2 py-1 rounded">
                                {formattedItem.ramo}
                            </span>
                        )}
                    </div>
                )}

                {item.type === 'favor' && formattedItem.categoria && (
                    <span className="inline-block text-xs bg-canvas px-2 py-1 rounded">
                        {formattedItem.categoria}
                    </span>
                )}
            </div>

            {/* Footer - Autor */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <User className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-muted">
                    {formattedItem.autor || 'Usuario'}
                </span>
            </div>
        </Link>
    );
};

export default memo(FeedItem);
