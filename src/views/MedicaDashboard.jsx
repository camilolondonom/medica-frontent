import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';

export default function MedicaDashboard({ user, setUser }) {
  const [seccionActiva, setSeccionActiva] = useState('consulta');
  const [conectado, setConectado] = useState(false);
  const stompClientRef = useRef(null);

  // Paciente simulado en atención/espera
  const [pacienteActivo] = useState({
    nombre: 'Juan Pérez',
    documento: '12345678',
  });

  useEffect(() => {
    // Configuración y activación del cliente WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-turnos'),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log('[STOMP Debug]:', str);
      },
      onConnect: () => {
        console.log('✅ Médico conectado exitosamente a WebSockets');
        setConectado(true);
      },
      onDisconnect: () => {
        console.log('❌ Conexión WebSocket desconectada');
        setConectado(false);
      },
      onStompError: (frame) => {
        console.error('Error de STOMP en Médica:', frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const handleLlamarSiguiente = () => {
    console.log('Botón "Llamar Siguiente" presionado');

    if (!stompClientRef.current) {
      alert('Error: El cliente WebSocket no se ha creado.');
      return;
    }

    if (!stompClientRef.current.connected) {
      alert('⚠️ El WebSocket no está conectado con Spring Boot. Revisa si el backend está corriendo en http://localhost:8080');
      return;
    }

    const payload = {
      paciente: pacienteActivo.nombre,
      consultorio: 'Consultorio 1',
      medico: user?.nombreCompleto || 'Dra. Médica',
      fechaHora: new Date().toISOString(),
    };

    try {
      stompClientRef.current.publish({
        destination: '/app/llamar-turno',
        body: JSON.stringify(payload),
      });

      console.log('📢 Evento de llamado enviado al TV:', payload);
      alert(`¡Llamado enviado al TV para el paciente ${pacienteActivo.nombre}!`);
    } catch (error) {
      console.error('Error al publicar el turno:', error);
      alert('Ocurrió un error al intentar enviar el turno.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#1b75bb] text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="p-4 bg-[#00adee] text-center font-bold text-lg border-b border-blue-400">
            Consultorio Médico
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <button
              onClick={() => setSeccionActiva('consulta')}
              className={`w-full text-left px-4 py-3 rounded-md transition ${
                seccionActiva === 'consulta' ? 'bg-[#00adee] font-bold' : 'hover:bg-blue-600'
              }`}
            >
              📋 Consulta Médica
            </button>
            <button
              onClick={() => setSeccionActiva('certificados')}
              className={`w-full text-left px-4 py-3 rounded-md transition ${
                seccionActiva === 'certificados' ? 'bg-[#00adee] font-bold' : 'hover:bg-blue-600'
              }`}
            >
              📜 Certificados
            </button>
            <button
              onClick={() => setSeccionActiva('huella')}
              className={`w-full text-left px-4 py-3 rounded-md transition ${
                seccionActiva === 'huella' ? 'bg-[#00adee] font-bold' : 'hover:bg-blue-600'
              }`}
            >
              👆 Certificado de Huella
            </button>
            <button
              onClick={() => setSeccionActiva('crecimiento')}
              className={`w-full text-left px-4 py-3 rounded-md transition ${
                seccionActiva === 'crecimiento' ? 'bg-[#00adee] font-bold' : 'hover:bg-blue-600'
              }`}
            >
              📈 Crecimiento y Desarrollo
            </button>
            <button
              onClick={() => setSeccionActiva('formulas')}
              className={`w-full text-left px-4 py-3 rounded-md transition ${
                seccionActiva === 'formulas' ? 'bg-[#00adee] font-bold' : 'hover:bg-blue-600'
              }`}
            >
              💊 Fórmulas Extraordinarias
            </button>
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-blue-400">
          <p className="text-sm font-semibold truncate">{user?.nombreCompleto}</p>
          <p className="text-xs text-blue-200 uppercase">{user?.rol}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`h-2.5 w-2.5 rounded-full ${conectado ? 'bg-green-400' : 'bg-red-500'}`}></span>
            <span className="text-xs text-blue-100">{conectado ? 'WS Conectado' : 'WS Desconectado'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar de Gestión de Turnos */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-gray-500">Paciente Activo:</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              {pacienteActivo.nombre} (CC {pacienteActivo.documento})
            </span>
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleLlamarSiguiente}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-sm transition shadow active:scale-95 cursor-pointer"
            >
              📢 Llamar Siguiente
            </button>
            <button 
              type="button"
              onClick={() => alert('Marcar ausente en construcción')}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold text-sm cursor-pointer"
            >
              ⚠️ Marcar Ausente
            </button>
            <button 
              type="button"
              onClick={() => alert('Finalizar turno en construcción')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm cursor-pointer"
            >
              ✅ Finalizar Turno
            </button>
          </div>
        </header>

        {/* Vista del Contenido Según Menú */}
        <div className="flex-1 p-6 overflow-y-auto">
          {seccionActiva === 'consulta' && (
            <div className="w-full h-full bg-white rounded-lg shadow border p-4 flex flex-col justify-center items-center">
              <h2 className="text-xl font-bold text-gray-700 mb-2">Visor Rentarhosting SAS</h2>
              <p className="text-gray-500 mb-4 text-center">
                Aquí se cargará el marco independiente de Rentarhosting para la historia clínica.
              </p>
              <div className="w-full h-96 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                [ Espacio reservado para iFrame / Visor de Rentarhosting ]
              </div>
            </div>
          )}

          {seccionActiva === 'certificados' && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-bold mb-4">Generación de Certificados Médicos</h2>
              <p className="text-sm text-gray-600">Formulario y plantilla predeterminada...</p>
            </div>
          )}

          {seccionActiva === 'crecimiento' && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-bold mb-4">Módulo de Crecimiento y Desarrollo</h2>
              <p className="text-sm text-gray-600">Registro antropométrico y gráfico de percentiles...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}