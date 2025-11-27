import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Phone, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';
import PrimaryButton from './ui/PrimaryButton';

const AgendarClaseModal = ({ isOpen, onClose, profesor }) => {
    if (!profesor) return null;

    const whatsappLink = `https://wa.me/${profesor.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${profesor.nombre}, vi tu perfil de profesor en NexU+ y me gustaría agendar una clase de ${profesor.ramos[0]}.`)}`;

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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                <div className="flex justify-between items-start mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-text-primary">
                                        Agendar Clase
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-brand/20 mb-4">
                                        {profesor.fotoPerfil ? (
                                            <img src={profesor.fotoPerfil} alt={profesor.nombre} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold">
                                                {profesor.nombre.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-bold text-text-primary">{profesor.nombre}</h4>
                                    <p className="text-sm text-text-muted">{profesor.carrera}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-xl bg-brand/5 p-4 border border-brand/10">
                                        <h5 className="font-semibold text-brand mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Pasos para agendar
                                        </h5>
                                        <ol className="list-decimal list-inside text-sm text-text-muted space-y-1 ml-1">
                                            <li>Contacta al profesor por WhatsApp</li>
                                            <li>Acuerda el día y la hora</li>
                                            <li>Coordina el pago directamente</li>
                                        </ol>
                                    </div>

                                    <div className="pt-2">
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-white font-semibold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-500/20"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            Contactar por WhatsApp
                                        </a>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-text-muted">
                                            Al contactar, aceptas coordinar la clase directamente con el profesor.
                                        </p>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AgendarClaseModal;
