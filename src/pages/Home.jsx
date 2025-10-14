import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, GraduationCap, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';

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

  return (
    <div className="space-y-20 sm:space-y-24">
      <section className="bg-card/80 py-16 sm:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 dark:bg-card/50 px-4 py-1 text-sm font-medium text-text-muted shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Red universitaria de favores
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Conecta, enseña y aprende dentro de la comunidad UC
          </h1>
          <p className="mt-4 text-lg text-text-muted">
            Red UC es un puente entre estudiantes que quieren pedir un favor y quienes pueden ofrecer ayuda.
            Comparte conocimiento, apoya proyectos y fortalece tus redes con empatía.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryButton as={Link} to={currentUser ? '/publicar' : '/registro'}>
              {currentUser ? 'Publicar un favor' : 'Crear cuenta UC'}
            </PrimaryButton>
            <GhostButton as={Link} to="/favores">
              Explorar favores
            </GhostButton>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Cómo funciona?</h2>
          <p className="mt-4 text-lg text-text-muted">
            Publicar un favor es sencillo y recibir ayuda lo es aún más. Solo necesitas seguir estos pasos.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-border bg-card dark:bg-card/80 p-8 text-left shadow-sm transition hover:shadow-card"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card/60 py-12 sm:py-16">
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
        <section className="container mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-border bg-card dark:bg-card/80 p-10 shadow-card">
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
        </section>
      )}
    </div>
  );
};

export default Home;
