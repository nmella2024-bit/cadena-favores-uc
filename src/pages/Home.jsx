import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Users, GraduationCap, HeartHandshake, Heart, ShoppingBag, Calendar, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import Feed from '../components/Feed';

const highlights = [
  {
    title: 'Clases entre pares',
    description: 'Conecta con tutores y tutoras de la UC para reforzar tus cursos.',
    icon: GraduationCap,
  },
  {
    title: 'Favores solidarios',
    description: 'Pide o entrega apoyo académico, logístico y emocional cuando más lo necesites.',
    icon: HeartHandshake,
  },
  {
    title: 'Comunidad activa',
    description: 'Más de 200 estudiantes colaborando en proyectos y actividades estudiantiles.',
    icon: Users,
  },
];

const steps = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    description: 'Regístrate con tu correo UC para validar tu pertenencia a la comunidad.',
  },
  {
    number: '02',
    title: 'Publica o busca',
    description: 'Describe el favor que necesitas o explora cómo puedes ayudar a otras personas.',
  },
  {
    number: '03',
    title: 'Conecta y colabora',
    description: 'Coordina directamente con quien te ofrece ayuda y mantengan la comunicación clara.',
  },
];

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Acciones rápidas disponibles
  const accionesRapidas = [
    {
      id: 'pedir-favor',
      titulo: 'Pedir favor',
      subtitulo: 'Recibe ayuda',
      icon: Heart,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      ruta: '/favores',
      requireAuth: false
    },
    {
      id: 'vender-algo',
      titulo: 'Vender algo',
      subtitulo: 'Marketplace',
      icon: ShoppingBag,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      ruta: '/marketplace',
      requireAuth: false
    },
    {
      id: 'crear-anuncio',
      titulo: 'Crear anuncio',
      subtitulo: 'Eventos',
      icon: Calendar,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      ruta: '/anuncios',
      requireAuth: false
    },
    {
      id: 'compartir-material',
      titulo: 'Compartir material',
      subtitulo: 'Apuntes',
      icon: BookOpen,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      ruta: '/material',
      requireAuth: false
    }
  ];

  const handleAccionClick = (accion) => {
    if (accion.requireAuth && !currentUser) {
      navigate('/login');
    } else {
      navigate(accion.ruta);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-20 sm:space-y-24">
      <section className="bg-card/80 py-12 sm:py-16 md:py-24 w-full">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-card/70 dark:bg-card/50 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-text-muted shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            Red social universitaria
          </span>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Conecta, enseña y aprende dentro de la comunidad UC
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-text-muted">
            NexU+ es un puente entre estudiantes que quieren pedir un favor y quienes pueden ofrecer ayuda.
            Comparte conocimiento, apoya proyectos y fortalece tus redes con empatía.
          </p>
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col justify-center gap-2 sm:gap-3 md:gap-4">
            <PrimaryButton as={Link} to={currentUser ? '/publicar' : '/registro'}>
              {currentUser ? 'Publicar un favor' : 'Crear cuenta UC'}
            </PrimaryButton>
            <GhostButton as={Link} to="/favores">
              Explorar favores
            </GhostButton>
          </div>
        </div>
      </section>

      {/* Sección de Acciones Rápidas */}
      {currentUser && (
        <section className="w-full">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card dark:bg-card/80 p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Acciones rápidas</h2>
              <button
                onClick={() => {/* Aquí se puede agregar funcionalidad para más acciones */}}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-background transition-colors"
                aria-label="Más acciones"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
              {accionesRapidas.map((accion) => {
                const Icon = accion.icon;
                return (
                  <button
                    key={accion.id}
                    onClick={() => handleAccionClick(accion)}
                    className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-xl border border-border bg-background hover:bg-card hover:border-brand/30 transition-all duration-200 hover:shadow-sm min-h-[100px] sm:min-h-[120px]"
                  >
                    <div className={`${accion.iconBg} ${accion.iconColor} p-2 sm:p-2.5 md:p-3 rounded-full mb-1.5 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-text-primary mb-0.5 text-center line-clamp-2">
                      {accion.titulo}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-text-muted text-center line-clamp-1">
                      {accion.subtitulo}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </section>
      )}

      {/* Feed de actividad reciente para usuarios logueados */}
      {currentUser && (
        <section className="w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Actividad reciente</h2>
            <p className="mt-2 text-lg text-text-muted">
              Explora lo último en favores, anuncios, marketplace y material académico
            </p>
          </div>
          <Feed />
          </div>
        </section>
      )}

      <section className="w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">¿Cómo funciona?</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-text-muted">
            Publicar un favor es sencillo y recibir ayuda lo es aún más. Solo necesitas seguir estos pasos.
          </p>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-border bg-card dark:bg-card/80 p-4 sm:p-6 md:p-8 text-left shadow-sm transition hover:shadow-card"
            >
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
                {step.number}
              </span>
              <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-card/60 py-12 sm:py-16 w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Hecho por y para estudiantes</h2>
            <p className="mt-4 text-lg text-text-muted">
              Explora las principales formas en que la red ya está transformando la experiencia estudiantil.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-2xl border border-border bg-card dark:bg-card/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand))]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {!currentUser && (
        <section className="w-full">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-border bg-card dark:bg-card/80 p-6 sm:p-10 shadow-card">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Lista o listo para sumarte?</h2>
            <p className="mt-4 text-lg text-text-muted">
              Regístrate en segundos con tu correo UC y comienza a pedir y ofrecer ayuda con confianza.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton as={Link} to="/registro">
                Crear cuenta gratis
              </PrimaryButton>
              <GhostButton as={Link} to="/login">
                Ya tengo cuenta
              </GhostButton>
            </div>
          </div>
          </div>
        </section>
      )}
      </div>
    </div>
  );
};

export default Home;
