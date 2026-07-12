import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Eventos from './Eventos';
import api from '../services/api';

// Simulamos (mock) el módulo de la API para no depender del backend real
vi.mock('../services/api');

describe('Eventos - Prueba de integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga y muestra la lista de eventos desde la API', async () => {
    // Simulamos la respuesta del backend
    api.get.mockImplementation((url) => {
      if (url === '/eventos') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Feria de Ciencias', descripcion: 'Exposición', fecha: '2026-10-10', lugar: 'Auditorio', cupo_maximo: 30 }
          ]
        });
      }
      if (url === '/participantes') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<Eventos />);

    // Verifica que aparezca el evento cargado desde la API simulada
    await waitFor(() => {
      expect(screen.getByText('Feria de Ciencias')).toBeInTheDocument();
    });

    // Confirma que efectivamente se llamó al endpoint correcto
    expect(api.get).toHaveBeenCalledWith('/eventos');
  });

  it('muestra un mensaje cuando no hay eventos registrados', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Eventos />);

    await waitFor(() => {
      expect(screen.getByText('No hay eventos registrados aún.')).toBeInTheDocument();
    });
  });
});

describe('Eventos - Prueba funcional', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite al usuario registrar un nuevo evento mediante el formulario', async () => {
    const usuario = userEvent.setup();

    // Al inicio no hay eventos
    api.get.mockResolvedValue({ data: [] });
    // Simulamos que el POST se guarda correctamente
    api.post.mockResolvedValue({
      data: { id: 1, nombre: 'Torneo de Fútbol', descripcion: '', fecha: '2026-11-01', lugar: 'Losa', cupo_maximo: 20 }
    });

    render(<Eventos />);

    await waitFor(() => {
      expect(screen.getByText('No hay eventos registrados aún.')).toBeInTheDocument();
    });

    // El usuario llena el formulario
    await usuario.type(screen.getByPlaceholderText('Nombre'), 'Torneo de Fútbol');
    await usuario.type(screen.getByPlaceholderText('Lugar'), 'Losa');

    const inputFecha = document.querySelector('input[name="fecha"]');
    await usuario.type(inputFecha, '2026-11-01');

    // El usuario da clic en "Registrar evento"
    await usuario.click(screen.getByText('Registrar evento'));

    // Verifica que se haya llamado correctamente al POST con los datos ingresados
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/eventos', expect.objectContaining({
        nombre: 'Torneo de Fútbol',
        lugar: 'Losa'
      }));
    });
  });
});