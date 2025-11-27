import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2, GraduationCap, BookOpen, DollarSign, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registrarProfesor } from '../services/profesorService';
import PrimaryButton from './ui/PrimaryButton';
import TextField from './ui/TextField';
import TextareaField from './ui/TextareaField';
import SelectField from './ui/SelectField';
import { CARRERAS_UC } from '../data/carreras';

const RegistroProfesorModal = ({ isOpen, onClose, onRegistroExitoso }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        carrera: currentUser?.carrera || '',
        anio: currentUser?.año || '',
        ramos: '', // String separado por comas para simplificar
        modalidad: [],
        precio: '',
        descripcion: '',
        telefono: currentUser?.telefono || '',
        disponibilidad: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleModalidadChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, modalidad: [...prev.modalidad, value] };
            } else {
                return { ...prev, modalidad: prev.modalidad.filter(m => m !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.modalidad.length === 0) {
            setError('Debes seleccionar al menos una modalidad');
            return;
        }

        if (!formData.ramos.trim()) {
            setError('Debes ingresar al menos un ramo');
            return;
        }

        setLoading(true);

        try {
            const ramosArray = formData.ramos.split(',').map(r => r.trim()).filter(r => r);

            const datosProfesor = {
                ...formData,
                ramos: ramosArray,
                precio: parseInt(formData.precio),
                anio: parseInt(formData.anio)
            };

            await registrarProfesor(datosProfesor, currentUser);
            onRegistroExitoso();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al registrar profesor');
        } finally {
            setLoading(false);
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-text-primary">
                                        Hacerse Profesor
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            label="Carrera"
                                            name="carrera"
                                            value={formData.carrera}
                                            onChange={handleChange}
                                            required
                                            icon={GraduationCap}
                                        >
                                            <option value="">Selecciona...</option>
                                            {CARRERAS_UC.map(c => <option key={c} value={c}>{c}</option>)}
                                        </SelectField>

                                        <SelectField
                                            label="Año"
                                            name="anio"
                                            value={formData.anio}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecciona...</option>
                                            {[1, 2, 3, 4, 5, 6, 7].map(a => <option key={a} value={a}>{a}º Año</option>)}
                                        </SelectField>
                                    </div>

                                    <TextField
                                        label="Ramos que enseñas (separados por coma)"
                                        name="ramos"
                                        value={formData.ramos}
                                        onChange={handleChange}
                                        placeholder="Ej: Cálculo I, Física, Química"
                                        required
                                        icon={BookOpen}
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-primary">Modalidad</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value="online"
                                                    checked={formData.modalidad.includes('online')}
                                                    onChange={handleModalidadChange}
                                                    className="rounded border-border text-brand focus:ring-brand"
                                                />
                                                Online
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value="presencial"
                                                    checked={formData.modalidad.includes('presencial')}
                                                    onChange={handleModalidadChange}
                                                    className="rounded border-border text-brand focus:ring-brand"
                                                />
                                                Presencial
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <TextField
                                            label="Precio por hora ($)"
                                            name="precio"
                                            type="number"
                                            value={formData.precio}
                                            onChange={handleChange}
                                            placeholder="Ej: 15000"
                                            required
                                            icon={DollarSign}
                                            min="0"
                                        />

                                        <TextField
                                            label="Teléfono / WhatsApp"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="+569..."
                                            required
                                            icon={Phone}
                                        />
                                    </div>

                                    <TextareaField
                                        label="Descripción"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        placeholder="Cuéntanos sobre tu experiencia y metodología..."
                                        required
                                        maxLength={300}
                                        rows={3}
                                    />

                                    <TextField
                                        label="Disponibilidad (Opcional)"
                                        name="disponibilidad"
                                        value={formData.disponibilidad}
                                        onChange={handleChange}
                                        placeholder="Ej: Lunes y Miércoles PM"
                                    />

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-card/80 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <PrimaryButton type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Registrando...
                                                </>
                                            ) : (
                                                'Confirmar registro'
                                            )}
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

export default RegistroProfesorModal;
