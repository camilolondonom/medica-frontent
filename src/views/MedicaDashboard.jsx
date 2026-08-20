import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import FormulaMedica from "./FormulaMedica";
import CertificadoMedico from "./CertificadoMedico";
import CertificadoHuella from "./CertificadoHuella";

const API_BASE_URL = "http://localhost:8080/api/atenciones";

const ESTADOS_INFO = {
  ESPERA: { label: "En Espera", clase: "bg-yellow-100 text-yellow-800" },
  LLAMADO: { label: "Llamado", clase: "bg-purple-100 text-purple-800" },
  CONSULTA: { label: "En Consulta", clase: "bg-blue-100 text-blue-800" },
  ATENDIDO: { label: "Atendido", clase: "bg-green-100 text-green-800" },
  AUSENTE: { label: "Ausente", clase: "bg-red-100 text-red-800" },
};

const TIPOS_SERVICIO_LABEL = {
  CONSULTA_GENERAL: "Consulta Médica General",
  CERT_MAYOR: "Certificado Mayor de Edad",
  CERT_MENOR: "Certificado Menor de Edad",
  HUELLA: "Certificado de Huella",
  CTO_DLLO: "Crecimiento y Desarrollo",
  REVISION_CONSULTA: "Revisión de Consulta",
};

export default function MedicaDashboard({ user, setUser }) {
  const [seccionActiva, setSeccionActiva] = useState("consulta");
  const [conectado, setConectado] = useState(false);
  const stompClientRef = useRef(null);

  const [listaDia, setListaDia] = useState([]);
  const [atendidosHoy, setAtendidosHoy] = useState([]);

  const [showDxModal, setShowDxModal] = useState(false);
  const [dxInputs, setDxInputs] = useState(["", "", ""]);

  // Asignar el título a la pestaña del navegador
  useEffect(() => {
    document.title = "DraCLM Médica";
  }, []);

  const cargarListaDia = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("No se pudo cargar la fila del día.");
      setListaDia(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const cargarAtendidos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/atendidos`);
      if (!res.ok) throw new Error("No se pudo cargar la lista de atendidos.");
      setAtendidosHoy(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarListaDia();
    cargarAtendidos();
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-turnos"),
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        client.subscribe("/topic/turnos", (message) => {
          const listaActualizada = JSON.parse(message.body);
          setListaDia(listaActualizada);
          cargarAtendidos();
        });
      },
      onDisconnect: () => {
        setConectado(false);
      },
      onStompError: (frame) => {
        console.error("Error de STOMP en Médica:", frame);
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

  const pacienteLlamado = listaDia.find((p) => p.estadoTurno === "LLAMADO");
  const pacienteEnConsulta = listaDia.find((p) => p.estadoTurno === "CONSULTA");
  const pacienteEnCurso = pacienteEnConsulta || pacienteLlamado || null;

  const ejecutarLlamarSiguiente = async (diagnosticos) => {
    try {
      const res = await fetch(`${API_BASE_URL}/llamar-siguiente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosticos }),
      });

      if (!res.ok) {
        const mensaje = await res.text();
        alert(`No se pudo llamar al siguiente paciente: ${mensaje}`);
        return;
      }

      setShowDxModal(false);
      setDxInputs(["", "", ""]);
      await cargarListaDia();
      await cargarAtendidos();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al llamar al siguiente paciente.");
    }
  };

  const handleLlamarSiguiente = () => {
    if (pacienteEnConsulta) {
      setDxInputs(["", "", ""]);
      setShowDxModal(true);
    } else {
      ejecutarLlamarSiguiente([]);
    }
  };

  const handleConfirmarDxYLlamar = () => {
    const codigos = dxInputs.map((c) => c.trim()).filter(Boolean);
    ejecutarLlamarSiguiente(codigos);
  };

  const handleConfirmarIngreso = async () => {
    if (!pacienteLlamado) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/${pacienteLlamado.idAtencion}/confirmar-ingreso`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        alert(`No se pudo confirmar el ingreso: ${await res.text()}`);
        return;
      }
      await cargarListaDia();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al confirmar el ingreso.");
    }
  };

  const handleMarcarAusenteLlamado = async () => {
    if (!pacienteLlamado) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/${pacienteLlamado.idAtencion}/ausente`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        alert(`No se pudo marcar Ausente: ${await res.text()}`);
        return;
      }
      await cargarListaDia();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al marcar Ausente.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Lateral (Estilo Rediseñado Recepción) */}
      <aside className="w-64 bg-[#1b75bb] text-white flex flex-col justify-between shadow-xl z-10 select-none">
        <div>
          {/* Header del Perfil / Rol */}
          <div className="p-4 border-b border-blue-400/40 bg-blue-900/20 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white border border-white/30 shadow-inner">
              🩺
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-wide leading-tight truncate">
                {user?.nombreCompleto || "Médico"}
              </h1>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold mt-0.5">
                Consultorio Médico
              </p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="mt-4 px-3 space-y-1.5">
            <button
              onClick={() => setSeccionActiva("consulta")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "consulta"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">📋</span>
              <span>Consulta Médica</span>
            </button>

            <button
              onClick={() => setSeccionActiva("atendidos")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "atendidos"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">✅</span>
              <span>Atendidos Hoy</span>
            </button>

            <button
              onClick={() => setSeccionActiva("certificados")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "certificados"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">📜</span>
              <span>Certificados</span>
            </button>

            <button
              onClick={() => setSeccionActiva("huella")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "huella"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">👆</span>
              <span>Certificado de Huella</span>
            </button>

            <button
              onClick={() => setSeccionActiva("crecimiento")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "crecimiento"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">📈</span>
              <span>Crecimiento y Desarrollo</span>
            </button>

            <button
              onClick={() => setSeccionActiva("formulas")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                seccionActiva === "formulas"
                  ? "bg-white text-[#1b75bb] shadow-md font-extrabold"
                  : "hover:bg-blue-600/60 text-blue-100"
              }`}
            >
              <span className="text-sm">💊</span>
              <span>Fórmulas Extraordinarias</span>
            </button>
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-blue-400/40 bg-blue-900/30">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  conectado ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                }`}
              ></span>
              <span className="text-[11px] text-blue-100 font-semibold tracking-wide">
                {conectado ? "Servidor Online" : "Desconectado"}
              </span>
            </div>
            <span className="text-[10px] text-blue-200/70 font-mono">WS v1.0</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition-all duration-200 shadow hover:shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar de Gestión de Turnos */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-gray-500">
              Paciente en curso:
            </span>
            {pacienteEnCurso ? (
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  pacienteEnCurso.estadoTurno === "LLAMADO"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {pacienteEnCurso.nombreCompleto} (CC {pacienteEnCurso.documento}) —{" "}
                {ESTADOS_INFO[pacienteEnCurso.estadoTurno]?.label}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-semibold">
                Sin paciente en curso
              </span>
            )}
          </div>

          <div className="space-x-2">
            {pacienteLlamado ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirmarIngreso}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm transition shadow active:scale-95 cursor-pointer"
                >
                  ✅ Confirmar Ingreso
                </button>
                <button
                  type="button"
                  onClick={handleMarcarAusenteLlamado}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold text-sm cursor-pointer"
                >
                  ⚠️ No respondió: Marcar Ausente
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLlamarSiguiente}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-sm transition shadow active:scale-95 cursor-pointer"
              >
                📢 Llamar Siguiente
              </button>
            )}
          </div>
        </header>

        {/* Vista del Contenido Según Menú */}
        <div className="flex-1 p-6 overflow-y-auto">
          {seccionActiva === "consulta" && (
            <div className="flex gap-4 h-full">
              <div className="flex-1 bg-white rounded-lg shadow border p-4 flex flex-col">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  Visor Rentarhosting SAS
                </h2>
                <p className="text-gray-500 mb-4 text-xs">
                  Historia clínica y consulta médica activa.
                </p>

                <div className="w-full flex-1 min-h-[500px] border rounded-lg overflow-hidden shadow-inner bg-gray-50">
                  <iframe
                    src="https://historycl.com/566414569/usuarios/login"
                    title="Visor Rentarhosting"
                    className="w-full h-full border-none"
                    allow="camera; microphone; fullscreen"
                  />
                </div>
              </div>

              <div className="w-80 bg-white rounded-lg shadow border p-4 flex flex-col overflow-hidden">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">
                  Fila de Hoy ({listaDia.length})
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {listaDia.map((p) => (
                    <div
                      key={p.idAtencion}
                      className="p-2 border rounded-lg bg-gray-50 flex justify-between items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {p.nombreCompleto}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {TIPOS_SERVICIO_LABEL[p.tipoServicio] || p.tipoServicio}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                          ESTADOS_INFO[p.estadoTurno]?.clase ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ESTADOS_INFO[p.estadoTurno]?.label || p.estadoTurno}
                      </span>
                    </div>
                  ))}
                  {listaDia.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">
                      Sin pacientes registrados hoy.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "atendidos" && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-bold mb-4">
                Pacientes Atendidos Hoy ({atendidosHoy.length})
              </h2>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b uppercase text-[11px]">
                    <th className="p-2">Hora</th>
                    <th className="p-2">Documento</th>
                    <th className="p-2">Paciente</th>
                    <th className="p-2">Servicio</th>
                    <th className="p-2">Diagnósticos</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {atendidosHoy.map((p) => (
                    <tr key={p.idAtencion}>
                      <td className="p-2 font-mono text-xs text-gray-500">
                        {p.horaLlegada}
                      </td>
                      <td className="p-2 font-mono">{p.documento}</td>
                      <td className="p-2 font-semibold">{p.nombreCompleto}</td>
                      <td className="p-2 text-gray-600">
                        {TIPOS_SERVICIO_LABEL[p.tipoServicio] || p.tipoServicio}
                      </td>
                      <td className="p-2">
                        {p.diagnosticos && p.diagnosticos.length > 0
                          ? p.diagnosticos.join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {atendidosHoy.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-gray-400 italic text-xs"
                      >
                        Aún no hay pacientes atendidos hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {seccionActiva === "certificados" && (
            <div className="bg-white p-6 rounded-lg shadow border overflow-y-auto">
              <CertificadoMedico pacienteActivo={pacienteEnCurso} user={user} />
            </div>
          )}

          {seccionActiva === "huella" && (
            <div className="bg-white p-6 rounded-lg shadow border overflow-y-auto">
              <CertificadoHuella pacienteActivo={pacienteEnCurso} user={user} />
            </div>
          )}

          {seccionActiva === "crecimiento" && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-bold mb-4">
                Módulo de Crecimiento y Desarrollo
              </h2>
              <p className="text-sm text-gray-600">
                Registro antropométrico y gráfico de percentiles...
              </p>
            </div>
          )}

          {seccionActiva === "formulas" && (
            <div className="bg-white p-6 rounded-lg shadow border overflow-y-auto">
              <FormulaMedica pacienteActivo={pacienteEnCurso} user={user} />
            </div>
          )}
        </div>
      </main>

      {/* Modal de Diagnósticos */}
      {showDxModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Diagnósticos de {pacienteEnConsulta?.nombreCompleto}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Ingresa hasta 3 códigos CIE-10 antes de llamar al siguiente
              paciente (deja en blanco los que no apliquen).
            </p>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={dxInputs[i]}
                onChange={(e) => {
                  const copia = [...dxInputs];
                  copia[i] = e.target.value.toUpperCase();
                  setDxInputs(copia);
                }}
                placeholder={`DX ${i + 1} (ej: J00)`}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs mb-2 focus:ring-2 focus:ring-[#00adee] outline-none"
              />
            ))}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowDxModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDxYLlamar}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition"
              >
                Guardar y Llamar Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}