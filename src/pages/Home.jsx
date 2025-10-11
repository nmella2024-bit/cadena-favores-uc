import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo.png.jpg';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo y título */}
            <div className="mb-8 flex flex-col items-center">
              <img src={logo} alt="Red UC Logo" className="h-10 rounded mb-6" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Red UC
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-gray-600">
                Conecta con otros estudiantes
              </p>
            </div>

            {/* Frase inspiradora */}
            <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-700">
              "Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien."
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {currentUser ? (
                <>
                  <Link
                    to="/publicar"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Pide un favor
                  </Link>
                  <Link
                    to="/publicar"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-blue-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Ofrece tu ayuda
                  </Link>
                  <Link
                    to="/favores"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Ver favores publicados
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/registro"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Registrarse
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona - 3 pasos */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-3">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-base sm:text-lg">
            Es muy simple. Solo sigue estos tres pasos:
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="text-center p-6 sm:p-8 rounded-lg bg-white hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl sm:text-6xl mb-4">1️⃣</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Regístrate</h3>
              <p className="text-gray-600 text-base">
                Crea tu cuenta con tu correo UC. Es rápido y sin complicaciones.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center p-6 sm:p-8 rounded-lg bg-white hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl sm:text-6xl mb-4">2️⃣</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Publica o busca</h3>
              <p className="text-gray-600 text-base">
                Publica un favor que necesites o busca cómo puedes ayudar a otros.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center p-6 sm:p-8 rounded-lg bg-white hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl sm:text-6xl mb-4">3️⃣</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Colabora</h3>
              <p className="text-gray-600 text-base">
                Conecta con otros estudiantes y construye una comunidad solidaria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características principales */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            ¿Qué puedes hacer en Red UC?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-4xl sm:text-5xl mb-4">📚</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Apuntes y Estudio
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Comparte o solicita material de estudio
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-4xl sm:text-5xl mb-4">🎓</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Clases Particulares
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Ofrece o recibe ayuda académica
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-4xl sm:text-5xl mb-4">📝</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Material Universitario
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Préstamos de libros, calculadoras y más
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-4xl sm:text-5xl mb-4">🤝</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Colaboraciones
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Trabaja en proyectos con otros estudiantes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!currentUser && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg sm:text-xl mb-8 text-gray-700">
              Únete a la comunidad de estudiantes UC que se ayudan mutuamente
            </p>
            <Link
              to="/registro"
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
