import { screen } from '@testing-library/react';
import Home from '../Home';
import { renderWithProviders } from '../../test-utils/renderWithProviders.jsx';

describe('Home page', () => {
  it('renders hero heading and primary actions for guest users', () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /conecta, enseña y aprende dentro de la comunidad uc/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /crear cuenta uc/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorar favores/i })).toBeInTheDocument();
  });
});
