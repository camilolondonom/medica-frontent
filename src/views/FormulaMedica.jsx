// FormulaMedica.jsx
import React, { useState, useEffect } from 'react';

export default function FormulaMedica({ pacienteActivo, user }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [prescripcion, setPrescripcion] = useState('');

  useEffect(() => {
    if (pacienteActivo) {
      setNombre(pacienteActivo.nombreCompleto || '');
      setDocumento(pacienteActivo.documento || '');
    }
  }, [pacienteActivo]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">

      <div className="no-print print:hidden mb-6 flex gap-4">
        <button
          type="button"
          onClick={handlePrint}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>🖨️</span> Imprimir Fórmula
        </button>
      </div>

      <div className="print-area w-[215mm] min-h-[279mm] bg-white p-8 relative flex flex-col justify-between border shadow-lg print:shadow-none print:border-none print:m-0 print:w-full print:h-screen print:p-6">

        {/* Marca de agua: logo del consultorio */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
          <img
            src="/logo-consultorio.png"
            alt=""
            className="w-96 h-96 object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-4">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-sky-500 tracking-wide">
              Dra. Carolina Londoño M.
            </h1>
            <p className="text-sm font-semibold text-sky-400">RM: 52878-09</p>
            <p className="text-sm text-sky-400">Médica general - U.P.B.</p>
          </div>

          <div className="flex items-center my-2">
            <div className="h-1 bg-sky-400 flex-grow rounded-l-full"></div>
            <span className="px-6 py-1 bg-sky-400 text-white font-extrabold text-xl rounded-md uppercase tracking-wider">
              Fórmula médica
            </span>
            <div className="h-1 bg-sky-400 flex-grow rounded-r-full"></div>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 flex flex-col gap-3 print:bg-transparent print:border-none print:p-0">
            <div className="flex items-center gap-2">
              <label className="font-bold text-gray-700 w-28 text-base">Fecha:</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="flex-1 bg-transparent border-b-2 border-gray-400 focus:border-sky-500 outline-none text-gray-800 font-medium px-2 py-1 print:border-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-gray-700 w-28 text-base">Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo del paciente"
                className="flex-1 bg-transparent border-b-2 border-gray-400 focus:border-sky-500 outline-none text-gray-800 font-medium px-2 py-1 print:border-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-gray-700 w-28 text-base">Documento:</label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento de identidad"
                className="flex-1 bg-transparent border-b-2 border-gray-400 focus:border-sky-500 outline-none text-gray-800 font-medium px-2 py-1 print:border-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={prescripcion}
              onChange={(e) => setPrescripcion(e.target.value)}
              placeholder="Escriba aquí los medicamentos, posología e indicaciones..."
              className="w-full h-96 bg-transparent border-none outline-none resize-none text-gray-800 text-lg leading-relaxed font-sans placeholder:text-gray-300 print:placeholder:hidden"
            />
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t-2 border-sky-400">
          <div className="flex justify-between items-end text-xs">

            <div className="flex flex-col gap-1 max-w-[60%]">
              <span className="text-pink-500 font-bold text-sm">
                Conserve su fórmula
              </span>
              <span className="text-pink-500 font-semibold leading-tight">
                Si presenta alguna alergia o intolerancia al medicamento suspender y consultar con su médico.
              </span>
            </div>

            <div className="text-right text-sky-800 font-medium border-l-2 border-gray-300 pl-3">
              <p className="font-bold">Cra. 49 #47-12 int 101</p>
              <p>San Pedro, San Pedro de los Milagros</p>
              <p>Antioquia, Colombia</p>
              <p className="text-sky-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                <span>📱</span> 314 726 2285
              </p>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media print {
          nav, sidebar, header, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          input, textarea {
            border: none !important;
            outline: none !important;
          }
        }
      `}</style>
    </div>
  );
}