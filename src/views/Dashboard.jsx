import React from 'react';

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.brand}>Menú Médica</h3>
        <ul style={styles.menuList}>
          <li style={styles.menuItem}>✦ Inicio</li>
          <li style={styles.menuItem}>✦ Pacientes</li>
          <li style={styles.menuItem}>✦ Atenciones</li>
        </ul>
      </div>
      
      <div style={styles.mainContent}>
        <h2>¡Bienvenido al Sistema de Gestión Médica!</h2>
        <p>Selecciona una opción del menú para comenzar a gestionar el consultorio.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'sans-serif',
    backgroundColor: '#f8f9fa'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px'
  },
  brand: {
    margin: '0 0 30px 0',
    fontSize: '20px',
    borderBottom: '1px solid #334155',
    paddingBottom: '10px'
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  menuItem: {
    padding: '12px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '5px',
    transition: 'background 0.2s',
    backgroundColor: '#334155'
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    color: '#333'
  }
};

export default Dashboard;