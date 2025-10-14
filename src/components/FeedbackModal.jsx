import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { enviarFeedback } from '../services/feedbackService';
import PrimaryButton from './ui/PrimaryButton';
import TextareaField from './ui/TextareaField';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!mensaje.trim()) {
      setError('Por favor escribe un mensaje');
      return;
    }

    setEnviando(true);

    try {
      await enviarFeedback({
        mensaje: mensaje.trim(),
        nombre: currentUser?.nombre || 'Anónimo',
        email: currentUser?.email || '',
        usuarioId: currentUser?.uid || null,
      });

      setExito(true);
      setMensaje('');
      setTimeout(() => {
        onClose();
        setExito(false);
      }, 2000);
    } catch (err) {
      setError('Error al enviar el feedback. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold text-text-primary">
                    Danos tu feedback
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-text-muted mb-4">
                  Tu opinión es muy importante para nosotros. Cuéntanos qué te parece Red UC y cómo podemos mejorar.
                </p>

                {exito && (
                  <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
                    ¡Gracias por tu feedback! Lo hemos recibido correctamente.
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TextareaField
                    id="mensaje"
                    name="mensaje"
                    label="Tu mensaje"
                    placeholder="Cuéntanos tu experiencia, sugerencias o reporta un problema..."
                    rows={6}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-card/90 hover:text-text-primary"
                    >
                      Cancelar
                    </button>
                    <PrimaryButton
                      type="submit"
                      disabled={enviando}
                      className="flex-1 justify-center"
                    >
                      {enviando ? 'Enviando...' : 'Enviar'}
                    </PrimaryButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FeedbackModal;
