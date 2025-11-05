import { useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Bug, Check, X, AlertCircle } from 'lucide-react';

/**
 * Componente de diagnóstico para verificar el estado de Firestore
 */
const DiagnosticoMaterial = () => {
  const { currentUser } = useAuth();
  const [diagnostico, setDiagnostico] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState(null);

  const addTest = (name, status, message) => {
    setDiagnostico(prev => [...prev, { name, status, message }]);
  };

  const ejecutarDiagnostico = async () => {
    setIsRunning(true);
    setDiagnostico([]);
    setSummary(null);

    const results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };

    try {
      // Test 1: Autenticación
      addTest('Autenticación', 'running', 'Verificando usuario...');
      if (currentUser) {
        addTest('Autenticación', 'success', `Usuario autenticado: ${currentUser.email}`);
        results.passed++;
      } else {
        addTest('Autenticación', 'error', 'No hay usuario autenticado');
        results.failed++;
      }

      // Test 2: Conectividad a Firestore
      addTest('Firestore', 'running', 'Verificando conexión...');
      try {
        await getDocs(query(collection(db, 'usuarios'), limit(1)));
        addTest('Firestore', 'success', 'Conexión a Firestore exitosa');
        results.passed++;
      } catch (err) {
        addTest('Firestore', 'error', `Error de conexión: ${err.message}`);
        results.failed++;
      }

      // Test 3: Colección de folders
      addTest('Colección folders', 'running', 'Verificando carpetas...');
      try {
        const foldersSnap = await getDocs(collection(db, 'folders'));
        if (foldersSnap.empty) {
          addTest('Colección folders', 'warning', 'No hay carpetas creadas (ejecuta /admin/seed-folders)');
          results.warnings++;
        } else {
          addTest('Colección folders', 'success', `Encontradas ${foldersSnap.size} carpetas`);
          results.passed++;
        }
      } catch (err) {
        addTest('Colección folders', 'error', `Error al leer carpetas: ${err.message}`);
        results.failed++;
      }

      // Test 4: Colección de material
      addTest('Colección material', 'running', 'Verificando materiales...');
      try {
        const materialSnap = await getDocs(query(collection(db, 'material'), limit(5)));
        if (materialSnap.empty) {
          addTest('Colección material', 'warning', 'No hay materiales en la base de datos');
          results.warnings++;
        } else {
          const firstDoc = materialSnap.docs[0];
          const hascarpetaId = firstDoc.data().hasOwnProperty('carpetaId');

          if (hascarpetaId) {
            addTest('Colección material', 'success', `Encontrados ${materialSnap.size} materiales con carpetaId`);
            results.passed++;
          } else {
            addTest('Colección material', 'warning', `Materiales sin carpetaId (ejecuta /admin/migrar-materiales)`);
            results.warnings++;
          }
        }
      } catch (err) {
        addTest('Colección material', 'error', `Error al leer materiales: ${err.message}`);
        results.failed++;
      }

      // Test 5: Reglas de seguridad
      addTest('Reglas de seguridad', 'running', 'Verificando permisos...');
      try {
        if (currentUser) {
          // Intentar leer la colección folders
          await getDocs(query(collection(db, 'folders'), limit(1)));
          addTest('Reglas de seguridad', 'success', 'Permisos de lectura correctos');
          results.passed++;
        } else {
          addTest('Reglas de seguridad', 'warning', 'No se puede verificar (no hay usuario)');
          results.warnings++;
        }
      } catch (err) {
        if (err.code === 'permission-denied') {
          addTest('Reglas de seguridad', 'error', 'Permisos insuficientes. Actualiza las reglas en Firebase Console');
          results.failed++;
        } else {
          addTest('Reglas de seguridad', 'error', `Error: ${err.message}`);
          results.failed++;
        }
      }

      setSummary(results);

    } catch (err) {
      addTest('General', 'error', `Error inesperado: ${err.message}`);
      results.failed++;
      setSummary(results);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <Bug className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Diagnóstico de Material
            </h2>
            <p className="text-text-muted">
              Verifica el estado de Firestore y las colecciones
            </p>
          </div>
        </div>

        <button
          onClick={ejecutarDiagnostico}
          disabled={isRunning}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
        >
          <Bug className="w-5 h-5" />
          {isRunning ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico'}
        </button>

        {diagnostico.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary mb-3">Resultados:</h3>

            {diagnostico.map((test, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold">{test.name}</h4>
                    <p className="text-sm mt-1">{test.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {summary && (
          <div className="mt-6 bg-background border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-3">Resumen:</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-green-700">Exitosos</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                <div className="text-sm text-yellow-700">Advertencias</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-red-700">Errores</div>
              </div>
            </div>

            {summary.failed > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-semibold mb-2">
                  Acciones recomendadas:
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  <li>Actualiza las reglas de Firestore según INSTRUCCIONES_CREAR_CARPETAS.md</li>
                  <li>Ejecuta /admin/migrar-materiales si tienes materiales sin carpetaId</li>
                  <li>Ejecuta /admin/seed-folders para crear la estructura de carpetas</li>
                  <li>Verifica que estés autenticado con un usuario válido</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticoMaterial;
