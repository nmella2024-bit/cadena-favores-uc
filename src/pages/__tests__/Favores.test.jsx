import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Favores from '../Favores';
import { renderWithProviders } from '../../test-utils/renderWithProviders.jsx';

describe('Favores page', () => {
  it('shows skeleton placeholders during loading', async () => {
    renderWithProviders(<Favores />);

    const skeletons = await screen.findAllByTestId('favor-skeleton');
    expect(skeletons).toHaveLength(6);
  });

  it('displays empty state when no favors match filters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Favores />);

    const searchInput = await screen.findByLabelText(/buscar/i);
    await user.clear(searchInput);
    await user.type(searchInput, 'zzzzzz');

    await waitFor(() => expect(screen.getByText(/no encontramos favores/i)).toBeInTheDocument());
  });
});
