// CrecimientoDesarrollo.jsx
import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api/crecimiento`;

function calcularEdadMeses(fechaNacimiento, fechaReferencia) {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  const ref = fechaReferencia ? new Date(fechaReferencia) : new Date();
  let meses = (ref.getFullYear() - nac.getFullYear()) * 12 + (ref.getMonth() - nac.getMonth());
  if (ref.getDate() < nac.getDate()) meses -= 1;
  return meses;
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return "—";
  return fechaIso.replaceAll("-", "/"); // yyyy-MM-dd -> yyyy/MM/dd
}

function formatearEdad(meses) {
  if (meses === null || meses < 0) return "—";
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios}a ${resto}m`;
}

export default function CrecimientoDesarrollo({ pacienteActivo }) {
  const [fechaToma, setFechaToma] = useState(new Date().toISOString().split("T")[0]);
  const [pesoKg, setPesoKg] = useState("");
  const [tallaCm, setTallaCm] = useState("");
  const [incluirPerimetro, setIncluirPerimetro] = useState(false);
  const [perimetroCefalico, setPerimetroCefalico] = useState("");
  const [proximaVisita, setProximaVisita] = useState("");
  const [remisiones, setRemisiones] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");

  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    setPesoKg("");
    setTallaCm("");
    setIncluirPerimetro(false);
    setPerimetroCefalico("");
    setProximaVisita("");
    setRemisiones("");
    setRecomendaciones("");
    setFechaToma(new Date().toISOString().split("T")[0]);
  }, [pacienteActivo?.idAtencion]);

  const edadMeses = pacienteActivo
    ? calcularEdadMeses(pacienteActivo.fechaNacimiento, fechaToma)
    : null;
  const mayorDeCincoAnios = edadMeses !== null && edadMeses > 60;

  const cargarHistorial = async (documento) => {
    if (!documento) return;
    setCargandoHistorial(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${documento}`);
      if (!res.ok) throw new Error("No se pudo cargar el historial.");
      setHistorial(await res.json());
    } catch (err) {
      console.error(err);
      alert("Error al cargar el historial de crecimiento.");
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleBuscarHistorial = (e) => {
    e.preventDefault();
    cargarHistorial(documentoBusqueda);
  };

  const handleRegistrarMedida = async (e) => {
    e.preventDefault();

    if (!pacienteActivo) {
      alert("No hay un paciente en curso para registrar medidas.");
      return;
    }
    if (!pesoKg || !tallaCm) {
      alert("Peso y talla son obligatorios.");
      return;
    }

    const payload = {
      documento: pacienteActivo.documento,
      fechaToma,
      pesoKg: Number(pesoKg),
      tallaCm: Number(tallaCm),
    };
    if (incluirPerimetro && perimetroCefalico) {
      payload.perimetroCefalico = Number(perimetroCefalico);
    }
    if (proximaVisita) payload.proximaVisita = proximaVisita;
    if (remisiones.trim()) payload.remisiones = remisiones.trim();
    if (recomendaciones.trim()) payload.recomendaciones = recomendaciones.trim();

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const mensaje = await res.text();
        alert(`No se pudo registrar la medida: ${mensaje}`);
        return;
      }

      const data = await res.json();

      setPesoKg("");
      setTallaCm("");
      setIncluirPerimetro(false);
      setPerimetroCefalico("");
      setProximaVisita("");
      setRemisiones("");
      setRecomendaciones("");

      if (data.actualizado) {
        alert("Ya existía un registro de este paciente para esta fecha — se actualizó con los nuevos datos.");
      }

      setDocumentoBusqueda(String(pacienteActivo.documento));
      await cargarHistorial(pacienteActivo.documento);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar la medida.");
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const pacienteImprimible = historial.length > 0 ? historial[0] : null;

  return (
    <div className="space-y-4">
      {/* REGISTRO DE NUEVA MEDIDA */}
      <div className="bg-white p-6 rounded-lg shadow border no-print">
        <h2 className="text-lg font-bold mb-1">📈 Registrar Nueva Medida</h2>

        {!pacienteActivo ? (
          <p className="text-sm text-gray-500 italic">
            No hay paciente en curso. Llama o confirma el ingreso de un paciente para habilitar el registro.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-4">
              Paciente: <span className="font-bold text-gray-700">{pacienteActivo.nombreCompleto}</span>{" "}
              (CC {pacienteActivo.documento})
              {pacienteActivo.fechaNacimiento ? (
                <span className="ml-2 text-gray-500">— Edad: {formatearEdad(edadMeses)}</span>
              ) : (
                <span className="ml-2 text-amber-600">
                  — Sin fecha de nacimiento registrada
                </span>
              )}
            </p>

            <form onSubmit={handleRegistrarMedida} className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Fecha de Toma
                </label>
                <input
                  type="date"
                  value={fechaToma}
                  onChange={(e) => setFechaToma(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)}
                  placeholder="Ej: 15.4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Talla (cm) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tallaCm}
                  onChange={(e) => setTallaCm(e.target.value)}
                  placeholder="Ej: 98.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                />
              </div>

              <div className="col-span-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirPerimetro}
                    onChange={(e) => setIncluirPerimetro(e.target.checked)}
                    className="rounded text-[#00adee] focus:ring-[#00adee] h-4 w-4"
                  />
                  <span>Incluir perímetro cefálico</span>
                </label>

                {incluirPerimetro && mayorDeCincoAnios && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
                    ⚠️ Este paciente tiene más de 5 años — la OMS ya no considera este
                    indicador clínicamente relevante a partir de esa edad. Puedes continuar
                    si lo consideras necesario.
                  </p>
                )}

                {incluirPerimetro && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={perimetroCefalico}
                    onChange={(e) => setPerimetroCefalico(e.target.value)}
                    placeholder="Perímetro cefálico (cm)"
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Próxima Visita
                </label>
                <input
                  type="date"
                  value={proximaVisita}
                  onChange={(e) => setProximaVisita(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Remisiones
                </label>
                <input
                  type="text"
                  value={remisiones}
                  onChange={(e) => setRemisiones(e.target.value.toUpperCase())}
                  placeholder="Ej: Nutrición, Pediatría..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Recomendaciones / Fórmula
                </label>
                <textarea
                  rows={3}
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  placeholder="Ej: Leche de fórmula hidrolizada, purgante, control en 1 mes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none resize-none"
                />
              </div>

              <div className="col-span-3">
                <button
                  type="submit"
                  className="w-full bg-[#1b75bb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition text-sm uppercase tracking-wider"
                >
                  Guardar Medida
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* BÚSQUEDA DE HISTORIAL */}
      <div className="bg-white p-6 rounded-lg shadow border no-print">
        <h2 className="text-lg font-bold mb-3">🔍 Historial de Crecimiento por Paciente</h2>

        <form onSubmit={handleBuscarHistorial} className="flex gap-2 mb-2">
          <input
            type="text"
            value={documentoBusqueda}
            onChange={(e) => setDocumentoBusqueda(e.target.value)}
            placeholder="Documento del paciente"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#00adee] outline-none"
          />
          <button
            type="submit"
            className="bg-[#00adee] hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition"
          >
            Buscar
          </button>
          {historial.length > 0 && (
            <button
              type="button"
              onClick={handleImprimir}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition"
            >
              🖨️ Imprimir Carné
            </button>
          )}
        </form>
      </div>

      {/* ÁREA IMPRIMIBLE: historial + carné */}
      <div className="bg-white p-6 rounded-lg shadow border print:shadow-none print:border-none print:p-0">
        <div className="hidden print:block mb-4 text-center">
          <h1 className="text-xl font-bold text-[#1b75bb]">Carné de Crecimiento y Desarrollo</h1>
          <p className="text-sm text-gray-600">Dra. Carolina Londoño M. — RM: 52878-09</p>
        </div>

        {pacienteImprimible && (
          <div className="hidden print:grid grid-cols-2 gap-2 text-sm mb-4 border-b pb-2">
            <p><span className="font-bold">Paciente:</span> {pacienteImprimible.nombreCompleto}</p>
            <p><span className="font-bold">Documento:</span> {pacienteImprimible.documento}</p>
            <p>
              <span className="font-bold">Fecha de nacimiento:</span>{" "}
              {pacienteImprimible.fechaNacimiento || "No registrada"}
            </p>
            <p>
              <span className="font-bold">Sexo:</span>{" "}
              {pacienteImprimible.genero === "M" ? "Masculino" : pacienteImprimible.genero === "F" ? "Femenino" : "—"}
            </p>
          </div>
        )}

        {cargandoHistorial ? (
          <p className="text-sm text-gray-400 italic no-print">Cargando...</p>
        ) : historial.length === 0 ? (
          <p className="text-sm text-gray-400 italic no-print">
            Sin resultados. Busca un documento o registra una medida arriba.
          </p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b uppercase text-[11px] print:bg-transparent">
                <th className="p-2">Fecha</th>
                <th className="p-2">Edad</th>
                <th className="p-2">Peso (kg)</th>
                <th className="p-2">Talla (cm)</th>
                <th className="p-2">IMC</th>
                <th className="p-2">P. Cefálico</th>
                <th className="p-2 print:table-cell hidden">Próx. Visita</th>
                <th className="p-2 print:table-cell hidden">Remisiones</th>
                <th className="p-2 print:table-cell hidden">Recomendaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {historial.map((m) => (
                <tr key={m.idRegistro}>
                  <td className="p-2 font-mono text-xs">{formatearFecha(m.fechaToma)}</td>
                  <td className="p-2 text-xs">
                    {formatearEdad(calcularEdadMeses(m.fechaNacimiento, m.fechaToma))}
                  </td>
                  <td className="p-2">{m.pesoKg}</td>
                  <td className="p-2">{m.tallaCm}</td>
                  <td className="p-2 font-bold text-[#1b75bb]">{m.imc}</td>
                  <td className="p-2">{m.perimetroCefalico ?? "—"}</td>
                  <td className="p-2 print:table-cell hidden text-xs">{formatearFecha(m.proximaVisita)}</td>
                  <td className="p-2 print:table-cell hidden text-xs">{m.remisiones ?? "—"}</td>
                  <td className="p-2 print:table-cell hidden text-xs">{m.recomendaciones ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="hidden print:block text-[10px] text-gray-500 mt-6 border-t pt-2">
          Patrones de crecimiento infantil de la OMS, adoptados en Colombia mediante la Resolución 2465 de
          2016 del Ministerio de Salud. Las curvas de percentil se incorporarán en una próxima versión de
          este módulo.
        </p>
      </div>

      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 12mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}