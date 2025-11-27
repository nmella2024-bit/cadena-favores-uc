import React from 'react';

const LoadingFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-canvas))]">
        <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
            <p className="mt-4 text-sm text-text-muted">Cargando...</p>
        </div>
    </div>
);

export default LoadingFallback;
