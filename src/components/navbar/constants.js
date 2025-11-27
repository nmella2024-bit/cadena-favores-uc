import { Megaphone, ShoppingCart, HandHeart, BookOpen } from 'lucide-react';

export const NAVIGATION_ITEMS = [
    { label: 'Anuncios', to: '/anuncios', icon: Megaphone },
    { label: 'Marketplace', to: '/marketplace', icon: ShoppingCart },
    {
        label: 'Favores',
        icon: HandHeart,
        submenu: [
            { label: 'Ver favores', to: '/favores' },
            { label: 'Publicar favor', to: '/publicar' },
            { label: 'Clases particulares', to: '/clases-particulares' },
        ]
    },
    { label: 'Material', to: '/material', icon: BookOpen },
];
