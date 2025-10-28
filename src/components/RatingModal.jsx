import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Star, Loader2 } from 'lucide-react';
import { calificarUsuario } from '../services/ratingService';

const RatingModal = ({ isOpen, onClose, ayudanteId, ayudanteNombre, onRatingComplete }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await calificarUsuario(ayudanteId, rating, comentario);

      alert('¡Calificación enviada exitosamente!');
      onRatingComplete();
      onClose();
    } catch (err) {
      console.error('Error al calificar:', err);
      setError(err.message || 'Error al enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setHoverRating(0);
      setComentario('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-[var(--bg-secondary)] rounded-lg shadow-xl border border-[var(--border-color)]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">
              Calificar a {ayudanteNombre}
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Rating stars */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                ¿Cómo fue tu experiencia?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                  {rating === 1 && 'Muy mala'}
                  {rating === 2 && 'Mala'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Buena'}
                  {rating === 5 && 'Excelente'}
                </p>
              )}
            </div>

            {/* Comentario opcional */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Cuéntanos más sobre tu experiencia..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {comentario.length}/500 caracteres
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar calificación'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RatingModal;
