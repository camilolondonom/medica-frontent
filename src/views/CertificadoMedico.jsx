import React, { useState, useEffect } from "react";

export default function CertificadoMedico({ pacienteActivo, user }) {
  const [formData, setFormData] = useState({
    // Encabezado y Datos del Paciente
    fecha: new Date().toISOString().split("T")[0],
    nombre: "",
    documento: "",
    edad: "",

    // Antecedentes
    patologicos: "",
    alergicos: "",
    cirugias: "",
    habitos: "",
    lentes: "",
    vacunas: "",

    // Examen Físico - Signos Vitales
    peso: "",
    talla: "",
    pa: "",
    fr: "",
    fc: "",
    t: "",
    sat: "",

    // Examen Físico por Sistemas
    cabezaCuello: "",
    cardiopulmonar: "",
    abdomen: "",
    gu: "",
    musculoesqueletico: "",
    pielUnas: "",
    neurologico: "",

    // Cierre
    impresionDx: "Tamizaje",
    recomendaciones: "",
  });

  // Autocompletar cuando haya un paciente en consulta activa
  useEffect(() => {
    if (pacienteActivo) {
      setFormData((prev) => ({
        ...prev,
        nombre: pacienteActivo.nombreCompleto || "",
        documento: pacienteActivo.documento || "",
        edad: pacienteActivo.edad ? `${pacienteActivo.edad} años` : "",
      }));
    }
  }, [pacienteActivo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto font-sans">
      {/* Botón Imprimir (se oculta en la impresión) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            📜 Certificado Médico
          </h1>
          <p className="text-xs text-gray-500">
            Diligencie el formato digital para impresión unificada en hoja Carta.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-[#00adee] hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg shadow transition flex items-center gap-2 cursor-pointer"
        >
          🖨️ Imprimir Certificado
        </button>
      </div>

      {/* DOCUMENTO IMPRIMIBLE */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 text-gray-800">
        
        {/* ENCABEZADO MÉDICO */}
        <header className="text-center mb-3">
          <h2 className="text-lg font-bold text-[#1b75bb] uppercase tracking-wide">
            Dra. Carolina Londoño M.
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            RM: 52878-09 — Médica general - U.P.B.
          </p>
          <div className="flex items-center justify-center my-2">
            <div className="h-[2px] bg-[#00adee] flex-1"></div>
            <span className="px-3 text-sm font-bold text-[#1b75bb] uppercase tracking-wider">
              Certificado Médico
            </span>
            <div className="h-[2px] bg-[#00adee] flex-1"></div>
          </div>
        </header>

        {/* DATOS BÁSICOS DEL PACIENTE */}
        <div className="grid grid-cols-12 gap-2 text-xs mb-3 bg-blue-50/50 p-3 rounded-md border border-blue-100 print:bg-transparent print:p-0 print:border-none">
          <div className="col-span-4 flex items-center gap-1">
            <span className="font-bold text-[#1b75bb]">Fecha:</span>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="border-b border-gray-400 bg-transparent flex-1 focus:outline-none print:border-none"
            />
          </div>
          <div className="col-span-8 flex items-center gap-1">
            <span className="font-bold text-[#1b75bb]">Nombre:</span>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="border-b border-gray-400 bg-transparent flex-1 font-semibold focus:outline-none print:border-none"
            />
          </div>
          <div className="col-span-7 flex items-center gap-1">
            <span className="font-bold text-[#1b75bb]">Documento:</span>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              placeholder="C.C. / T.I."
              className="border-b border-gray-400 bg-transparent flex-1 focus:outline-none print:border-none"
            />
          </div>
          <div className="col-span-5 flex items-center gap-1">
            <span className="font-bold text-[#1b75bb]">Edad:</span>
            <input
              type="text"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              placeholder="Ej: 28 años"
              className="border-b border-gray-400 bg-transparent flex-1 focus:outline-none print:border-none"
            />
          </div>
        </div>

        {/* ANTECEDENTES */}
        <section className="mb-3">
          <h3 className="text-xs font-bold text-[#1b75bb] border-b border-blue-200 pb-0.5 mb-1.5 uppercase">
            Antecedentes:
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[70px]">Patológicos:</span>
              <input
                type="text"
                name="patologicos"
                value={formData.patologicos}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[50px]">Lentes:</span>
              <input
                type="text"
                name="lentes"
                value={formData.lentes}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[70px]">Alergicos:</span>
              <input
                type="text"
                name="alergicos"
                value={formData.alergicos}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[50px]">Vacunas:</span>
              <input
                type="text"
                name="vacunas"
                value={formData.vacunas}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[70px]">Cirugías:</span>
              <input
                type="text"
                name="cirugias"
                value={formData.cirugias}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[50px]">Hábitos:</span>
              <input
                type="text"
                name="habitos"
                value={formData.habitos}
                onChange={handleChange}
                className="border-b border-gray-300 flex-1 focus:outline-none print:border-none"
              />
            </div>
          </div>
        </section>

        {/* EXAMEN FÍSICO */}
        <section className="mb-3">
          <h3 className="text-xs font-bold text-[#1b75bb] border-b border-blue-200 pb-0.5 mb-1.5 uppercase">
            Exámen físico:
          </h3>
          
          {/* Signos Vitales */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2 bg-gray-50 p-1.5 rounded border border-gray-200 print:bg-transparent print:p-0 print:border-none">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Peso:</span>
              <input type="text" name="peso" value={formData.peso} onChange={handleChange} className="w-12 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Talla:</span>
              <input type="text" name="talla" value={formData.talla} onChange={handleChange} className="w-12 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">PA:</span>
              <input type="text" name="pa" value={formData.pa} onChange={handleChange} className="w-16 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">FR:</span>
              <input type="text" name="fr" value={formData.fr} onChange={handleChange} className="w-10 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">FC:</span>
              <input type="text" name="fc" value={formData.fc} onChange={handleChange} className="w-10 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">T:</span>
              <input type="text" name="t" value={formData.t} onChange={handleChange} className="w-10 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Sat:</span>
              <input type="text" name="sat" value={formData.sat} onChange={handleChange} className="w-10 border-b border-gray-300 text-center focus:outline-none print:border-none" />
            </div>
          </div>

          {/* Hallazgos por Sistemas */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Cabeza y cuello:</span>
              <input type="text" name="cabezaCuello" value={formData.cabezaCuello} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Cardiopulmonar:</span>
              <input type="text" name="cardiopulmonar" value={formData.cardiopulmonar} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Abdomen:</span>
              <input type="text" name="abdomen" value={formData.abdomen} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">GU:</span>
              <input type="text" name="gu" value={formData.gu} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Musculoesquelético:</span>
              <input type="text" name="musculoesqueletico" value={formData.musculoesqueletico} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Piel y uñas:</span>
              <input type="text" name="pielUnas" value={formData.pielUnas} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <span className="font-semibold text-gray-700 min-w-[110px]">Neurológico:</span>
              <input type="text" name="neurologico" value={formData.neurologico} onChange={handleChange} className="border-b border-gray-300 flex-1 focus:outline-none print:border-none" />
            </div>
          </div>
        </section>

        {/* IMPRESIÓN DX & RECOMENDACIONES */}
        <section className="mb-4 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1b75bb] min-w-[100px]">Impresión DX:</span>
            <input
              type="text"
              name="impresionDx"
              value={formData.impresionDx}
              onChange={handleChange}
              className="border-b border-gray-300 flex-1 font-medium focus:outline-none print:border-none"
            />
          </div>
          <div>
            <span className="font-bold text-[#1b75bb] block mb-1">Recomendaciones:</span>
            <textarea
              name="recomendaciones"
              rows={3}
              value={formData.recomendaciones}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none print:border-none print:p-0 resize-none"
              placeholder="Escriba las observaciones o recomendaciones..."
            />
          </div>
        </section>

        {/* PIE DE PÁGINA CON INFORMACIÓN DE CONTACTO Y FIRMA */}
        <footer className="mt-6 pt-3 border-t-2 border-[#1b75bb] flex justify-between items-end text-[10px] text-gray-600">
          <div>
            <p className="font-semibold text-gray-800">
              Carrera 49 N° 47 - 13, of. 103 - 106
            </p>
            <p>San Pedro de los Milagros — Calle abajo</p>
            <p className="font-bold text-[#1b75bb] mt-0.5">📱 314 726 2285</p>
          </div>

          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-1"></div>
            <p className="font-bold text-gray-800">Dra. Carolina Londoño M.</p>
            <p>RM: 52878-09</p>
            <p>Médica general - U.P.B.</p>
          </div>
        </footer>
      </div>

      {/* ESTILOS DE IMPRESIÓN REQUERIDOS */}
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
          input, textarea {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}