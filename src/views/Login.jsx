import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ documento: '', password: '' });
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState('');        // Estado de error

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: Number(credentials.documento),
          password: credentials.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login exitoso:', data);
        // Guardamos el rol o nombre en localStorage para usarlo en el Dashboard si es necesario
        localStorage.setItem('usuario', JSON.stringify(data));
        navigate('/dashboard'); 
      } else {
        const mensajeError = await response.text();
        setError(mensajeError || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false); // Apaga el estado de carga al terminar
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sistema Gestión Médica</h2>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="documento" style={styles.label}>Número de Documento</label>
            <input
              type="text"
              id="documento"
              name="documento"
              value={credentials.documento}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ingresa tu documento"
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Contraseña Numérica</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div style={styles.registerContainer}>
          <p style={styles.registerText}>¿No tienes una cuenta médica?</p>
          <Link to="/registro" style={styles.registerLink}>
            Registrar Nuevo Usuario
          </Link>
        </div>
      </div>
    </div>
  );
};

// Mantenemos tus estilos del manual e incluimos la alerta de error
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-gray-light)' },
  card: { backgroundColor: 'var(--color-white)', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(27, 117, 187, 0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { margin: '0 0 8px 0', color: 'var(--color-secondary)', fontSize: '26px' },
  subtitle: { margin: '0 0 28px 0', color: 'var(--color-gray-text)', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', textAlign: 'left' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-black)' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #e1e4e8', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  button: { backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', padding: '14px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(0, 173, 238, 0.2)', fontWeight: 'bold' },
  registerContainer: { marginTop: '28px', borderTop: '1px solid #eee', paddingTop: '20px' },
  registerText: { margin: '0 0 6px 0', fontSize: '13px', color: 'var(--color-gray-text)' },
  registerLink: { color: 'var(--color-secondary)', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' },
  errorAlert: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'left', border: '1px solid #f5c6cb' }
};

export default Login;