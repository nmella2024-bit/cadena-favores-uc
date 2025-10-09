import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo.png.jpg';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-uc-blue to-uc-blue-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo y título */}
            <div className="mb-8 flex flex-col items-center">
              <img src={logo} alt="Red UC Logo" className="h-10 rounded mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Red UC
              </h1>
              <p className="text-2xl md:text-3xl font-light opacity-90">
                Conecta con otros estudiantes
              </p>
            </div>

            {/* Frase inspiradora */}
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-95">
              "Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien."
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {currentUser ? (
                <>
                  <Link
                    to="/publicar"
                    className="px-8 py-4 bg-mint text-white rounded-lg text-lg font-semibold hover:bg-mint-light transition-smooth shadow-lg"
                  >
                    Pide un favor
                  </Link>
                  <Link
                    to="/publicar"
                    className="px-8 py-4 bg-white text-uc-blue rounded-lg text-lg font-semibold hover:bg-gray-100 transition-smooth shadow-lg"
                  >
                    Ofrece tu ayuda
                  </Link>
                  <Link
                    to="/favores"
                    className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-uc-blue transition-smooth"
                  >
                    Ver favores publicados
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/registro"
                    className="px-8 py-4 bg-mint text-white rounded-lg text-lg font-semibold hover:bg-mint-light transition-smooth shadow-lg"
                  >
                    Registrarse
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white text-uc-blue rounded-lg text-lg font-semibold hover:bg-gray-100 transition-smooth shadow-lg"
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-uc-blue mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Es muy simple. Solo sigue estos tres pasos:
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-smooth">
              <div className="text-6xl mb-4">1️⃣</div>
              <h3 className="text-2xl font-bold text-uc-blue mb-3">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta con tu correo UC. Es rápido y sin complicaciones.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-smooth">
              <div className="text-6xl mb-4">2️⃣</div>
              <h3 className="text-2xl font-bold text-uc-blue mb-3">Publica o busca</h3>
              <p className="text-gray-600">
                Publica un favor que necesites o busca cómo puedes ayudar a otros.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-smooth">
              <div className="text-6xl mb-4">3️⃣</div>
              <h3 className="text-2xl font-bold text-uc-blue mb-3">Colabora</h3>
              <p className="text-gray-600">
                Conecta con otros estudiantes y construye una comunidad solidaria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características principales */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-uc-blue mb-12">
            ¿Qué puedes hacer en Red UC?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-smooth text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-uc-blue mb-2">
                Apuntes y Estudio
              </h3>
              <p className="text-gray-600">
                Comparte o solicita material de estudio
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-smooth text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-uc-blue mb-2">
                Clases Particulares
              </h3>
              <p className="text-gray-600">
                Ofrece o recibe ayuda académica
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-smooth text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-uc-blue mb-2">
                Material Universitario
              </h3>
              <p className="text-gray-600">
                Préstamos de libros, calculadoras y más
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-smooth text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-uc-blue mb-2">
                Colaboraciones
              </h3>
              <p className="text-gray-600">
                Trabaja en proyectos con otros estudiantes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!currentUser && (
        <section className="py-20 bg-gradient-to-r from-uc-blue to-mint text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a la comunidad de estudiantes UC que se ayudan mutuamente
            </p>
            <Link
              to="/registro"
              className="inline-block px-10 py-4 bg-white text-uc-blue rounded-lg text-lg font-bold hover:bg-gray-100 transition-smooth shadow-xl"
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
