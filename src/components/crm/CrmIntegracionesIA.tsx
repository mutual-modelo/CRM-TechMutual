import React, { useState } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Send,
  Database,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { LogIntegracionIA, ConfiguracionIA } from '../../types/crm';

interface CrmIntegracionesIAProps {
  logsIA: LogIntegracionIA[];
  configIA: ConfiguracionIA;
  onGuardarConfig: (conf: Partial<ConfiguracionIA>) => void;
  onEjecutarPruebaWebhook: () => void;
}

export const CrmIntegracionesIA: React.FC<CrmIntegracionesIAProps> = ({
  logsIA,
  configIA,
  onGuardarConfig,
  onEjecutarPruebaWebhook
}) => {
  const [apiKeyGemini, setApiKeyGemini] = useState<string>(configIA.GEMINI_API_KEY || 'AIzaSyA8941_DEMO_KEY_MUTUAL');
  const [webhookUrl, setWebhookUrl] = useState<string>(configIA.DARWIN_IA_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbx_DEMO/exec');
  const [driveFolderId, setDriveFolderId] = useState<string>('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE220k4');
  const [guardadoToast, setGuardadoToast] = useState<boolean>(false);
  const [webhookEjecutado, setWebhookEjecutado] = useState<boolean>(false);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarConfig({
      GEMINI_API_KEY: apiKeyGemini,
      GEMINI_MODEL: 'gemini-2.5-flash',
      DARWIN_IA_WEBHOOK_URL: webhookUrl
    });
    setGuardadoToast(true);
    setTimeout(() => setGuardadoToast(false), 2500);
  };

  const handleWebhookTest = () => {
    onEjecutarPruebaWebhook();
    setWebhookEjecutado(true);
    setTimeout(() => setWebhookEjecutado(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
          Módulo 8 • Seguridad & API Gateway
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Integraciones IA, Google Apps Script & Auditoría
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Conexión con Gemini Vision para OCR de recibos, Google Drive API para legajos y Webhooks de cobranza.
        </p>
      </div>

      {guardadoToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Configuración de API Gateway guardada correctamente!</span>
        </div>
      )}

      {webhookEjecutado && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>¡Webhook de cobranza de haberes simulado con respuesta HTTP 200 OK!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Credenciales de Integración</h3>
          </div>

          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gemini API Key (Google AI Studio)
              </label>
              <input
                type="password"
                value={apiKeyGemini}
                onChange={(e) => setApiKeyGemini(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Utilizado para OCR inteligente y validación de recibos de haberes provinciales.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Webhook de Liquidación (Google Apps Script / BERSA)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Drive Root Folder ID
              </label>
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Guardar Configuración
              </button>
              <button
                type="button"
                onClick={handleWebhookTest}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Probar Webhook
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Live Audit Logs & Security Traces
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-2 font-mono text-[11px] max-h-72 overflow-y-auto pr-1">
              {logsIA.map((log) => (
                <div key={log.ID_Log} className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>{log.Fecha_Hora}</span>
                    <span className="text-emerald-400 font-bold">{log.Estado_Ejecucion}</span>
                  </div>
                  <p className="text-slate-200 mt-1 font-semibold">{log.Evento_Accion}</p>
                  <p className="text-[10px] text-slate-400 truncate">{log.Canal_Agente} • DNI {log.DNI_Relacionado}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Encriptación TLS 1.3 • HMAC-SHA256</span>
            <span>Nodo Paraná Cloud #1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
