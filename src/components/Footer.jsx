import React from 'react';

const Footer = () => (
  <footer className="mt-auto border-t border-border bg-[rgb(var(--bg-card))]">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text-primary))]">Red UC</h3>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Plataforma colaborativa creada por estudiantes de la Pontificia Universidad Católica de Chile para
            fortalecer la ayuda entre pares.
          </p>
          <p className="text-xs text-[rgb(var(--text-muted))]">Proyecto estudiantil sin fines de lucro.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text-primary))]">Contacto</h3>
          <ul className="space-y-2 text-sm text-[rgb(var(--text-muted))]">
            <li>contacto@reduc.cl</li>
            <li>Campus San Joaquín, Macul, Santiago</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text-primary))]">Síguenos</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="#" className="text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--brand))]">
              Instagram
            </a>
            <a href="#" className="text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--brand))]">
              LinkedIn
            </a>
            <a href="#" className="text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--brand))]">
              Github
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-center text-sm text-[rgb(var(--text-muted))]">
        <p>© {new Date().getFullYear()} Red UC. Todos los derechos reservados.</p>
        <p className="mt-2 italic">
          “Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien.”
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
