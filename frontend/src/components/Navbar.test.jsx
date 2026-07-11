import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('muestra el título de la aplicación', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Gestión de Eventos')).toBeInTheDocument();
  });

  it('muestra los links de navegación', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Participantes')).toBeInTheDocument();
  });
});