import React from 'react';
import { AyudaEconomica, CesionCartera, LogIntegracionIA, ConfiguracionIA } from '../../types/crm';
import { formatMonedaAR, calcularVPN } from '../../utils/financialCalculations';
import { exportarA_CSV } from '../../utils/exportUtils';
import {
  Layers,
  Sparkles,
  Bot,
  Key,
  MessageSquare,
  ShieldAlert,
  RotateCcw,
  Download,
  CheckSquare,
  Square,
  Activity,
  Send
} from 'lucide-react';

interface ScreenCarterasIAProps {
  ayudas: AyudaEconomica[];
  cesiones: CesionCartera[];
  logsIA: LogIntegracionIA[];
  configIA: ConfiguracionIA;
  onGuardarConfigIA: (config: ConfiguracionIA) => void;
  onAbrirModalCesion: (idsSeleccionados: string[], resumenValuacion: any) => void;
  onRevertirCesion: (idLote: string) => void;
}

export const ScreenCarterasIA: React.FC<ScreenCarterasIAProps> = ({
  ayudas,
  cesiones,
  logsIA,
  configIA,
  onGuardarConfigIA,
  onAbrirModalCesion,
  onRevertirCesion
}) => {
  // Filtros de Cartera
  const [tasaDescuentoMensual, setTasaDescuentoMensual] = React.useState<number>(4.5);
  const [titularidadFiltro, setTitularidadFiltro] = React.useState<'PROPIA' | 'CEDIDA' | 'TODAS'>('PROPIA');
  const [estadoCobranzaFiltro, setEstadoCobranzaFiltro] = React.useState('TODAS');
  const [lineaFiltro, setLineaFiltro] = React.useState('TODAS');
  const [cuotasRestMin, setCuotasRestMin] = React.useState<number>(0);
  const [seleccionados, setSeleccionados] = React.useState<Set<string>>(new Set());

  // Configuración de IA
  const [formIA, setFormIA] = React.useState<ConfiguracionIA>({ ...configIA });
  const [guardadoExito, setGuardadoExito] = React.useState(false);

  // Filtrado de ayudas para cartera
  const creditosFiltrados = React.useMemo(() => {
    return ayudas.filter((ay) => {
      if (ay.Estado_Tramite !== 'Liquidado') return false;
      if (titularidadFiltro === 'PROPIA' && ay.Cartera_Titular !== 'Cartera Propia Mutual') return false;
      if (titularidadFiltro === 'CEDIDA' && ay.Cartera_Titular === 'Cartera Propia Mutual') return false;
      if (estadoCobranzaFiltro !== 'TODAS' && ay.Estado_Cobranza !== estadoCobranzaFiltro) return false;
      if (lineaFiltro !== 'TODAS' && ay.Linea_Ayuda !== lineaFiltro) return false;
      if (ay.Cuotas_Restantes < cuotasRestMin) return false;
      return true;
    });
  }, [ayudas, titularidadFiltro, estadoCobranzaFiltro, lineaFiltro, cuotasRestMin]);

  // Valuación de créditos seleccionados o filtrados
  const valuacion = React.useMemo(() => {
    const tasaDecimal = (Number(tasaDescuentoMensual) || 4.5) / 100;
    const activos = creditosFiltrados.filter((a) => seleccionados.has(a.ID_Ayuda));
    const conjunto = activos.length > 0 ? activos : creditosFiltrados;

    let capitalOriginal = 0;
    let flujoNominal = 0;
    let vpnTotal = 0;

    conjunto.forEach((ay) => {
      capitalOriginal += Number(ay.Monto_Depositado) || 0;
      const vCuota = Number(ay.Valor_Cuota) || 0;
      const nRest = Number(ay.Cuotas_Restantes) || 0;
      const saldoNom = Number(ay.Saldo_Total_Restante) || vCuota * nRest;
      const vpn = calcularVPN(vCuota, nRest, tasaDecimal);

      flujoNominal += saldoNom;
      vpnTotal += vpn;
    });

    const quitaEstimada = Math.max(0, flujoNominal - vpnTotal);

    return {
      cantidad: conjunto.length,
      capitalOriginal,
      flujoNominal,
      vpnTotal: Math.round(vpnTotal),
      quitaEstimada: Math.round(quitaEstimada),
      tasaDescuentoMensual
    };
  }, [creditosFiltrados, seleccionados, tasaDescuentoMensual]);

  const toggleSeleccion = (id: string) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const toggleTodos = () => {
    if (seleccionados.size === creditosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(creditosFiltrados.map((a) => a.ID_Ayuda)));
    }
  };

  const handleExportarCartera = () => {
    const tasaDecimal = (Number(tasaDescuentoMensual) || 4.5) / 100;
    const data = creditosFiltrados.map((ay) => {
      const vpn = Math.round(calcularVPN(ay.Valor_Cuota, ay.Cuotas_Restantes, tasaDecimal));
      return {
        ID_Ayuda: ay.ID_Ayuda,
        DNI: ay.DNI,
        Socio: ay.Apellido_Nombre,
        Linea: ay.Linea_Ayuda,
        Cuotas_Restantes: ay.Cuotas_Restantes,
        Valor_Cuota: ay.Valor_Cuota,
        Saldo_Nominal: ay.Saldo_Total_Restante,
        VPN_Descontado: vpn,
        Titular_Actual: ay.Cartera_Titular
      };
    });
    exportarA_CSV(data, 'Cartera_Valuada_Mutual_Modelo');
  };

  const handleGuardarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarConfigIA(formIA);
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* SECCIÓN 1: FILTROS DE CARTERA Y VALUACIÓN VPN */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-3">
          💼 Consola Multifiltro de Cartera & Valuación de Cesiones (VPN)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Tasa Descuento Mensual (%):
            </label>
            <input
              type="number"
              value={tasaDescuentoMensual}
              onChange={(e) => setTasaDescuentoMensual(Number(e.target.value) || 0)}
              step="0.1"
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono font-bold text-[#135596] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Titularidad Actual:</label>
            <select
              value={titularidadFiltro}
              onChange={(e) => setTitularidadFiltro(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="PROPIA">Cartera Propia Mutual</option>
              <option value="CEDIDA">Cartera Cedida (Terceros)</option>
              <option value="TODAS">Todas las Carteras</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Línea de Ayuda:</label>
            <select
              value={lineaFiltro}
              onChange={(e) => setLineaFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="TODAS">Todas las Líneas</option>
              <option value="FEDEM Provincial">FEDEM Provincial</option>
              <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
              <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Estado Cobranza:</label>
            <select
              value={estadoCobranzaFiltro}
              onChange={(e) => setEstadoCobranzaFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="TODAS">Todos los Estados</option>
              <option value="Al Día">Al Día</option>
              <option value="Mora Temprana">Mora Temprana</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Mínimo Cuotas Restantes:</label>
            <input
              type="number"
              value={cuotasRestMin}
              onChange={(e) => setCuotasRestMin(Number(e.target.value) || 0)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>
        </div>

        {/* 5 KPIS DE VALUACIÓN DE LA CARTERA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Créditos Valuados
            </span>
            <span className="font-mono text-xl font-bold text-slate-800">
              {valuacion.cantidad}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Capital Original
            </span>
            <span className="font-mono text-base font-bold text-slate-700">
              {formatMonedaAR(valuacion.capitalOriginal)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Flujo Nominal Restante
            </span>
            <span className="font-mono text-base font-bold text-purple-700">
              {formatMonedaAR(valuacion.flujoNominal)}
            </span>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Valor Presente Neto (VPN)
            </span>
            <span className="font-mono text-xl font-extrabold text-emerald-700">
              {formatMonedaAR(valuacion.vpnTotal)}
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
              Quita / Descuento Estimado
            </span>
            <span className="font-mono text-base font-bold text-rose-700">
              {formatMonedaAR(valuacion.quitaEstimada)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTodos}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              {seleccionados.size === creditosFiltrados.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{seleccionados.size === creditosFiltrados.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}</span>
            </button>

            <button
              onClick={handleExportarCartera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Cartera CSV</span>
            </button>
          </div>

          <button
            onClick={() => {
              const ids = seleccionados.size > 0 ? Array.from(seleccionados) : creditosFiltrados.map((a) => a.ID_Ayuda);
              onAbrirModalCesion(ids, valuacion);
            }}
            disabled={creditosFiltrados.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition disabled:opacity-50"
          >
            <span>🤝 Ejecutar Cesión de Cartera ({valuacion.cantidad} créditos)</span>
          </button>
        </div>

        {/* Tabla de Créditos Filtrados */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3 text-center">Sel.</th>
                <th className="py-2.5 px-3">ID Ayuda</th>
                <th className="py-2.5 px-3">Socio / DNI</th>
                <th className="py-2.5 px-3">Línea</th>
                <th className="py-2.5 px-3 text-center">Cuotas Rest.</th>
                <th className="py-2.5 px-3 text-right">Valor Cuota</th>
                <th className="py-2.5 px-3 text-right">Saldo Nominal</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">VPN Descontado</th>
                <th className="py-2.5 px-3">Titular Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {creditosFiltrados.map((ay) => {
                const isSelected = seleccionados.has(ay.ID_Ayuda);
                const tasaDecimal = (Number(tasaDescuentoMensual) || 4.5) / 100;
                const vpn = Math.round(calcularVPN(ay.Valor_Cuota, ay.Cuotas_Restantes, tasaDecimal));

                return (
                  <tr
                    key={ay.ID_Ayuda}
                    onClick={() => toggleSeleccion(ay.ID_Ayuda)}
                    className={`hover:bg-blue-50/50 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSeleccion(ay.ID_Ayuda)}
                        className="rounded text-[#135596]"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{ay.ID_Ayuda}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900">{ay.Apellido_Nombre}</div>
                      <div className="text-[11px] text-slate-500 font-mono">DNI {ay.DNI}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{ay.Linea_Ayuda}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{ay.Cuotas_Restantes}</td>
                    <td className="py-2.5 px-3 text-right">{formatMonedaAR(ay.Valor_Cuota)}</td>
                    <td className="py-2.5 px-3 text-right text-purple-700 font-bold">
                      {formatMonedaAR(ay.Saldo_Total_Restante)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-extrabold">
                      {formatMonedaAR(vpn)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ay.Cartera_Titular === 'Cartera Propia Mutual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {ay.Cartera_Titular}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE LOTES CEDIDOS CON REVERSIÓN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
            📜 Historial de Lotes de Cesión de Cartera Formalizados ({cesiones.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">ID Lote</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cesionario / Fideicomiso</th>
                <th className="py-2.5 px-3 text-center">Créditos</th>
                <th className="py-2.5 px-3 text-right">Saldo Nominal</th>
                <th className="py-2.5 px-3 text-right">Precio Acordado</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {cesiones.map((c) => (
                <tr key={c.ID_Lote_Cesion} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{c.ID_Lote_Cesion}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{c.Fecha_Cesion}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                    {c.Cesionario_Entidad_Destino}
                  </td>
                  <td className="py-2.5 px-3 text-center">{c.Cantidad_Creditos_Cedidos}</td>
                  <td className="py-2.5 px-3 text-right">{formatMonedaAR(c.Saldo_Nominal_Cedido)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatMonedaAR(c.Precio_Venta_Cartera)}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.Estado_Cesion === 'Vigente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.Estado_Cesion}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {c.Estado_Cesion === 'Vigente' && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Confirma revertir el lote ${c.ID_Lote_Cesion}? Los créditos volverán a Cartera Propia Mutual.`)) {
                            onRevertirCesion(c.ID_Lote_Cesion);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revertir Lote</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 3: CONSOLA DE IA & BITÁCORA DE LOGS */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              Consola de Integraciones IA (Gemini API, Darwin IA & WhatsApp)
            </h3>
            <p className="text-xs text-slate-500">
              Configuración de endpoints, modelos generativos y tokens para auditoría documental y bots.
            </p>
          </div>
        </div>

        <form onSubmit={handleGuardarConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Gemini API Key (Google AI):
            </label>
            <input
              type="password"
              value={formIA.GEMINI_API_KEY}
              onChange={(e) => setFormIA({ ...formIA, GEMINI_API_KEY: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Darwin IA Webhook URL:
            </label>
            <input
              type="text"
              value={formIA.DARWIN_IA_WEBHOOK_URL}
              onChange={(e) => setFormIA({ ...formIA, DARWIN_IA_WEBHOOK_URL: e.target.value })}
              placeholder="https://api.darwinia.com.ar/webhook"
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              WhatsApp Cloud API Token:
            </label>
            <input
              type="password"
              value={formIA.WHATSAPP_API_TOKEN}
              onChange={(e) => setFormIA({ ...formIA, WHATSAPP_API_TOKEN: e.target.value })}
              placeholder="EAABwz..."
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2">
            {guardadoExito && (
              <span className="text-xs font-semibold text-emerald-700 self-center">
                ¡Configuración guardada exitosamente!
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-bold rounded-md shadow-xs transition"
            >
              Guardar Credenciales de IA
            </button>
          </div>
        </form>

        {/* Bitácora de Logs IA */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight mb-2">
            Bitácora de Eventos y Llamadas IA ({logsIA.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2 px-3">ID Log</th>
                  <th className="py-2 px-3">Fecha/Hora</th>
                  <th className="py-2 px-3">Canal</th>
                  <th className="py-2 px-3">Evento</th>
                  <th className="py-2 px-3">DNI Relacionado</th>
                  <th className="py-2 px-3 text-right">Latencia</th>
                  <th className="py-2 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logsIA.map((l) => (
                  <tr key={l.ID_Log} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-800">{l.ID_Log}</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{l.Fecha_Hora}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-purple-700">{l.Canal_Agente}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{l.Evento_Accion}</td>
                    <td className="py-2 px-3">{l.DNI_Relacionado || '-'}</td>
                    <td className="py-2 px-3 text-right">{l.Latencia_Ms} ms</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {l.Estado_Ejecucion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
