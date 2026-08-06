import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Registro() {
  const [formData, setFormData] = useState({
    documento: '',
    password: '',
    nombreCompleto: '',
    rol: 'MEDICO' 
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga integrado

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
    setLoading(true); // Activa el estado de carga

    // Validación extra antes de enviar
    if (formData.password.length !== 6) {
      setError('La contraseña debe tener exactamente 6 dígitos numéricos.');
      setLoading(false);
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
    } finally {
      setLoading(false); // Apaga el estado de carga al terminar la petición
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Crear Nuevo Usuario</h2>
        <p style={styles.subtitle}>Completa los datos del personal de salud</p>
        
        {mensaje && <div style={styles.successAlert}>{mensaje}</div>}
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Documento (ID de acceso):</label>
            <input 
              type="text" 
              name="documento" 
              value={formData.documento} 
              disabled={loading}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, documento: val });
              }}
              required 
              placeholder="Ingresa la cédula o documento"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo:</label>
            <input 
              type="text" 
              name="nombreCompleto" 
              value={formData.nombreCompleto} 
              onChange={handleChange} 
              disabled={loading}
              required 
              placeholder="Nombre y Apellidos"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña Numérica (6 dígitos):</label>
            <input 
              type="text" 
              name="password" 
              placeholder="Ej: 123456"
              value={formData.password} 
              onChange={handleChange} 
              disabled={loading}
              required 
              style={{ ...styles.input, letterSpacing: '4px' }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Rol en la Clínica:</label>
            <select 
              name="rol" 
              value={formData.rol} 
              onChange={handleChange} 
              disabled={loading}
              style={styles.select}
            >
              <option value="MEDICO">Médico</option>
              <option value="AUXILIAR_ADMINISTRATIVO">Auxiliar Administrativo</option>
            </select>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Guardando Registro...' : 'Registrar Usuario'}
          </button>
        </form>

        <div style={styles.loginLinkContainer}>
          <Link to="/" style={styles.loginLink}>
            ← Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

// Estilos unificados con el Manual de Diseño
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-gray-light)',
    padding: '20px'
  },
  card: {
    backgroundColor: 'var(--color-white)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(27, 117, 187, 0.1)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  },
  title: {
    margin: '0 0 8px 0',
    color: 'var(--color-secondary)', /* Azul institucional */
    fontSize: '26px',
    fontFamily: 'var(--font-title)'
  },
  subtitle: {
    margin: '0 0 28px 0',
    color: 'var(--color-gray-text)',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'var(--color-black)',
    fontFamily: 'var(--font-bold)'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '2px solid #e1e4e8',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '2px solid #e1e4e8',
    fontSize: '14px',
    backgroundColor: 'var(--color-white)',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    backgroundColor: 'var(--color-primary)', /* Celeste / Cyan */
    color: 'var(--color-white)',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'var(--font-bold)',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(0, 173, 238, 0.2)',
    fontWeight: 'bold'
  },
  loginLinkContainer: {
    marginTop: '24px',
    borderTop: '1px solid #eee',
    paddingTop: '20px'
  },
  loginLink: {
    color: 'var(--color-secondary)',
    fontSize: '14px',
    textDecoration: 'none',
    fontFamily: 'var(--font-bold)'
  },
  successAlert: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'left',
    border: '1px solid #c3e6cb'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'left',
    border: '1px solid #f5c6cb'
  }
};