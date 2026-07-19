import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Registro from './views/Registro'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Aquí queda integrada tu nueva ruta definitiva */}
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;