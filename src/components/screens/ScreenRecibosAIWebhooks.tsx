import React from 'react';
import { LogIntegracionIA, ConfiguracionIA, SocioPadron } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { INITIAL_RECIBOS_CODIGOS } from '../../data/seedData';
import {
  Bot,
  Sparkles,
  FileSearch,
  Send,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  RotateCw,
  Activity,
  Layers,
  ArrowRight,
  Upload,
  Cpu
} from 'lucide-react';

interface ScreenRecibosAIWebhooksProps {
  logsIA: LogIntegracionIA[];
  configIA: ConfiguracionIA;
  socios: SocioPadron[];
  onGuardarConfigIA: (config: ConfiguracionIA) => void;
  onSimularConMargen?: (margenCalculado: number, socio?: SocioPadron) => void;
}

export const ScreenRecibosAIWebhooks: React.FC<ScreenRecibosAIWebhooksProps> = ({
  logsIA,
  configIA,
  socios,
  onGuardarConfigIA,
  onSimularConMargen
}) => {
  const [subTab, setSubTab] = React.useState<'ocr' | 'webhooks' | 'config'>('ocr');

  // --- Estados de Analizador OCR ---
  const [socioSeleccionado, setSocioSeleccionado] = React.useState<SocioPadron | null>(socios[0] || null);
  const [reglaAfectacion, setReglaAfectacion] = React.useState<'35% Neto Ley' | '40% Neto Ley' | '40% Sueldo Bruto'>('35% Neto Ley');
  const [analizandoRecibo, setAnalizandoRecibo] = React.useState(false);
  const [reciboItems, setReciboItems] = React.useState([
    { codigo: '101', concepto: 'Sueldo Básico Categoría (CGE)', monto: 850000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '150', concepto: 'Antigüedad Docente 15 Años', monto: 340000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '160', concepto: 'Adicional Código 029 Función Jerárquica', monto: 180000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '201', concepto: 'Aporte Jubilatorio Ley 8732 (16%)', monto: 219200, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '205', concepto: 'IOSPER Obra Social Provincial (3%)', monto: 41100, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '310', concepto: 'Mutual Modelo Cuota Social', monto: 27400, clasificacion: 'DESCUENTO_PARTICULAR' },
    { codigo: '401', concepto: 'Seguro Colectivo Provincial de Vida', monto: 18000, clasificacion: 'DESCUENTO_PARTICULAR' }
  ]);

  // --- Estados de Webhooks y Consola de Pruebas ---
  const [endpointSeleccionado, setEndpointSeleccionado] = React.useState<
    'consultarMargenSocio' | 'simularAyudaWhatsApp' | 'consultarEstadoTramite' | 'registrarSeguimientoBot'
  >('consultarMargenSocio');
  const [payloadTest, setPayloadTest] = React.useState(
    JSON.stringify({ action: 'consultarMargenSocio', dni: '28456123' }, null, 2)
  );
  const [resultadoTest, setResultadoTest] = React.useState<any>(null);
  const [ejecutandoTest, setEjecutandoTest] = React.useState(false);

  // --- Estados de Configuración ---
  const [formConfig, setFormConfig] = React.useState<ConfiguracionIA>({ ...configIA });
  const [guardadoOk, setGuardadoOk] = React.useState(false);

  // Actualizar payload según endpoint seleccionado
  React.useEffect(() => {
    if (endpointSeleccionado === 'consultarMargenSocio') {
      setPayloadTest(JSON.stringify({ action: 'consultarMargenSocio', dni: socioSeleccionado?.DNI || '28456123' }, null, 2));
    } else if (endpointSeleccionado === 'simularAyudaWhatsApp') {
      setPayloadTest(
        JSON.stringify(
          {
            action: 'simularAyudaWhatsApp',
            dni: socioSeleccionado?.DNI || '28456123',
            montoDeseado: 1200000,
            plazo: 24,
            linea: 'FEDEM Provincial'
          },
          null,
          2
        )
      );
    } else if (endpointSeleccionado === 'consultarEstadoTramite') {
      setPayloadTest(JSON.stringify({ action: 'consultarEstadoTramite', nroMutuo: 'MUT-09412' }, null, 2));
    } else if (endpointSeleccionado === 'registrarSeguimientoBot') {
      setPayloadTest(
        JSON.stringify(
          {
            action: 'registrarSeguimientoBot',
            dni: socioSeleccionado?.DNI || '28456123',
            mensajeCliente: 'Hola, quiero renovar mi préstamo y consultar si tengo margen disponible.',
            canal: 'WhatsApp Bot'
          },
          null,
          2
        )
      );
    }
  }, [endpointSeleccionado, socioSeleccionado]);

  // Totales del Analizador de Recibos
  const totalesRecibo = React.useMemo(() => {
    let haberes = 0;
    let descLey = 0;
    let descPart = 0;

    reciboItems.forEach((it) => {
      if (it.clasificacion === 'HABER_COMPUTABLE') haberes += it.monto;
      else if (it.clasificacion === 'DESCUENTO_LEY') descLey += it.monto;
      else if (it.clasificacion === 'DESCUENTO_PARTICULAR') descPart += it.monto;
    });

    const netoLey = Math.max(0, haberes - descLey);
    let margenMaximo = 0;

    if (reglaAfectacion === '35% Neto Ley') {
      margenMaximo = netoLey * 0.35;
    } else if (reglaAfectacion === '40% Neto Ley') {
      margenMaximo = netoLey * 0.40;
    } else {
      margenMaximo = haberes * 0.40;
    }

    const margenDisponible = Math.max(0, Math.round(margenMaximo - descPart));

    return { haberes, descLey, netoLey, descPart, margenMaximo: Math.round(margenMaximo), margenDisponible };
  }, [reciboItems, reglaAfectacion]);

  const simularAnalisisOCR = () => {
    setAnalizandoRecibo(true);
    setTimeout(() => {
      setAnalizandoRecibo(false);
      alert('✅ Recibo de sueldo procesado con éxito vía Gemini Vision API. Conceptos catalogados conforme normativa provincial de Entre Ríos.');
    }, 1200);
  };

  const ejecutarTestEndpoint = () => {
    setEjecutandoTest(true);
    setTimeout(() => {
      setEjecutandoTest(false);
      try {
        const body = JSON.parse(payloadTest);
        if (body.action === 'consultarMargenSocio') {
          const s = socios.find((soc) => soc.DNI === body.dni) || socios[0];
          setResultadoTest({
            status: 200,
            success: true,
            canal: 'Darwin IA / WhatsApp API',
            timestamp: new Date().toISOString(),
            data: {
              dni: s.DNI,
              apellidoNombre: s.Apellido_Nombre,
              organismo: s.Organismo,
              sueldoNeto: s.Sueldo_Neto,
              margenCuotaDisponible: s.Margen_Cuota_Disponible,
              montoPreaprobadoMaximo: s.Monto_Preaprobado,
              estadoCuotaSocial: s.Estado_Cuota_Social,
              habilitadoParaOperar: s.Bloqueado_Legales === 'NO' && s.Estado_Cuota_Social === 'Al Día'
            }
          });
        } else if (body.action === 'simularAyudaWhatsApp') {
          setResultadoTest({
            status: 200,
            success: true,
            data: {
              linea: body.linea || 'FEDEM Provincial',
              montoSolicitado: body.montoDeseado || 1000000,
              plazoCuotas: body.plazo || 24,
              valorCuotaEstimada: 87400,
              netoEnMano: body.montoDeseado || 1000000,
              mensajeWhatsApp: `¡Hola! Tenemos tu crédito preaprobado en Mutual Modelo en 24 cuotas de $87.400. Liquidación inmediata en tu cuenta BERSA.`
            }
          });
        } else if (body.action === 'consultarEstadoTramite') {
          setResultadoTest({
            status: 200,
            success: true,
            data: {
              nroMutuo: body.nroMutuo || 'MUT-09412',
              estado: 'Liquidado',
              fechaLiquidacion: '2026-11-03',
              montoDepositado: 1500000,
              primerPago: 'Diciembre 2026'
            }
          });
        } else {
          setResultadoTest({
            status: 200,
            success: true,
            data: {
              mensaje: 'Seguimiento registrado exitosamente en Bitácora SLA de la Mutual.',
              idSeguimiento: `SEG-${Date.now().toString().slice(-6)}`,
              operadorAsignado: 'Julian'
            }
          });
        }
      } catch (err: any) {
        setResultadoTest({ status: 400, error: 'JSON malformado o inválido: ' + err.message });
      }
    }, 600);
  };

  const handleGuardarConfiguracion = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarConfigIA(formConfig);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del Módulo */}
      <div className="bg-gradient-to-r from-slate-900 via-[#135596] to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
              Módulo 6
            </span>
            <span className="text-xs text-blue-200 font-mono">
              Gemini Vision OCR • Darwin IA • WhatsApp Webhooks
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            Analizador de Recibos con IA & Webhooks (Darwin / WhatsApp)
          </h1>
          <p className="text-xs text-blue-100/80 mt-0.5">
            Lectura inteligente de haberes, cálculo normativo de márgenes de afectación y pasarela API para bots.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-950/70 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setSubTab('ocr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'ocr'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Analizador OCR</span>
          </button>
          <button
            onClick={() => setSubTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'webhooks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Webhooks & Chatbots</span>
          </button>
          <button
            onClick={() => setSubTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'config'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configuración API</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-VISTA 1: ANALIZADOR OCR DE RECIBOS DE SUELDO */}
      {/* ============================================================== */}
      {subTab === 'ocr' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Lectura Óptica de Haberes & Cálculo de Margen Afectable
                </h2>
                <p className="text-xs text-slate-500">
                  Distingue automáticamente haberes computables, descuentos de ley (Jubilación Ley 8732/IOSPER) y cuotas mutuas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={simularAnalisisOCR}
                  disabled={analizandoRecibo}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analizandoRecibo ? 'animate-spin' : ''}`} />
                  <span>{analizandoRecibo ? 'Procesando con Gemini...' : 'Analizar Recibo Demo'}</span>
                </button>
                {onSimularConMargen && (
                  <button
                    onClick={() => onSimularConMargen(totalesRecibo.margenDisponible, socioSeleccionado || undefined)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2"
                  >
                    <span>Transferir Margen al Simulador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Controles de Entrada */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Socio Asociado:
                </label>
                <select
                  value={socioSeleccionado?.DNI || ''}
                  onChange={(e) => {
                    const s = socios.find((soc) => soc.DNI === e.target.value);
                    if (s) setSocioSeleccionado(s);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  {socios.map((s) => (
                    <option key={s.DNI} value={s.DNI}>
                      {s.Apellido_Nombre} (DNI {s.DNI}) — {s.Organismo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Regla de Afectación Provincial:
                </label>
                <select
                  value={reglaAfectacion}
                  onChange={(e) => setReglaAfectacion(e.target.value as any)}
                  className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="35% Neto Ley">35% Sueldo Neto de Ley (Estándar ER)</option>
                  <option value="40% Neto Ley">40% Sueldo Neto de Ley (Casos Especiales)</option>
                  <option value="40% Sueldo Bruto">40% Sueldo Bruto</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Cargar Imagen / PDF de Recibo:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4 Métricas de Resultado */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Haberes Computables</span>
                <span className="font-mono text-lg font-bold text-slate-800">{formatMonedaAR(totalesRecibo.haberes)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Descuentos de Ley</span>
                <span className="font-mono text-lg font-bold text-slate-800">-{formatMonedaAR(totalesRecibo.descLey)}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Neto de Ley</span>
                <span className="font-mono text-lg font-bold text-blue-900">{formatMonedaAR(totalesRecibo.netoLey)}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Margen Cuota Libre</span>
                <span className="font-mono text-xl font-black text-emerald-700">{formatMonedaAR(totalesRecibo.margenDisponible)}</span>
              </div>
            </div>

            {/* Tabla de Conceptos Desglosados */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Conceptos Leídos del Recibo ({reciboItems.length})</span>
                <span className="text-slate-400 font-normal">Clasificación automática</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Concepto</th>
                    <th className="p-2.5">Clasificación</th>
                    <th className="p-2.5 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reciboItems.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-700">{it.codigo}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{it.concepto}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            it.clasificacion === 'HABER_COMPUTABLE'
                              ? 'bg-blue-100 text-blue-800'
                              : it.clasificacion === 'DESCUENTO_LEY'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {it.clasificacion}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatMonedaAR(it.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-VISTA 2: WEBHOOKS & CONSOLA DE PRUEBAS DE CHATBOTS */}
      {/* ============================================================== */}
      {subTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Consola de Solicitud */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-blue-600" />
                  Simulador de Solicitud Webhook (doPost)
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gateway Activo
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Acción / Endpoint:
                </label>
                <select
                  value={endpointSeleccionado}
                  onChange={(e) => setEndpointSeleccionado(e.target.value as any)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="consultarMargenSocio">consultarMargenSocio (DNI / Afiliado)</option>
                  <option value="simularAyudaWhatsApp">simularAyudaWhatsApp (Cotización en Vivo)</option>
                  <option value="consultarEstadoTramite">consultarEstadoTramite (Seguimiento Mutuo)</option>
                  <option value="registrarSeguimientoBot">registrarSeguimientoBot (Alta de Ticket SLA)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Payload JSON de Entrada:
                </label>
                <textarea
                  rows={7}
                  value={payloadTest}
                  onChange={(e) => setPayloadTest(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-slate-900 text-emerald-400 rounded-xl focus:outline-none"
                />
              </div>

              <button
                onClick={ejecutarTestEndpoint}
                disabled={ejecutandoTest}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${ejecutandoTest ? 'animate-spin' : ''}`} />
                <span>{ejecutandoTest ? 'Ejecutando Webhook...' : 'Ejecutar Solicitud de Prueba'}</span>
              </button>
            </div>

            {/* Consola de Respuesta */}
            <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Respuesta del Webhook (JSON)
                  </span>
                  {resultadoTest && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      HTTP {resultadoTest.status || 200} OK
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs overflow-y-auto max-h-72 p-3 bg-slate-950 rounded-xl text-emerald-300">
                  {resultadoTest ? (
                    <pre>{JSON.stringify(resultadoTest, null, 2)}</pre>
                  ) : (
                    <div className="text-slate-500 italic p-4 text-center">
                      Presione "Ejecutar Solicitud de Prueba" para visualizar la respuesta que recibirá Darwin IA o el bot de WhatsApp.
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>Latencia promedio: <strong>42ms</strong></span>
                <span>Procesado por Google Apps Script V8</span>
              </div>
            </div>
          </div>

          {/* Historial de Logs Recientes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Bitácora de Eventos de Integración ({logsIA.length})</span>
              <span className="text-slate-400 font-normal">Auditoría en tiempo real</span>
            </div>

            <div className="divide-y divide-slate-100">
              {logsIA.map((log) => (
                <div key={log.ID_Log} className="p-3 hover:bg-slate-50 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{log.ID_Log}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.Canal_Agente}
                      </span>
                      <span className="font-semibold text-slate-900">{log.Evento_Accion}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      DNI: {log.DNI_Relacionado || 'N/A'} • {log.Fecha_Hora}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500">{log.Latencia_Ms} ms</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.Estado_Ejecucion === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.Estado_Ejecucion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-VISTA 3: CONFIGURACIÓN DE APIs & CREDENCIALES */}
      {/* ============================================================== */}
      {subTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              Configuración de Pasarela y Credenciales de IA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administre las llaves de acceso para el motor de visión Gemini, Darwin IA y WhatsApp Business API.
            </p>
          </div>

          <form onSubmit={handleGuardarConfiguracion} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Gemini Vision Model:
              </label>
              <input
                type="text"
                value={formConfig.GEMINI_MODEL}
                onChange={(e) => setFormConfig({ ...formConfig, GEMINI_MODEL: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Darwin IA Webhook URL:
              </label>
              <input
                type="url"
                value={formConfig.DARWIN_IA_WEBHOOK_URL}
                onChange={(e) => setFormConfig({ ...formConfig, DARWIN_IA_WEBHOOK_URL: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                WhatsApp API Gateway URL:
              </label>
              <input
                type="url"
                value={formConfig.WHATSAPP_API_URL}
                onChange={(e) => setFormConfig({ ...formConfig, WHATSAPP_API_URL: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Instancia WhatsApp ID:
              </label>
              <input
                type="text"
                value={formConfig.WHATSAPP_INSTANCE_ID}
                onChange={(e) => setFormConfig({ ...formConfig, WHATSAPP_INSTANCE_ID: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {guardadoOk && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Configuración guardada exitosamente.
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Guardar Credenciales
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
