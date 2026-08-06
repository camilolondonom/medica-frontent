import { useState } from 'react';

export default function MedicaDashboard({ user, setUser }) {
  const [seccionActiva, setSeccionActiva] = useState('consulta');

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
          <p className="text-sm font-semibold truncate">{user.nombreCompleto}</p>
          <p className="text-xs text-blue-200 uppercase">{user.rol}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Area Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar de Gestión de Turnos */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-gray-500">Paciente Activo:</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              Juan Pérez (CC 12345678)
            </span>
          </div>
          <div className="space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-sm">
              📢 Llamar Siguiente
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold text-sm">
              ⚠️ Marcar Ausente
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm">
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