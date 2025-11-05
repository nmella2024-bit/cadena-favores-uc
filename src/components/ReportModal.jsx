import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  crearReporte,
  REPORT_TYPES,
  getReportTypeLabel,
  getContentTypeLabel,
} from '../services/reportService';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';

const ReportModal = ({ isOpen, onClose, contentType, contentId, contentTitle = '', contentAuthorId = '' }) => {
  const { currentUser } = useAuth();
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportType) {
      setError('Por favor selecciona un motivo de reporte');
      return;
    }

    if (!currentUser) {
      setError('Debes estar logueado para reportar contenido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await crearReporte({
        contentType,
        contentId,
        reportType,
        description,
        reporterId: currentUser.uid,
        reporterName: currentUser.nombre || 'Usuario',
        contentAuthorId,
        contentTitle,
      });

      setSuccess(true);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Error al crear reporte:', err);
      setError(err.message || 'Error al enviar el reporte. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportType('');
    setDescription('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Reportar contenido
              </h2>
              <p className="text-sm text-text-muted">
                {getContentTypeLabel(contentType)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-canvas rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Reporte enviado
              </h3>
              <p className="text-sm text-text-muted">
                Gracias por ayudarnos a mantener la comunidad segura. Revisaremos tu reporte pronto.
              </p>
            </div>
          ) : (
            <>
              {contentTitle && (
                <div className="p-3 bg-canvas rounded-lg">
                  <p className="text-sm text-text-muted">Reportando:</p>
                  <p className="text-sm font-medium text-text-primary line-clamp-2">
                    {contentTitle}
                  </p>
                </div>
              )}

              {/* Tipo de reporte */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Motivo del reporte <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {Object.values(REPORT_TYPES).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        reportType === type
                          ? 'border-brand bg-brand/5'
                          : 'border-border hover:border-brand/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={type}
                        checked={reportType === type}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-3"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-text-primary">
                        {getReportTypeLabel(type)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descripción adicional */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                  Descripción adicional (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Proporciona más detalles sobre el problema..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-text-muted mt-1">
                  {description.length}/500 caracteres
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Nota importante */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  <strong>Nota:</strong> Los reportes falsos o abusivos pueden resultar en la suspensión de tu cuenta.
                  Solo reporta contenido que viole las normas de la comunidad.
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          {!success && (
            <div className="flex gap-3">
              <GhostButton
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </GhostButton>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || !reportType}
                className="flex-1"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
              </PrimaryButton>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
