import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
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

    try {
      login(formData.correo, formData.password);
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-uc-blue to-uc-blue-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-uc-blue mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">Bienvenido de vuelta a Red UC</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo UC
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              required
              value={formData.correo}
              onChange={handleChange}
              placeholder="tunombre@uc.cl"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-transparent transition-smooth"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-transparent transition-smooth"
            />
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="w-full py-3 bg-uc-blue text-white rounded-lg font-semibold hover:bg-uc-blue-dark transition-smooth shadow-lg"
          >
            Ingresar
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-uc-blue font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold">Demo:</span> Usa{' '}
            <code className="bg-white px-2 py-1 rounded">mgonzalez@uc.cl</code> /
            <code className="bg-white px-2 py-1 rounded">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
