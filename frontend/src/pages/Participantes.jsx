import { useState, useEffect } from 'react';
import api from '../services/api';

function Participantes() {
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    codigo: ''
  });

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const cargarParticipantes = async () => {
    try {
      const res = await api.get('/participantes');
      setParticipantes(res.data);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/participantes', formulario);
      setFormulario({ nombre: '', correo: '', codigo: '' });
      cargarParticipantes();
    } catch (error) {
      console.error('Error al registrar participante:', error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/participantes/${id}`);
      cargarParticipantes();
    } catch (error) {
      console.error('Error al eliminar participante:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Participantes</h2>

      {/* Formulario para registrar participante */}
      <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded">
        <h5>Registrar nuevo participante</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <input type="text" name="nombre" className="form-control" placeholder="Nombre completo" value={formulario.nombre} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <input type="email" name="correo" className="form-control" placeholder="Correo electrónico" value={formulario.correo} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <input type="text" name="codigo" className="form-control" placeholder="Código de estudiante" value={formulario.codigo} onChange={handleChange} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Registrar participante</button>
      </form>

      {/* Listado de participantes */}
      {cargando ? (
        <p>Cargando participantes...</p>
      ) : participantes.length === 0 ? (
        <p>No hay participantes registrados aún.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Código</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.correo}</td>
                <td>{p.codigo}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Participantes;