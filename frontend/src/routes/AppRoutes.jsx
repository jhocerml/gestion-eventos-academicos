import { Routes, Route } from 'react-router-dom';
import Eventos from '../pages/Eventos';
import Participantes from '../pages/Participantes';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Eventos />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/participantes" element={<Participantes />} />
    </Routes>
  );
}

export default AppRoutes;