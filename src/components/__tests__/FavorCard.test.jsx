import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FavorCard from '../FavorCard';
import { AuthContext } from '../../context/AuthContext';
import * as favorService from '../../services/favorService';

// Mock del servicio
vi.mock('../../services/favorService', () => ({
  ofrecerAyuda: vi.fn(),
  eliminarFavor: vi.fn(),
  finalizarFavor: vi.fn(),
}));

// Mock de userService
vi.mock('../../services/userService', () => ({
  getUserData: vi.fn().mockResolvedValue({ nombre: 'Ana Perez', rol: 'normal' }),
}));

const favor = {
  id: 99,
  titulo: 'Refuerzo de matematicas',
  descripcion: 'Busco apoyo para preparar el control de algebra lineal con ejercicios resueltos y tips.',
  categoria: 'academico',
  solicitante: 'Ana Perez',
  usuarioId: 1,
  disponibilidad: 'Fines de semana',
  fecha: '2025-10-10',
  estado: 'activo',
};

describe('FavorCard', () => {
  it('renders key information and primary CTA for helpers', async () => {
    const authValue = {
      currentUser: { uid: 2, id: 2, nombre: 'Luis Test', telefono: '+56912345678' },
      firebaseUser: { uid: 2 },
    };

    const originalConfirm = window.confirm;
    const originalAlert = window.alert;
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <FavorCard favor={favor} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('favor-title')).toHaveTextContent('Refuerzo de matematicas');
    expect(screen.getByTestId('favor-category')).toBeInTheDocument();

    const cta = screen.getByTestId('cta-offer');
    expect(cta).toBeInTheDocument();

    fireEvent.click(cta);

    await waitFor(() => {
      expect(favorService.ofrecerAyuda).toHaveBeenCalledWith(favor.id, authValue.currentUser);
    });

    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });
});
