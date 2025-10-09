import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre el proyecto */}
          <div>
            <h3 className="text-lg font-semibold text-uc-blue mb-3">Red UC</h3>
            <p className="text-gray-600 text-sm">
              Plataforma colaborativa creada por y para estudiantes de la Pontificia Universidad Católica de Chile.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Proyecto estudiantil sin fines de lucro
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-uc-blue mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📧 contacto@reduc.cl</li>
              <li>🏛️ Pontificia Universidad Católica de Chile</li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-lg font-semibold text-uc-blue mb-3">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-uc-blue transition-smooth">
                Instagram
              </a>
              <a href="#" className="text-gray-600 hover:text-uc-blue transition-smooth">
                Facebook
              </a>
              <a href="#" className="text-gray-600 hover:text-uc-blue transition-smooth">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© 2025 Red UC. Todos los derechos reservados.</p>
          <p className="mt-1">
            "Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
