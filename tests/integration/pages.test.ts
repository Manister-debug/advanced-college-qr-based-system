import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/pages/index';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock a component
jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar Mock</div>,
}));

describe('Home Page', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/',
    });
  });

  it('renders the homepage correctly', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
  });

  it('navigates to about page on button click', () => {
    render(<HomePage />);
    
    const button = screen.getByRole('button', { name: /learn more/i });
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/about');
  });

  it('displays featured products', async () => {
    // Mock fetch for products
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, name: 'Product 1', price: 99.99 },
          { id: 2, name: 'Product 2', price: 149.99 },
        ]),
      })
    ) as jest.Mock;

    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('handles search functionality', () => {
    render(<HomePage />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(searchInput).toHaveValue('test query');
  });
});
