import { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Database, Check, X, Loader2 } from 'lucide-react';

/**
 * Componente para migrar materiales existentes agregando el campo carpetaId
 * Solo accesible para usuarios con rol 'exclusivo'
 */
const MigrarMaterialesExistentes = () => {
  const { currentUser } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ total: 0, migrated: 0, skipped: 0 });

  const addProgress = (message, type = 'info') => {
    setProgress(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const migrarMateriales = async () => {
    setIsMigrating(true);
    setProgress([]);
    setError('');
    setIsComplete(false);
    setStats({ total: 0, migrated: 0, skipped: 0 });

    try {
      addProgress('🚀 Iniciando migración de materiales...', 'info');

      // Obtener todos los materiales
      const materialesRef = collection(db, 'material');
      const querySnapshot = await getDocs(materialesRef);

      const total = querySnapshot.size;
      let migrated = 0;
      let skipped = 0;

      addProgress(`📊 Encontrados ${total} materiales`, 'info');

      // Procesar cada material
      for (const docSnapshot of querySnapshot.docs) {
        const materialData = docSnapshot.data();

        // Si ya tiene carpetaId, saltar
        if (materialData.hasOwnProperty('carpetaId')) {
          skipped++;
          addProgress(`⏭️  Saltando "${materialData.titulo}" (ya tiene carpetaId)`, 'info');
          continue;
        }

        // Agregar carpetaId: null (significa que está en la raíz)
        const materialRef = doc(db, 'material', docSnapshot.id);
        await updateDoc(materialRef, {
          carpetaId: null
        });

        migrated++;
        addProgress(`✓ Migrado: ${materialData.titulo}`, 'success');
      }

      setStats({ total, migrated, skipped });
      addProgress(`\n✅ Migración completada!`, 'success');
      addProgress(`   Total: ${total} materiales`, 'info');
      addProgress(`   Migrados: ${migrated}`, 'success');
      addProgress(`   Saltados: ${skipped}`, 'info');
      setIsComplete(true);

    } catch (err) {
      console.error('Error al migrar materiales:', err);
      setError(err.message || 'Error desconocido al migrar');
      addProgress(`❌ Error: ${err.message}`, 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  // Solo mostrar para usuarios exclusivos o admins
  if (!currentUser || (currentUser.rol !== 'exclusivo' && currentUser.rol !== 'admin')) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Migrar Materiales Existentes
            </h2>
            <p className="text-text-muted">
              Agrega el campo carpetaId a todos los materiales existentes
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Importante:</strong> Esta operación agrega el campo <code>carpetaId: null</code>
            a todos los materiales que no lo tienen. Los materiales quedarán en la raíz de Material.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        {!isMigrating && !isComplete && (
          <button
            onClick={migrarMateriales}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-5 h-5" />
            Iniciar Migración
          </button>
        )}

        {isMigrating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-text-muted">Migrando materiales...</span>
          </div>
        )}

        {isComplete && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <Check className="w-5 h-5" />
              ¡Migración completada!
            </div>
            <div className="text-green-600 text-sm space-y-1">
              <p>Total de materiales: {stats.total}</p>
              <p>Migrados: {stats.migrated}</p>
              <p>Saltados (ya tenían carpetaId): {stats.skipped}</p>
            </div>
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
                  <span className="whitespace-pre-wrap">{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrarMaterialesExistentes;
