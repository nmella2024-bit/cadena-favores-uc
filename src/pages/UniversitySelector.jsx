import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useUniversity } from '../context/UniversityContext';
import { universityList } from '../config/universities';

const UniversitySelector = () => {
  const navigate = useNavigate();
  const { selectUniversity } = useUniversity();

  const handleSelectUniversity = (universityId) => {
    selectUniversity(universityId);
    navigate('/');
  };

  // Obtener el color brand de cada universidad para mostrar preview
  const getUniversityColor = (uni) => {
    return uni.theme?.light?.brand || '29 78 216';
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-canvas))] flex flex-col">
      {/* Header simple */}
      <header className="w-full py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-slate-600 dark:text-slate-300" />
            <span className="text-2xl font-bold text-text-primary">Nex</span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Selecciona tu universidad
            </h1>
            <p className="text-lg text-text-muted">
              Elige tu casa de estudios para conectar con tu comunidad universitaria
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {universityList.map((uni) => {
              const brandColor = getUniversityColor(uni);
              return (
                <button
                  key={uni.id}
                  onClick={() => handleSelectUniversity(uni.id)}
                  className="group relative w-full rounded-2xl border-2 border-border bg-card p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    '--uni-brand': brandColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `rgb(${brandColor})`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `rgb(${brandColor} / 0.1)` }}
                      >
                        <GraduationCap
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          style={{ color: `rgb(${brandColor})` }}
                        />
                      </div>
                      <div>
                        <h2
                          className="text-xl sm:text-2xl font-bold text-text-primary transition-colors"
                          style={{ '--hover-color': `rgb(${brandColor})` }}
                        >
                          <span className="group-hover:text-[color:var(--hover-color)]">
                            {uni.name}
                          </span>
                        </h2>
                        <p className="text-sm sm:text-base text-text-muted mt-1">
                          {uni.appName} - Red de estudiantes
                        </p>
                      </div>
                    </div>
                    <div
                      className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: `rgb(${brandColor} / 0.1)`,
                      }}
                    >
                      <ArrowRight
                        className="h-5 w-5 transition-colors group-hover:text-white"
                        style={{ color: `rgb(${brandColor})` }}
                      />
                    </div>
                  </div>

                  {/* Barra de color indicativa */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: `rgb(${brandColor})` }}
                  />

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {uni.emailDomains.map((domain) => (
                        <span
                          key={domain}
                          className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-medium text-text-muted"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-sm text-text-muted mt-8">
            Solo puedes acceder con un correo institucional verificado
          </p>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-text-muted">
            Nex - Conectando comunidades universitarias
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UniversitySelector;
