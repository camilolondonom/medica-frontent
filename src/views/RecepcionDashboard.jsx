import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function RecepcionDashboard({ user, setUser }) {
  const [reqCertificado, setReqCertificado] = useState(false);
  const [documento, setDocumento] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tiposervicio, setTipoServicio] = useState('CONSULTA_GENERAL');
  
  const stompClientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-turnos');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Conectado a WebSocket desde RecepcionDashboard');
      },
      onStompError: (frame) => {
        console.error('Error de STOMP en Recepción:', frame);
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

  const handleAsignarLlamarTurno = (e) => {
    e.preventDefault();

    if (!nombreCompleto.trim()) {
      alert('Por favor ingrese el nombre del paciente.');
      return;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      const payload = {
        paciente: nombreCompleto,
        consultorio: 'Recepción / Ventanilla 1',
        medico: 'Recepción',
        fechaHora: new Date().toISOString(),
      };

      stompClientRef.current.publish({
        destination: '/app/llamar-turno',
        body: JSON.stringify(payload),
      });

      alert(`Turno asignado y llamado enviado a TV para ${nombreCompleto}`);
      
      // Limpiar formulario
      setDocumento('');
      setNombreCompleto('');
    } else {
      alert('El servicio de WebSockets no está disponible en este momento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="bg-[#1b75bb] text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Módulo de Recepción - Control de Turnos</h1>
        <div className="flex items-center space-x-4 text-sm">
          <span>{user?.nombreCompleto}</span>
          <button 
            onClick={() => setUser(null)}
            className="bg-red-500 px-3 py-1 rounded text-xs hover:bg-red-600 transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario Rápido de Ingreso */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Registrar Turno</h2>
          
          <form className="space-y-4" onSubmit={handleAsignarLlamarTurno}>
            <div>
              <label className="block text-sm font-semibold mb-1">Documento del Paciente</label>
              <input 
                type="number" 
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full border rounded p-2 text-sm" 
                placeholder="Número de documento" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full border rounded p-2 text-sm" 
                placeholder="Nombre completo" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tipo de Servicio</label>
              <select 
                value={tiposervicio}
                onChange={(e) => setTipoServicio(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="CONSULTA_GENERAL">Consulta General</option>
                <option value="CERT_MAYOR">Certificado Médico Mayor</option>
                <option value="CERT_MENOR">Certificado Médico Menor</option>
                <option value="HUELLA">Certificado de Huella</option>
                <option value="CTO_DLLO">Crecimiento y Desarrollo</option>
              </select>
            </div>

            {/* Checkbox Certificado de Asistencia */}
            <div className="pt-2 border-t">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={reqCertificado}
                  onChange={(e) => setReqCertificado(e.target.checked)}
                  className="rounded text-blue-600 h-4 w-4"
                />
                <span>¿Requiere Certificado de Asistencia?</span>
              </label>
            </div>

            {/* Campos condicionales del acompañante */}
            {reqCertificado && (
              <div className="bg-blue-50 p-4 rounded border border-blue-200 space-y-3">
                <p className="text-xs font-bold text-blue-800">Datos Opcionales del Acompañante</p>
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre del Acompañante</label>
                  <input type="text" className="w-full border rounded p-2 text-sm bg-white" placeholder="Nombre opcional" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Documento del Acompañante</label>
                  <input type="number" className="w-full border rounded p-2 text-sm bg-white" placeholder="Documento opcional" />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#00adee] text-white py-2 rounded font-bold hover:bg-blue-500 transition shadow"
            >
              Asignar Turno y Llamar a TV
            </button>
          </form>
        </div>

        {/* Tabla de Control de Sala de Espera */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Estado de Sala de Espera</h2>
          <p className="text-sm text-gray-500">[ Matriz / Tabla con el estado de los turnos en tiempo real ]</p>
        </div>
      </div>
    </div>
  );
}