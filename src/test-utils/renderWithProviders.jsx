import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import { mockFavors, mockUsers } from '../data/mockData';

const noop = () => {};

export const renderWithProviders = (ui, { route = '/', authValue = {} } = {}) => {
  const value = {
    currentUser: null,
    users: mockUsers,
    favors: mockFavors,
    register: noop,
    login: noop,
    logout: noop,
    publishFavor: noop,
    respondToFavor: noop,
    deleteFavor: noop,
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
};
