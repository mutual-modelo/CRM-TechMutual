import React from 'react';
import { GAS_FILES, GASFile } from '../../data/gasCodeSnippets';
import {
  Code,
  Copy,
  Check,
  Download,
  BookOpen,
  Terminal,
  ExternalLink,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';

export const ScreenDespliegueGAS: React.FC = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = React.useState<GASFile>(GAS_FILES[0]);
  const [copiado, setCopiado] = React.useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(archivoSeleccionado.code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const descargarArchivo = (file: GASFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* HEADER DE DESPLIEGUE */}
      <div className="bg-gradient-to-r from-[#135596] to-purple-800 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arquitectura Oficial V8 — 100% Código de Producción</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Despliegue de los 8 Archivos en Google Apps Script
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
              Guía paso a paso y repositorio completo de código fuente para instalar el CRM & Backoffice Financiero
              directamente en una planilla de Google Sheets y Google Drive con soporte para concurrencia (LockService).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#135596] font-bold text-xs rounded-lg shadow-sm hover:bg-blue-50 transition"
            >
              <span>Abrir Apps Script Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* GUÍA PASO A PASO INTERACTIVA */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#135596]" />
          Instructivo de Instalación y Despliegue en 4 Pasos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 relative">
            <div className="w-6 h-6 rounded-full bg-[#135596] text-white flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h3 className="text-xs font-bold text-slate-800">Crear Hoja en Sheets</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Crea una nueva hoja de cálculo en Google Drive y nómbrala <strong>"AMMER — CRM Financiero"</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 relative">
            <div className="w-6 h-6 rounded-full bg-[#135596] text-white flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h3 className="text-xs font-bold text-slate-800">Abrir Editor Apps Script</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              En el menú superior de Sheets haz clic en <strong>Extensiones &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 relative">
            <div className="w-6 h-6 rounded-full bg-[#135596] text-white flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h3 className="text-xs font-bold text-slate-800">Crear los 8 Archivos</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Copia y pega cada uno de los 8 archivos exactamente con sus nombres (4 archivos <strong>.gs</strong>, 3 archivos <strong>.html</strong> y el <strong>appsscript.json</strong>).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 relative">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
              4
            </div>
            <h3 className="text-xs font-bold text-slate-800">Ejecutar y Desplegar</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ejecuta <code className="text-purple-700 font-mono text-[11px]">asegurarEstructuraBD()</code> para crear las 8 hojas y luego haz clic en <strong>Implementar &gt; Nueva implementación (Web App)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* EXPLORADOR DE CÓDIGO FUENTE DE LOS 8 ARCHIVOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-purple-700" />
              Archivos del Proyecto Google Apps Script ({GAS_FILES.length} archivos)
            </h3>
            <p className="text-xs text-slate-500">
              Seleccione un archivo para previsualizar, copiar al portapapeles o descargarlo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => descargarArchivo(archivoSeleccionado)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar {archivoSeleccionado.name}</span>
            </button>
            <button
              onClick={copiarCodigo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#135596] hover:bg-[#0d3b68] rounded-md shadow-xs transition"
            >
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? '¡Código Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>

        {/* Selector de Archivo en Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-slate-100/60 px-3 pt-2 gap-1">
          {GAS_FILES.map((f) => {
            const isSel = archivoSeleccionado.name === f.name;
            return (
              <button
                key={f.name}
                onClick={() => setArchivoSeleccionado(f)}
                className={`px-3 py-2 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSel
                    ? 'bg-white text-[#135596] border-t-2 border-[#135596] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSel ? 'text-[#135596]' : 'text-slate-400'}`} />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>

        {/* Descripción del Archivo */}
        <div className="px-4 py-2.5 bg-blue-50/50 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <span>{archivoSeleccionado.description}</span>
          <span className="font-mono text-[11px] text-slate-400">
            {archivoSeleccionado.code.split('\n').length} líneas
          </span>
        </div>

        {/* Visor de Código */}
        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed selection:bg-blue-600">
            <code>{archivoSeleccionado.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
