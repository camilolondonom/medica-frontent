import React, { useState } from 'react';

export default function Registro() {
  const [formData, setFormData] = useState({
    documento: '',
    password: '',
    nombreCompleto: '',
    rol: 'MEDICO' 
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación para que la contraseña solo acepte números y máximo 6 caracteres
    if (name === 'password') {
      const soloNumeros = value.replace(/\D/g, ''); // Remueve lo que no sea número
      if (soloNumeros.length <= 6) {
        setFormData({ ...formData, [name]: soloNumeros });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validación extra antes de enviar
    if (formData.password.length !== 6) {
      setError('La contraseña debe tener exactamente 6 dígitos numéricos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento: Number(formData.documento), // Enviamos como número
          password: formData.password,
          nombreCompleto: formData.nombreCompleto,
          rol: formData.rol
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje(`¡Usuario con documento ${data.documento} creado con éxito!`);
        setFormData({ documento: '', password: '', nombreCompleto: '', rol: 'MEDICO' });
      } else {
        const errorText = await response.text();
        setError(errorText || 'Error al registrar el usuario.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor backend.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Crear Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Número de Documento (Será tu ID de acceso):</label>
          <input 
            type="text" 
            name="documento" 
            value={formData.documento} 
            onChange={(e) => {
              // Permitir solo números en el documento
              const val = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, documento: val });
            }}
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Nombre Completo:</label>
          <input 
            type="text" 
            name="nombreCompleto" 
            value={formData.nombreCompleto} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Contraseña Numérica (6 dígitos):</label>
          <input 
            type="text" // Cambiado a text para controlar mejor la máscara por regex
            name="password" 
            placeholder="Ej: 123456"
            value={formData.password} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px', letterSpacing: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Rol:</label>
          <select 
            name="rol" 
            value={formData.rol} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="MEDICO">Médico</option>
            <option value="AUXILIAR_ADMINISTRATIVO">Auxiliar Administrativo</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer', width: '100%' }}>
          Registrar Usuario
        </button>
      </form>

      {mensaje && <p style={{ color: 'green', marginTop: '15px' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}