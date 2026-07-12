import { useState, useEffect } from 'react';
import api from '../services/api';

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '', descripcion: '', fecha: '', lugar: '', cupo_maximo: ''
  });

  const [seleccion, setSeleccion] = useState({});
  const [inscritosPorEvento, setInscritosPorEvento] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarEventos();
    cargarParticipantes();
  }, []);

  const cargarEventos = async () => {
    try {
      const res = await api.get('/eventos');
      setEventos(res.data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarParticipantes = async () => {
    try {
      const res = await api.get('/participantes');
      setParticipantes(res.data);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setFormulario({ nombre: '', descripcion: '', fecha: '', lugar: '', cupo_maximo: '' });
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/eventos/${editandoId}`, formulario);
      } else {
        await api.post('/eventos', formulario);
      }
      limpiarFormulario();
      cargarEventos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  const handleEditar = (evento) => {
    setFormulario({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      fecha: evento.fecha,
      lugar: evento.lugar,
      cupo_maximo: evento.cupo_maximo
    });
    setEditandoId(evento.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => limpiarFormulario();

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/eventos/${id}`);
      cargarEventos();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };

  // ---------- INSCRIPCIONES ----------

  const handleSeleccionChange = (eventoId, participanteId) => {
    setSeleccion({ ...seleccion, [eventoId]: participanteId });
  };

  const handleInscribir = async (eventoId) => {
    const participanteId = seleccion[eventoId];
    if (!participanteId) {
      alert('Selecciona un participante primero');
      return;
    }
    try {
      await api.post('/inscripciones', {
        evento_id: eventoId,
        participante_id: parseInt(participanteId)
      });
      alert('Participante inscrito correctamente');
      cargarInscritos(eventoId);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert('Este participante ya está inscrito en este evento.');
      } else {
        console.error('Error al inscribir participante:', error);
        alert('Ocurrió un error al inscribir al participante.');
      }
    }
  };

  const cargarInscritos = async (eventoId) => {
    try {
      const res = await api.get(`/eventos/${eventoId}/inscritos`);
      setInscritosPorEvento({ ...inscritosPorEvento, [eventoId]: res.data });
    } catch (error) {
      console.error('Error al cargar inscritos:', error);
    }
  };

  const handleEliminarInscripcion = async (inscripcionId, eventoId) => {
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      cargarInscritos(eventoId);
    } catch (error) {
      console.error('Error al eliminar inscripción:', error);
    }
  };

  const toggleVerInscritos = (eventoId) => {
    if (inscritosPorEvento[eventoId]) {
      const copia = { ...inscritosPorEvento };
      delete copia[eventoId];
      setInscritosPorEvento(copia);
    } else {
      cargarInscritos(eventoId);
    }
  };
  const eventosFiltrados = eventos.filter((evento) => {
  const texto = busqueda.toLowerCase();
  return (
    evento.nombre.toLowerCase().includes(texto) ||
    evento.lugar.toLowerCase().includes(texto)
  );
});

  return (
    <div className="container mt-4">
      <h2>Eventos</h2>

      <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded">
        <h5>{editandoId ? 'Editar evento' : 'Registrar nuevo evento'}</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <input type="text" name="nombre" className="form-control" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <input type="text" name="lugar" className="form-control" placeholder="Lugar" value={formulario.lugar} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <input type="date" name="fecha" className="form-control" value={formulario.fecha} onChange={handleChange} required />
          </div>
          <div className="col-md-8">
            <input type="text" name="descripcion" className="form-control" placeholder="Descripción" value={formulario.descripcion} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input type="number" name="cupo_maximo" className="form-control" placeholder="Cupo máximo" value={formulario.cupo_maximo} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" className={`btn mt-3 ${editandoId ? 'btn-warning' : 'btn-primary'}`}>
          {editandoId ? 'Guardar cambios' : 'Registrar evento'}
        </button>
        {editandoId && (
          <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={handleCancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>

      <div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="Buscar evento por nombre o lugar..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />
</div>

{cargando ? (
  <p>Cargando eventos...</p>
) : eventos.length === 0 ? (
  <p>No hay eventos registrados aún.</p>
) : eventosFiltrados.length === 0 ? (
  <p>No se encontraron eventos que coincidan con la búsqueda.</p>
) : (
        <div className="row">
  {eventosFiltrados.map((evento) => (
            <div className="col-md-6 mb-3" key={evento.id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{evento.nombre}</h5>
                  <p className="card-text">{evento.descripcion}</p>
                  <p className="card-text"><strong>Lugar:</strong> {evento.lugar}</p>
                  <p className="card-text"><strong>Fecha:</strong> {evento.fecha}</p>
                  <p className="card-text"><strong>Cupo:</strong> {evento.cupo_maximo}</p>

                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditar(evento)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(evento.id)}>Eliminar</button>

                  <hr />

                  <h6>Inscribir participante</h6>
                  <div className="d-flex gap-2 mb-2">
                    <select
                      className="form-select form-select-sm"
                      value={seleccion[evento.id] || ''}
                      onChange={(e) => handleSeleccionChange(evento.id, e.target.value)}
                    >
                      <option value="">-- Selecciona participante --</option>
                      {participantes.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    <button className="btn btn-success btn-sm" onClick={() => handleInscribir(evento.id)}>
                      Inscribir
                    </button>
                  </div>

                  <button className="btn btn-outline-primary btn-sm" onClick={() => toggleVerInscritos(evento.id)}>
                    {inscritosPorEvento[evento.id] ? 'Ocultar inscritos' : 'Ver inscritos'}
                  </button>

                  {inscritosPorEvento[evento.id] && (
                    <ul className="list-group mt-2">
                      {inscritosPorEvento[evento.id].length === 0 ? (
                        <li className="list-group-item">Nadie inscrito aún.</li>
                      ) : (
                        inscritosPorEvento[evento.id].map((i) => (
                          <li className="list-group-item d-flex justify-content-between align-items-center" key={i.id}>
                            {i.participante?.nombre} — {i.participante?.correo}
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleEliminarInscripcion(i.id, evento.id)}
                            >
                              Quitar
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Eventos;