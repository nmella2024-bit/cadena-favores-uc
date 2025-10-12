import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FavorCard from '../FavorCard';
import { AuthContext } from '../../context/AuthContext';

const favor = {
  id: 99,
  titulo: 'Refuerzo de matematicas',
  descripcion: 'Busco apoyo para preparar el control de algebra lineal con ejercicios resueltos y tips.',
  categoria: 'academico',
  solicitante: 'Ana Perez',
  solicitanteId: 1,
  disponibilidad: 'Fines de semana',
  fecha: '2025-10-10',
  estado: 'activo',
};

describe('FavorCard', () => {
  it('renders key information and primary CTA for helpers', () => {
    const respondToFavor = vi.fn();
    const deleteFavor = vi.fn();
    const authValue = {
      currentUser: { id: 2, nombre: 'Luis Test' },
      respondToFavor,
      deleteFavor,
    };

    const originalConfirm = window.confirm || (() => true);
    const originalAlert = window.alert || (() => {});
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

    cta.click();
    expect(respondToFavor).toHaveBeenCalledWith(favor.id);

    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });
});
