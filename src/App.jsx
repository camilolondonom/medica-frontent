import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import RecepcionDashboard from './pages/RecepcionDashboard';
import MedicaDashboard from './pages/MedicaDashboard';
import SalaEsperaTV from './pages/SalaEsperaTV';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Vista Pública de la TV */}
        <Route path="/sala-espera" element={<SalaEsperaTV />} />

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