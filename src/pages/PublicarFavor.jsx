import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';

const PublicarFavor = () => {
  const navigate = useNavigate();
  const { currentUser, publishFavor } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    disponibilidad: '',
  });
  const [error, setError] = useState('');

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.categoria) {
      setError('Debes seleccionar una categoría');
      return;
    }

    try {
      publishFavor(formData);
      alert('¡Favor publicado exitosamente!');
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar un Favor</h1>
            <p className="text-gray-600 text-base">
              Comparte lo que necesitas o lo que puedes ofrecer a la comunidad UC
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-semibold text-gray-800 mb-2">
                Título del favor *
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                required
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Ayuda con Cálculo II, Presto apuntes de Programación"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
              <p className="mt-1 text-sm text-gray-500">
                Sé claro y específico sobre lo que ofreces o necesitas
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-800 mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows="5"
                required
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe los detalles del favor: qué incluye, requisitos, expectativas, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth resize-none"
              />
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-semibold text-gray-800 mb-2">
                Categoría *
              </label>
              <select
                id="categoria"
                name="categoria"
                required
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Disponibilidad horaria */}
            <div>
              <label htmlFor="disponibilidad" className="block text-sm font-semibold text-gray-800 mb-2">
                Disponibilidad horaria (opcional)
              </label>
              <input
                id="disponibilidad"
                name="disponibilidad"
                type="text"
                value={formData.disponibilidad}
                onChange={handleChange}
                placeholder="Ej: Lunes a viernes por la tarde, Fines de semana"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">💡 Consejos para publicar:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Sé específico sobre lo que ofreces o necesitas</li>
                <li>Indica claramente tu disponibilidad</li>
                <li>Mantén un tono amable y respetuoso</li>
                <li>Responde rápido cuando alguien te contacte</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/favores')}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Publicar Favor
              </button>
            </div>
          </form>

          {/* Información de privacidad */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-600 text-center">
              Al publicar un favor, tu nombre y correo serán visibles para otros usuarios.
              Los datos se almacenan localmente en tu navegador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicarFavor;
