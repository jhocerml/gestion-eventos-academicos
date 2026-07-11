import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">Gestión de Eventos</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/eventos">Eventos</Link>
        <Link className="nav-link" to="/participantes">Participantes</Link>
      </div>
    </nav>
  );
}

export default Navbar;