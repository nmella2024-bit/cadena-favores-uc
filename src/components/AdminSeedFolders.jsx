import { useState } from 'react';
import { crearCarpeta } from '../services/folderService';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Check, X, Loader2 } from 'lucide-react';

/**
 * Componente de administración para crear la estructura de carpetas
 * Solo accesible para usuarios con rol 'exclusivo'
 */
const AdminSeedFolders = () => {
  const { currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const addProgress = (message, type = 'info') => {
    setProgress(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const crearEstructuraCompleta = async () => {
    setIsCreating(true);
    setProgress([]);
    setError('');
    setIsComplete(false);

    try {
      addProgress('🚀 Iniciando creación de estructura de carpetas...', 'info');

      // 1° Semestre
      addProgress('📁 Creando estructura de 1° Semestre...', 'info');
      const primerSemestre = await crearCarpeta({
        nombre: '1° Semestre',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ 1° Semestre creado', 'success');

      // Nivelación Cálculo
      await crearCarpeta({
        nombre: 'Nivelación Cálculo',
        carpetaPadreId: primerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Nivelación Cálculo', 'success');

      // Química para Ingeniería
      const quimica = await crearCarpeta({
        nombre: 'Química para Ingeniería (QIM100E)',
        carpetaPadreId: primerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Química para Ingeniería', 'success');

      await crearCarpeta({
        nombre: 'Pruebas anteriores',
        carpetaPadreId: quimica,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      const quimicaTaller = await crearCarpeta({
        nombre: 'Taller',
        carpetaPadreId: quimica,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      for (let i = 1; i <= 5; i++) {
        await crearCarpeta({
          nombre: `T${i}`,
          carpetaPadreId: quimicaTaller,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      await crearCarpeta({
        nombre: 'Otros',
        carpetaPadreId: quimicaTaller,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Clases',
        carpetaPadreId: quimica,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // Cálculo 1
      const calculo1 = await crearCarpeta({
        nombre: 'Cálculo 1 (MAT1610)',
        carpetaPadreId: primerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Cálculo 1', 'success');

      await crearCarpeta({
        nombre: 'Pruebas Anteriores',
        carpetaPadreId: calculo1,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Controles y Guías',
        carpetaPadreId: calculo1,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Libros',
        carpetaPadreId: calculo1,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Ayudantías',
        carpetaPadreId: calculo1,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // Álgebra Lineal
      const algebraLineal = await crearCarpeta({
        nombre: 'Álgebra Lineal (MAT1203)',
        carpetaPadreId: primerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Álgebra Lineal', 'success');

      const algebraPruebas = await crearCarpeta({
        nombre: 'Pruebas Anteriores',
        carpetaPadreId: algebraLineal,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      for (const nombre of ['I1', 'I2', 'I3', 'Examen', 'Ejercicios']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: algebraPruebas,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      await crearCarpeta({
        nombre: 'Apuntes, Libro y Ejercicios',
        carpetaPadreId: algebraLineal,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Catedra',
        carpetaPadreId: algebraLineal,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // 2° Semestre
      addProgress('📁 Creando estructura de 2° Semestre...', 'info');
      const segundoSemestre = await crearCarpeta({
        nombre: '2° Semestre',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ 2° Semestre creado', 'success');

      // Cálculo 2
      const calculo2 = await crearCarpeta({
        nombre: 'Cálculo 2 (MAT1620)',
        carpetaPadreId: segundoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Cálculo 2', 'success');

      await crearCarpeta({
        nombre: 'Materia-Apuntes-Ayudantías',
        carpetaPadreId: calculo2,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      const calculo2Pruebas = await crearCarpeta({
        nombre: 'Pruebas Anteriores',
        carpetaPadreId: calculo2,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      for (const nombre of ['I1', 'I2', 'I3', 'Examen']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: calculo2Pruebas,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Dinámica
      const dinamica = await crearCarpeta({
        nombre: 'Dinámica (FIS1514)',
        carpetaPadreId: segundoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Dinámica', 'success');

      for (const nombre of ['Libro problemas resueltos', 'Apuntes', 'Ayudantías', 'Interrogaciones Anteriores (FIS)', 'Zegard (ICE)', 'Controles']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: dinamica,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Intro a la Economía
      const economia = await crearCarpeta({
        nombre: 'Intro a la Economía (ICS1513)',
        carpetaPadreId: segundoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Intro a la Economía', 'success');

      for (const nombre of ['Juan Sepúlveda', 'Emil Namur', 'Manuel Pérez', 'Miguel Pérez de Arce', 'Romy Álamo-Cristóbal Bisso 2025-1']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: economia,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Intro a la Progra
      const progra = await crearCarpeta({
        nombre: 'Intro a la Progra (IIC1103)',
        carpetaPadreId: segundoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Intro a la Progra', 'success');

      const prograClases = await crearCarpeta({
        nombre: 'Clases Francisca Cattan',
        carpetaPadreId: progra,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      for (let i = 1; i <= 14; i++) {
        await crearCarpeta({
          nombre: `Semana ${i}`,
          carpetaPadreId: prograClases,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      await crearCarpeta({
        nombre: 'Repasos',
        carpetaPadreId: prograClases,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      const jorgeMunoz = await crearCarpeta({
        nombre: 'Jorge Muñoz 2024-2',
        carpetaPadreId: progra,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Clases',
        carpetaPadreId: jorgeMunoz,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Descontinuado',
        carpetaPadreId: progra,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // 3° Semestre
      addProgress('📁 Creando estructura de 3° Semestre...', 'info');
      const tercerSemestre = await crearCarpeta({
        nombre: '3° Semestre',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ 3° Semestre creado', 'success');

      // Cálculo 3
      const calculo3 = await crearCarpeta({
        nombre: 'Cálculo 3 (MAT1630)',
        carpetaPadreId: tercerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Cálculo 3', 'success');

      for (const nombre of ['Libro Guía', 'Compilado Ejercicios', 'Controles', 'Pruebas Anteriores', 'Cátedras', 'Ayudantías']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: calculo3,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // EDO
      const edo = await crearCarpeta({
        nombre: 'EDO (MAT1640)',
        carpetaPadreId: tercerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ EDO', 'success');

      for (const nombre of ['Libro Guía', 'Compilado Ejercicios', 'Pruebas Anteriores', 'Cátedras']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: edo,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Termodinámica
      const termo = await crearCarpeta({
        nombre: 'Termodinámica (FIS1523 y IIQ1003)',
        carpetaPadreId: tercerSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Termodinámica', 'success');

      await crearCarpeta({
        nombre: 'Termo FIS (FIS1523)',
        carpetaPadreId: termo,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Termo QIM (IIQ1003)',
        carpetaPadreId: termo,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // 4° Semestre
      addProgress('📁 Creando estructura de 4° Semestre...', 'info');
      const cuartoSemestre = await crearCarpeta({
        nombre: '4° Semestre',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ 4° Semestre creado', 'success');

      // Proba
      const proba = await crearCarpeta({
        nombre: 'Proba (EYP1113)',
        carpetaPadreId: cuartoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Proba', 'success');

      await crearCarpeta({
        nombre: 'Libro guía',
        carpetaPadreId: proba,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Pruebas anteriores',
        carpetaPadreId: proba,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // Electricidad y Magnetismo
      const electro = await crearCarpeta({
        nombre: 'Electricidad y Magnetismo (FIS1533)',
        carpetaPadreId: cuartoSemestre,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Electricidad y Magnetismo', 'success');

      for (const nombre of ['Libro Guía', 'Pruebas Anteriores', 'Compilado Ejercicios', 'Apuntes Cádiz', 'Ayudantías']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: electro,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Majors
      addProgress('📁 Creando estructura de Majors...', 'info');
      const majors = await crearCarpeta({
        nombre: 'Majors',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Majors creado', 'success');

      for (const nombre of [
        'Transporte y Logística (ICT)',
        'Hidráulica y Ambiental (ICH)',
        'Propiedad y Resistencia de Materiales',
        'Industrial (ICS)',
        'Estructural y Geotecnia',
        'Diseño Gráfico (ICM2313)',
        'Departamento de Ciencias de la Computación',
        'Ing y Gestión de la Construcción',
        'Química y Biológica'
      ]) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: majors,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      const mecanicaFluidos = await crearCarpeta({
        nombre: 'Mecánica de Fluidos (ICH1104)',
        carpetaPadreId: majors,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      for (const nombre of ['I1', 'I2', 'I3', 'Examen', 'Tareas 1-3']) {
        await crearCarpeta({
          nombre,
          carpetaPadreId: mecanicaFluidos,
          autorId: currentUser.uid,
          autorNombre: currentUser.nombre || currentUser.displayName
        });
      }

      // Red apoyo Fundamenta
      addProgress('📁 Creando Red apoyo Fundamenta...', 'info');
      const redApoyo = await crearCarpeta({
        nombre: 'Red apoyo Fundamenta',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });
      addProgress('✓ Red apoyo Fundamenta', 'success');

      const ejerciciosExamenes = await crearCarpeta({
        nombre: 'Ejercicios y Exámenes pasados',
        carpetaPadreId: redApoyo,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Examenes Pasados',
        carpetaPadreId: ejerciciosExamenes,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Ejercicios',
        carpetaPadreId: ejerciciosExamenes,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Resúmenes',
        carpetaPadreId: redApoyo,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Videos + Repasos',
        carpetaPadreId: redApoyo,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      // Otros
      await crearCarpeta({
        nombre: 'Examen de Comunicación Escrita VRA 100C',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      const exploratorios = await crearCarpeta({
        nombre: 'Exploratorios',
        carpetaPadreId: null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      await crearCarpeta({
        nombre: 'Diseño Gráfico en Ingeniería Mecánica',
        carpetaPadreId: exploratorios,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName
      });

      addProgress('✅ ¡Estructura de carpetas creada exitosamente!', 'success');
      setIsComplete(true);
    } catch (err) {
      console.error('Error al crear estructura:', err);
      setError(err.message || 'Error desconocido al crear carpetas');
      addProgress(`❌ Error: ${err.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Solo mostrar para usuarios exclusivos
  if (!currentUser || currentUser.rol !== 'exclusivo') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <FolderPlus className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Crear Estructura de Carpetas
            </h2>
            <p className="text-text-muted">
              Genera la estructura completa de carpetas para el material académico
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        {!isCreating && !isComplete && (
          <button
            onClick={crearEstructuraCompleta}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            Crear Estructura Completa
          </button>
        )}

        {isCreating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <span className="ml-2 text-text-muted">Creando carpetas...</span>
          </div>
        )}

        {progress.length > 0 && (
          <div className="mt-6 bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-text-primary mb-2">Progreso:</h3>
            <div className="space-y-1 font-mono text-sm">
              {progress.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    item.type === 'error'
                      ? 'text-red-600'
                      : item.type === 'success'
                      ? 'text-green-600'
                      : 'text-text-muted'
                  }`}
                >
                  {item.type === 'success' && <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  {item.type === 'error' && <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <span>{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <Check className="w-5 h-5" />
              ¡Estructura creada exitosamente!
            </div>
            <p className="text-green-600 text-sm">
              Puedes navegar a la sección de Material para ver todas las carpetas creadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeedFolders;
