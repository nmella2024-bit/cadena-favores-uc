import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Registro = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    carrera: '',
    año: '',
    intereses: '',
    descripcion: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Procesar intereses como array
      const interesesArray = formData.intereses
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      register({
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        carrera: formData.carrera,
        año: parseInt(formData.año),
        intereses: interesesArray,
        descripcion: formData.descripcion,
      });

      alert('¡Cuenta creada exitosamente!');
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md border border-gray-200 p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
          <p className="text-gray-600 text-base">Únete a la comunidad de Red UC</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grid de 2 columnas para algunos campos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-800 mb-2">
                Nombre Completo *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-semibold text-gray-800 mb-2">
                Correo UC *
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                value={formData.correo}
                onChange={handleChange}
                placeholder="tunombre@uc.cl"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Carrera */}
            <div>
              <label htmlFor="carrera" className="block text-sm font-semibold text-gray-800 mb-2">
                Carrera *
              </label>
              <input
                id="carrera"
                name="carrera"
                type="text"
                required
                value={formData.carrera}
                onChange={handleChange}
                placeholder="Ej: Ingeniería, Derecho"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              />
            </div>

            {/* Año */}
            <div>
              <label htmlFor="año" className="block text-sm font-semibold text-gray-800 mb-2">
                Año *
              </label>
              <select
                id="año"
                name="año"
                required
                value={formData.año}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
              >
                <option value="">Selecciona</option>
                <option value="1">1° año</option>
                <option value="2">2° año</option>
                <option value="3">3° año</option>
                <option value="4">4° año</option>
                <option value="5">5° año</option>
                <option value="6">Postgrado</option>
              </select>
            </div>
          </div>

          {/* Intereses */}
          <div>
            <label htmlFor="intereses" className="block text-sm font-semibold text-gray-800 mb-2">
              Intereses (separados por comas)
            </label>
            <input
              id="intereses"
              name="intereses"
              type="text"
              value={formData.intereses}
              onChange={handleChange}
              placeholder="Ej: Matemáticas, Programación, Deportes"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-800 mb-2">
              Breve descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth resize-none"
            />
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Crear Cuenta
          </button>
        </form>

        {/* Enlace a login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
