import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";

export default function RecepcionDashboard({ user, setUser }) {
  const [seccionActiva, setSeccionActiva] = useState("admision");
  const [conectado, setConectado] = useState(false);
  const stompClientRef = useRef(null);

  // URL del sistema externo Rentarhosting
  const [urlRentarhosting, setUrlRentarhosting] = useState(
    "https://historycl.com/566414569/usuarios/login",
  );

  const servicios = [
    "Consulta Médica General",
    "Certificado Mayor de Edad",
    "Certificado Menor de Edad",
    "Certificado de Huella",
    "Crecimiento y Desarrollo",
    "Constancia de Asistencia (Acompañante)",
  ];

  const [formTurno, setFormTurno] = useState({
    nombrePaciente: "",
    documento: "",
    servicio: servicios[0],
    requiereAcompanante: false,
    nombreAcompanante: "",
    documentoAcompanante: "",
  });

  const [pacientesSala, setPacientesSala] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      documento: "12345678",
      servicio: "Consulta Médica General",
      estado: "EN_ESPERA",
      horaIngreso: "08:15 AM",
    },
    {
      id: 2,
      nombre: "María Gómez",
      documento: "87654321",
      servicio: "Certificado de Huella",
      estado: "EN_ESPERA",
      horaIngreso: "08:30 AM",
    },
    {
      id: 3,
      nombre: "Carlos Ruiz",
      documento: "45678912",
      servicio: "Crecimiento y Desarrollo",
      estado: "ATENDIDO",
      horaIngreso: "07:50 AM",
    },
  ]);

  // Título de la Pestaña y Favicon
  useEffect(() => {
    // Título exacto de la pestaña de Recepción
    document.title = "Dra CLM Recepción";

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    // Icono SVG médico para el favicon
    link.href =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231b75bb"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>';
  }, []);

  // Notificación cuando Médica llama a paciente
  // Conexión única a WebSocket y Suscripción a Canales
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-turnos"),
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);

        // Escuchar eventos globales de turnos
        client.subscribe("/topic/turnos", (message) => {
          const turnoRecibido = JSON.parse(message.body);

          setPacientesSala((prev) => {
            const existe = prev.some((p) => p.id === turnoRecibido.id);
            if (existe) {
              return prev.map((p) =>
                p.id === turnoRecibido.id ? turnoRecibido : p,
              );
            }
            return [...prev, turnoRecibido];
          });
        });
      },
      onDisconnect: () => {
        setConectado(false);
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

  const handleRegistrarTurno = (e) => {
    e.preventDefault();
    if (!formTurno.nombrePaciente || !formTurno.documento) {
      alert("Por favor ingrese el nombre y documento del paciente.");
      return;
    }

    const nuevoTurno = {
      id: Date.now(),
      nombre: formTurno.nombrePaciente,
      documento: formTurno.documento,
      servicio: formTurno.servicio,
      estado: "EN_ESPERA",
      horaIngreso: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      acompanante: formTurno.requiereAcompanante
        ? {
            nombre: formTurno.nombreAcompanante,
            documento: formTurno.documentoAcompanante,
          }
        : null,
    };

    setPacientesSala((prev) => [...prev, nuevoTurno]);

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/nuevo-turno",
        body: JSON.stringify(nuevoTurno),
      });
    }

    setFormTurno({
      nombrePaciente: "",
      documento: "",
      servicio: servicios[0],
      requiereAcompanante: false,
      nombreAcompanante: "",
      documentoAcompanante: "",
    });
  };

  const handleCambiarEstado = (id, nuevoEstado) => {
    setPacientesSala((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
    );

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/actualizar-estado-turno",
        body: JSON.stringify({ id, nuevoEstado }),
      });
    }
  };

  const handleLlamarTV = (paciente) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/llamar-turno",
        body: JSON.stringify({
          paciente: paciente.nombre,
          consultorio: "Consultorio 1",
          medico: "Dra CLM Médica",
          fechaHora: new Date().toISOString(),
        }),
      });
      alert(`📢 Se ha enviado la llamada de ${paciente.nombre} al TV.`);
    } else {
      alert("WebSocket no conectado con Spring Boot.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const copiarPortapapeles = (texto, etiqueta = "Dato") => {
    navigator.clipboard.writeText(texto);
    alert(`📋 ${etiqueta} (${texto}) copiado al portapapeles.`);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Recepción */}
      <aside className="w-64 bg-[#1b75bb] text-white flex flex-col justify-between shadow-xl z-10">
        <div>
          <div className="p-4 bg-[#00adee] text-center font-bold text-base border-b border-blue-400 tracking-wide uppercase">
            Dra CLM Recepción
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <button
              onClick={() => setSeccionActiva("admision")}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                seccionActiva === "admision"
                  ? "bg-[#00adee] text-white shadow-md"
                  : "hover:bg-blue-600 text-blue-100"
              }`}
            >
              📝 Admisión e Ingreso
            </button>
            <button
              onClick={() => setSeccionActiva("facturacion")}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                seccionActiva === "facturacion"
                  ? "bg-[#00adee] text-white shadow-md"
                  : "hover:bg-blue-600 text-blue-100"
              }`}
            >
              🧾 Facturación y RIPS
            </button>
            <button
              onClick={() => setSeccionActiva("control-tv")}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                seccionActiva === "control-tv"
                  ? "bg-[#00adee] text-white shadow-md"
                  : "hover:bg-blue-600 text-blue-100"
              }`}
            >
              📺 Control de TV y Sala
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-blue-400 bg-blue-900/20">
          <p className="text-xs font-bold truncate">
            {user?.nombreCompleto || "Auxiliar Administrativo"}
          </p>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
            Recepción
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${conectado ? "bg-green-400 animate-pulse" : "bg-red-500"}`}
            ></span>
            <span className="text-[10px] text-blue-100 font-medium">
              {conectado ? "WS Conectado" : "WS Desconectado"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded transition shadow"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal de Trabajo */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* VISTA 1: ADMISIÓN E INGRESO DE PACIENTES */}
        {seccionActiva === "admision" && (
          <div className="flex-1 flex p-3 gap-3 overflow-hidden">
            {/* Lado Izquierdo (65%): Formulario e Ingreso de Pacientes */}
            <div className="w-[65%] flex flex-col gap-3 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-[#1b75bb] mb-3 pb-2 border-b flex items-center justify-between">
                  <span>📌 Asignación Rápida e Ingreso de Paciente</span>
                  <span className="text-[10px] bg-blue-50 text-[#1b75bb] px-2 py-0.5 rounded font-semibold border border-blue-100">
                    Gira de Turnos
                  </span>
                </h2>

                <form
                  onSubmit={handleRegistrarTurno}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Documento de Identidad *
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        value={formTurno.documento}
                        onChange={(e) =>
                          setFormTurno({
                            ...formTurno,
                            documento: e.target.value,
                          })
                        }
                        placeholder="Número de cédula o TI"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#00adee] focus:border-transparent outline-none transition"
                      />
                      {formTurno.documento && (
                        <button
                          type="button"
                          onClick={() =>
                            copiarPortapapeles(formTurno.documento, "Documento")
                          }
                          className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold border text-gray-600"
                          title="Copiar Documento"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Nombre Completo *
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        value={formTurno.nombrePaciente}
                        onChange={(e) =>
                          setFormTurno({
                            ...formTurno,
                            nombrePaciente: e.target.value,
                          })
                        }
                        placeholder="Nombre del paciente"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#00adee] focus:border-transparent outline-none transition"
                      />
                      {formTurno.nombrePaciente && (
                        <button
                          type="button"
                          onClick={() =>
                            copiarPortapapeles(
                              formTurno.nombrePaciente,
                              "Nombre",
                            )
                          }
                          className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold border text-gray-600"
                          title="Copiar Nombre"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Servicio Solicitado *
                    </label>
                    <select
                      value={formTurno.servicio}
                      onChange={(e) =>
                        setFormTurno({ ...formTurno, servicio: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#00adee] focus:border-transparent outline-none bg-white transition"
                    >
                      {servicios.map((s, idx) => (
                        <option key={idx} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Checkbox Acompañante */}
                  <div className="col-span-2 pt-1">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formTurno.requiereAcompanante}
                        onChange={(e) =>
                          setFormTurno({
                            ...formTurno,
                            requiereAcompanante: e.target.checked,
                          })
                        }
                        className="rounded text-[#00adee] focus:ring-[#00adee] h-3.5 w-3.5"
                      />
                      <span>
                        ¿Requiere Constancia de Asistencia para Acompañante?
                      </span>
                    </label>
                  </div>

                  {formTurno.requiereAcompanante && (
                    <div className="col-span-2 bg-blue-50/60 p-3 rounded-lg border border-blue-100 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                          Nombre Acompañante
                        </label>
                        <input
                          type="text"
                          value={formTurno.nombreAcompanante}
                          onChange={(e) =>
                            setFormTurno({
                              ...formTurno,
                              nombreAcompanante: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                          Documento Acompañante
                        </label>
                        <input
                          type="text"
                          value={formTurno.documentoAcompanante}
                          onChange={(e) =>
                            setFormTurno({
                              ...formTurno,
                              documentoAcompanante: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#1b75bb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition active:scale-[0.99] text-xs uppercase tracking-wider"
                    >
                      🎟️ Registrar Ingreso y Asignar Turno
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Vista Rápida de Sala */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1">
                <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Pacientes Registrados Hoy ({pacientesSala.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 border-b uppercase text-[10px]">
                        <th className="p-2">Hora</th>
                        <th className="p-2">Paciente</th>
                        <th className="p-2">Documento</th>
                        <th className="p-2">Servicio</th>
                        <th className="p-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-gray-700">
                      {pacientesSala.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80">
                          <td className="p-2 font-mono text-[11px] text-gray-500">
                            {p.horaIngreso}
                          </td>
                          <td className="p-2 font-semibold text-gray-800">
                            {p.nombre}
                          </td>
                          <td className="p-2 font-mono">{p.documento}</td>
                          <td className="p-2 text-gray-600">{p.servicio}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.estado === "EN_ESPERA"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : p.estado === "AUSENTE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {p.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lado Derecho (35%): Shell Integrado Rentarhosting SAS */}
            <div className="w-[35%] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="bg-gray-100 p-2.5 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 truncate">
                  🌐 Rentarhosting SAS
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  HC Externa
                </span>
              </div>
              <div className="flex-1 bg-gray-50 relative">
                <iframe
                  src={urlRentarhosting}
                  title="Rentarhosting SAS Visor"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: FACTURACIÓN ELECTRÓNICA */}
        {seccionActiva === "facturacion" && (
          <div className="flex-1 flex p-3 gap-3 overflow-hidden">
            <div className="w-[35%] bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col">
              <h3 className="font-bold text-xs text-gray-700 uppercase mb-2 border-b pb-1">
                📋 Pacientes en Sala (Copiar Datos)
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {pacientesSala.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 border rounded-lg bg-gray-50 hover:bg-blue-50/50 transition flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-gray-800">
                          {p.nombre}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          CC: {p.documento}
                        </p>
                        <p className="text-[10px] text-blue-600">
                          {p.servicio}
                        </p>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                        {p.horaIngreso}
                      </span>
                    </div>
                    <div className="flex gap-1 pt-1 border-t border-gray-200">
                      <button
                        onClick={() =>
                          copiarPortapapeles(p.documento, "Documento")
                        }
                        className="flex-1 bg-[#1b75bb] text-white hover:bg-blue-700 text-[10px] py-1 rounded font-bold shadow-sm"
                      >
                        Copiar CC
                      </button>
                      <button
                        onClick={() => copiarPortapapeles(p.nombre, "Nombre")}
                        className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 text-[10px] py-1 rounded font-bold"
                      >
                        Copiar Nombre
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[65%] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="bg-gray-100 p-2.5 border-b text-xs font-bold text-gray-700 flex justify-between items-center">
                <span>
                  🧾 Facturación Electrónica y RIPS (Rentarhosting SAS)
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                  Sistema Directo
                </span>
              </div>
              <div className="flex-1 bg-gray-50">
                <iframe
                  src={`${urlRentarhosting}/facturacion`}
                  title="Facturación Rentarhosting"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* VISTA 3: CONTROL DE TV Y SALA */}
        {seccionActiva === "control-tv" && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-[#1b75bb] mb-2">
                📺 Monitoreo y Transmisión de Televisor
              </h2>
              <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-600">
                  Estado de Pantalla:
                </span>
                <span className="bg-green-100 text-green-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  ● Transmitiendo en Vivo
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 bg-[#1b75bb] text-white font-bold text-xs flex justify-between items-center">
                <span>👥 Matriz Principal de Control de Sala de Espera</span>
                <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded">
                  {pacientesSala.length} Turnos Activos
                </span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-[10px] border-b">
                    <th className="p-2.5">Paciente</th>
                    <th className="p-2.5">Documento</th>
                    <th className="p-2.5">Servicio</th>
                    <th className="p-2.5">Hora</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {pacientesSala.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold text-gray-800">
                        {p.nombre}
                      </td>
                      <td className="p-2.5 font-mono">{p.documento}</td>
                      <td className="p-2.5 text-gray-600">{p.servicio}</td>
                      <td className="p-2.5 text-gray-500 text-[11px] font-mono">
                        {p.horaIngreso}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.estado === "EN_ESPERA"
                              ? "bg-yellow-100 text-yellow-800"
                              : p.estado === "AUSENTE"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-center space-x-2">
                        <select
                          value={p.estado}
                          onChange={(e) =>
                            handleCambiarEstado(p.id, e.target.value)
                          }
                          className="border border-gray-300 text-xs rounded px-1.5 py-0.5 bg-white outline-none"
                        >
                          <option value="EN_ESPERA">En Espera</option>
                          <option value="AUSENTE">Ausente</option>
                          <option value="ATENDIDO">Atendido</option>
                        </select>

                        <button
                          onClick={() => handleLlamarTV(p)}
                          className="bg-[#00adee] hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded font-bold shadow-sm transition"
                        >
                          📢 Llamar al TV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
