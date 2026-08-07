import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Cambiamos './pages/' por './views/'
import Login from './views/Login';
import RecepcionDashboard from './views/RecepcionDashboard';
import MedicaDashboard from './views/MedicaDashboard';
// Si aún no has creado SalaEsperaTV.jsx dentro de views, puedes dejar la línea comentada por ahora:
// import SalaEsperaTV from './views/SalaEsperaTV';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Ruta Protegida - Recepción */}
        <Route 
          path="/recepcion" 
          element={
            user && user.rol === 'AUXILIAR_ADMINISTRATIVO' 
              ? <RecepcionDashboard user={user} setUser={setUser} /> 
              : <Navigate to="/login" />
          } 
        />

        {/* Ruta Protegida - Médica */}
        <Route 
          path="/consulta/*" 
          element={
            user && user.rol === 'MEDICO' 
              ? <MedicaDashboard user={user} setUser={setUser} /> 
              : <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;