import React, { useState, useEffect } from 'react';

const SalaEsperaTV = () => {
  // Estado para el turno llamado actualmente
  const [turnoActual, setTurnoActual] = useState({
    codigo: 'A-01',
    paciente: 'Juan Pérez',
    consultorio: 'Consultorio 1'
  });

  // Estado para la lista de próximos turnos
  const [proximosTurnos, setProximosTurnos] = useState([
    { id: 1, codigo: 'A-02', paciente: 'María Gómez' },
    { id: 2, codigo: 'A-03', paciente: 'Carlos Rodríguez' },
    { id: 3, codigo: 'A-04', paciente: 'Ana Martínez' }
  ]);

  // ID del video o lista de YouTube (reproducción en bucle y silencio para evitar bloqueos del navegador)
  const youtubeVideoId = "dQw4w9WgXcQ"; // Cambiar por el ID deseado o playlist

  return (
    <div style={styles.container}>
      {/* SECCIÓN IZQUIERDA: Reproductor de YouTube */}
      <div style={styles.videoSection}>
        <iframe
          style={styles.iframe}
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}`}
          title="Video Sala de Espera"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* SECCIÓN DERECHA: Control de Turnos */}
      <div style={styles.turnosSection}>
        {/* Cabecera / Turno Actual */}
        <div style={styles.turnoActualCard}>
          <h2 style={styles.labelLlamando}>TURNO ACTUAL</h2>
          <div style={styles.codigoBig}>{turnoActual.codigo}</div>
          <div style={styles.pacienteNombre}>{turnoActual.paciente}</div>
          <div style={styles.consultorioBadge}>{turnoActual.consultorio}</div>
        </div>

        {/* Lista de Turnos Siguientes */}
        <div style={styles.siguientesContainer}>
          <h3 style={styles.subtitulo}>Siguientes en Espera</h3>
          <div style={styles.listaTurnos}>
            {proximosTurnos.map((t) => (
              <div key={t.id} style={styles.turnoRow}>
                <span style={styles.codigoSmall}>{t.codigo}</span>
                <span style={styles.pacienteSmall}>{t.paciente}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    overflow: 'hidden'
  },
  videoSection: {
    flex: '2',
    height: '100%',
    backgroundColor: '#000000'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  turnosSection: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    backgroundColor: '#1e293b',
    borderLeft: '4px solid #00adee',
    justifyContent: 'space-between'
  },
  turnoActualCard: {
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    border: '2px solid #00adee',
    boxShadow: '0 0 20px rgba(0, 173, 238, 0.3)'
  },
  labelLlamando: {
    margin: 0,
    fontSize: '20px',
    color: '#00adee',
    letterSpacing: '2px',
    fontWeight: 'bold'
  },
  codigoBig: {
    fontSize: '72px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '10px 0'
  },
  pacienteNombre: {
    fontSize: '24px',
    color: '#e2e8f0',
    fontWeight: '600'
  },
  consultorioBadge: {
    marginTop: '16px',
    display: 'inline-block',
    backgroundColor: '#1b75bb',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  siguientesContainer: {
    marginTop: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  subtitulo: {
    fontSize: '18px',
    color: '#94a3b8',
    marginBottom: '12px',
    borderBottom: '1px solid #334155',
    paddingBottom: '8px'
  },
  listaTurnos: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto'
  },
  turnoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: '12px 16px',
    borderRadius: '8px'
  },
  codigoSmall: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#00adee'
  },
  pacienteSmall: {
    fontSize: '16px',
    color: '#f8fafc'
  }
};

export default SalaEsperaTV;