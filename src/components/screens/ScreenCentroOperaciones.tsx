import React from 'react';
import {
  AyudaEconomica,
  SeguimientoAlerta,
  EstadoAlerta,
  OperadorMutual,
  EstadoTramite
} from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { exportarA_CSV } from '../../utils/exportUtils';
import { OPERADORES_MUTUAL_LISTA } from '../../data/seedData';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  CalendarDays,
  Send,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ScreenCentroOperacionesProps {
  ayudas: AyudaEconomica[];
  seguimientos: SeguimientoAlerta[];
  onActualizarEstadoAlerta: (idSeguimiento: string, nuevoEstado: EstadoAlerta, resultado?: string) => void;
  onAgregarEtapaGestion?: (idSeguimiento: string, etapa: { accion: string; detalle: string; resultado?: string; nuevoEstado: EstadoAlerta }) => void;
  onCancelarAlerta?: (idSeguimiento: string) => void;
  onActualizarEstadoAyuda?: (idAyuda: string, nuevoEstado: EstadoTramite) => void;
  onNuevaAlerta: () => void;
  onVerSocio?: (dni: string) => void;
}

export const ScreenCentroOperaciones: React.FC<ScreenCentroOperacionesProps> = ({
  ayudas,
  seguimientos,
  onActualizarEstadoAlerta,
  onAgregarEtapaGestion,
  onCancelarAlerta,
  onActualizarEstadoAyuda,
  onNuevaAlerta,
  onVerSocio
}) => {
  const [subTab, setSubTab] = React.useState<'alertas' | 'liquidaciones' | 'planillas' | 'tramites'>('alertas');

  // --- Modal de Historial y Nueva Etapa de Gestión ---
  const [alertaParaHistorial, setAlertaParaHistorial] = React.useState<SeguimientoAlerta | null>(null);
  const [modalNuevaEtapa, setModalNuevaEtapa] = React.useState<SeguimientoAlerta | null>(null);
  const [formEtapaAccion, setFormEtapaAccion] = React.useState('Contacto telefónico');
  const [formEtapaDetalle, setFormEtapaDetalle] = React.useState('');
  const [formEtapaResultado, setFormEtapaResultado] = React.useState('');
  const [formEtapaEstado, setFormEtapaEstado] = React.useState<EstadoAlerta>('En Gestión');

  // --- Estados de Filtros para Alertas SLA ---
  const [filtroTextoAlertas, setFiltroTextoAlertas] = React.useState('');
  const [filtroSLA, setFiltroSLA] = React.useState('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = React.useState('TODOS');
  const [filtroOperadorAlertas, setFiltroOperadorAlertas] = React.useState('TODOS');

  // --- Estados de Filtros para Liquidaciones de Tesorería ---
  const [criterioFecha, setCriterioFecha] = React.useState<'Fecha_Liquidacion' | 'Fecha_Solicitud'>('Fecha_Liquidacion');
  const [fechaDesde, setFechaDesde] = React.useState('2026-10-01');
  const [fechaHasta, setFechaHasta] = React.useState('2026-11-30');
  const [lineaFiltro, setLineaFiltro] = React.useState('TODAS');
  const [originacionFiltro, setOriginacionFiltro] = React.useState('TODAS');
  const [operadorLiquidacionFiltro, setOperadorLiquidacionFiltro] = React.useState('TODOS');

  // --- KPIs y Filtrado de Alertas SLA ---
  const kpisAlertas = React.useMemo(() => {
    let vencidas = 0;
    let hoy = 0;
    let proximas = 0;
    let resueltas = 0;

    seguimientos.forEach((s) => {
      if (s.Estado_Alerta === 'Resuelta') {
        resueltas++;
      } else if (s.estadoTemporalAlerta === 'VENCIDA') {
        vencidas++;
      } else if (s.estadoTemporalAlerta === 'VENCE_HOY') {
        hoy++;
      } else {
        proximas++;
      }
    });

    return { vencidas, hoy, proximas, resueltas };
  }, [seguimientos]);

  const alertasFiltradas = React.useMemo(() => {
    return seguimientos.filter((s) => {
      if (filtroTextoAlertas.trim()) {
        const q = filtroTextoAlertas.toLowerCase();
        const coincide =
          s.Apellido_Nombre.toLowerCase().includes(q) ||
          s.DNI.includes(q) ||
          s.Subtipo_Tramite.toLowerCase().includes(q) ||
          s.Detalle_Gestion.toLowerCase().includes(q);
        if (!coincide) return false;
      }
      if (filtroSLA !== 'TODOS') {
        if (filtroSLA === 'VENCIDA' && (s.Estado_Alerta === 'Resuelta' || s.estadoTemporalAlerta !== 'VENCIDA')) return false;
        if (filtroSLA === 'VENCE_HOY' && (s.Estado_Alerta === 'Resuelta' || s.estadoTemporalAlerta !== 'VENCE_HOY')) return false;
        if (filtroSLA === 'PROXIMA' && (s.Estado_Alerta === 'Resuelta' || s.estadoTemporalAlerta !== 'PROXIMA')) return false;
        if (filtroSLA === 'RESUELTA' && s.Estado_Alerta !== 'Resuelta') return false;
      }
      if (filtroPrioridad !== 'TODOS' && s.Prioridad !== filtroPrioridad) return false;
      if (filtroOperadorAlertas !== 'TODOS' && s.Operador_Asignado !== filtroOperadorAlertas) return false;
      return true;
    });
  }, [seguimientos, filtroTextoAlertas, filtroSLA, filtroPrioridad, filtroOperadorAlertas]);

  // --- Filtrado y KPIs de Liquidaciones de Tesorería ---
  const liquidacionesFiltradas = React.useMemo(() => {
    return ayudas.filter((ay) => {
      const f = ay[criterioFecha] || '';
      if (f < fechaDesde || f > fechaHasta) return false;
      if (lineaFiltro !== 'TODAS' && ay.Linea_Ayuda !== lineaFiltro) return false;
      if (originacionFiltro !== 'TODAS' && ay.Originacion !== originacionFiltro) return false;
      if (operadorLiquidacionFiltro !== 'TODOS' && ay.Operador !== operadorLiquidacionFiltro) return false;
      return true;
    });
  }, [ayudas, criterioFecha, fechaDesde, fechaHasta, lineaFiltro, originacionFiltro, operadorLiquidacionFiltro]);

  const kpisLiquidaciones = React.useMemo(() => {
    let cant = liquidacionesFiltradas.length;
    let solicitado = 0;
    let depositado = 0;
    let retenido = 0;
    let neto = 0;
    let totalDevolver = 0;

    const desgloseLineas: Record<string, number> = {};

    liquidacionesFiltradas.forEach((ay) => {
      solicitado += Number(ay.Monto_Solicitado) || 0;
      depositado += Number(ay.Monto_Depositado) || 0;
      retenido += Number(ay.Monto_Retenido_Refi) || 0;
      neto += Number(ay.Neto_Efectivo_Entregado) || 0;
      totalDevolver += Number(ay.Total_A_Devolver) || 0;

      desgloseLineas[ay.Linea_Ayuda] = (desgloseLineas[ay.Linea_Ayuda] || 0) + (Number(ay.Monto_Depositado) || 0);
    });

    return { cant, solicitado, depositado, retenido, neto, totalDevolver, desgloseLineas };
  }, [liquidacionesFiltradas]);

  const handleExportCSV = () => {
    const exportData = liquidacionesFiltradas.map((ay) => ({
      ID_Ayuda: ay.ID_Ayuda,
      Nro_Mutuo: ay.Nro_Mutuo,
      Fecha: ay[criterioFecha],
      DNI: ay.DNI,
      Socio: ay.Apellido_Nombre,
      Linea: ay.Linea_Ayuda,
      Monto_Solicitado: ay.Monto_Solicitado,
      Monto_Depositado: ay.Monto_Depositado,
      Monto_Retenido_Refinanciacion: ay.Monto_Retenido_Refi,
      Neto_Efectivo_Entregado: ay.Neto_Efectivo_Entregado,
      Cantidad_Cuotas: ay.Cantidad_Cuotas,
      Valor_Cuota: ay.Valor_Cuota,
      Total_A_Devolver: ay.Total_A_Devolver,
      Estado_Tramite: ay.Estado_Tramite,
      Originacion: ay.Originacion,
      Comercializador: ay.Nombre_Comercializador || 'Orgánica',
      Operador: ay.Operador
    }));
    exportarA_CSV(exportData, `Liquidaciones_Mutual_Modelo_${fechaDesde}_al_${fechaHasta}`);
  };

  const handleImprimirPlanilla = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del Módulo Unificado */}
      <div className="bg-gradient-to-r from-slate-900 via-[#135596] to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
              Módulo 3 • Unificado
            </span>
            <span className="text-xs text-blue-200 font-mono">
              SLA & Tesorería Central
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            Centro de Operaciones, Alertas SLA y Liquidaciones de Tesorería
          </h1>
          <p className="text-xs text-blue-100/80 mt-0.5">
            Gestión coordinada de bitácora SLA, auditoría de mora, conciliación de pagos y balances de tesorería.
          </p>
        </div>

        {/* Sub-navegación tipo tabs */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-700/80 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setSubTab('alertas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'alertas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas SLA ({seguimientos.filter((s) => s.Estado_Alerta !== 'Resuelta').length})</span>
          </button>
          <button
            onClick={() => setSubTab('liquidaciones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'liquidaciones'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Liquidaciones ({liquidacionesFiltradas.length})</span>
          </button>
          <button
            onClick={() => setSubTab('planillas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'planillas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Planillas & Exportación</span>
          </button>
          <button
            onClick={() => setSubTab('tramites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'tramites'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flujo de Trámites ({ayudas.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA 1: BITÁCORA DE SEGUIMIENTOS & ALERTAS SLA */}
      {/* ============================================================== */}
      {subTab === 'alertas' && (
        <div className="space-y-4">
          {/* 4 Tarjetas semáforo de SLA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              onClick={() => setFiltroSLA('VENCIDA')}
              className={`bg-rose-50 border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                filtroSLA === 'VENCIDA' ? 'border-rose-600 ring-2 ring-rose-400' : 'border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-tight">
                  Alertas Vencidas (SLA)
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-extrabold text-rose-700 font-mono mt-1">
                {kpisAlertas.vencidas}
              </div>
              <span className="text-[11px] text-rose-600">Requieren gestión inmediata</span>
            </div>

            <div
              onClick={() => setFiltroSLA('VENCE_HOY')}
              className={`bg-amber-50 border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                filtroSLA === 'VENCE_HOY' ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-tight">
                  Vencen Hoy
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-700 font-mono mt-1">
                {kpisAlertas.hoy}
              </div>
              <span className="text-[11px] text-amber-600">Contacto prioritario del día</span>
            </div>

            <div
              onClick={() => setFiltroSLA('PROXIMA')}
              className={`bg-blue-50 border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                filtroSLA === 'PROXIMA' ? 'border-blue-600 ring-2 ring-blue-400' : 'border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-tight">
                  Próximos Vencimientos
                </span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-blue-700 font-mono mt-1">
                {kpisAlertas.proximas}
              </div>
              <span className="text-[11px] text-blue-600">En plazo reglamentario</span>
            </div>

            <div
              onClick={() => setFiltroSLA('RESUELTA')}
              className={`bg-emerald-50 border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                filtroSLA === 'RESUELTA' ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">
                  Gestiones Resueltas
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">
                {kpisAlertas.resueltas}
              </div>
              <span className="text-[11px] text-emerald-600">Historial cerrado con éxito</span>
            </div>
          </div>

          {/* Filtros y Acción Nueva Alerta */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="Filtrar por Socio, DNI o trámite..."
                    value={filtroTextoAlertas}
                    onChange={(e) => setFiltroTextoAlertas(e.target.value)}
                    className="w-full py-1.5 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={filtroSLA}
                  onChange={(e) => setFiltroSLA(e.target.value)}
                  className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="TODOS">Todos los Estados SLA</option>
                  <option value="VENCIDA">⚠️ Vencidas</option>
                  <option value="VENCE_HOY">⏰ Vence Hoy</option>
                  <option value="PROXIMA">📅 Próximas</option>
                  <option value="RESUELTA">✅ Resueltas</option>
                </select>

                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="TODOS">Todas las Prioridades</option>
                  <option value="Urgente">🔴 Urgente</option>
                  <option value="Alta">🟠 Alta</option>
                  <option value="Media">🟡 Media</option>
                  <option value="Baja">🟢 Baja</option>
                </select>

                <select
                  value={filtroOperadorAlertas}
                  onChange={(e) => setFiltroOperadorAlertas(e.target.value)}
                  className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="TODOS">Todos los Operadores</option>
                  {OPERADORES_MUTUAL_LISTA.map((op) => (
                    <option key={op} value={op}>
                      👤 {op}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onNuevaAlerta}
                className="w-full md:w-auto px-4 py-2 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>+ Registrar Nueva Alerta</span>
              </button>
            </div>
          </div>

          {/* Lista de Alertas / Bitácora */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Bitácora de Alertas y Gestiones ({alertasFiltradas.length} registros)</span>
              <span className="text-slate-400 font-normal">Actualización automática por SLA</span>
            </div>

            <div className="divide-y divide-slate-100">
              {alertasFiltradas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron alertas o seguimientos con los filtros seleccionados.
                </div>
              ) : (
                alertasFiltradas.map((al) => {
                  const esVencida = al.estadoTemporalAlerta === 'VENCIDA' && al.Estado_Alerta !== 'Resuelta';
                  const esHoy = al.estadoTemporalAlerta === 'VENCE_HOY' && al.Estado_Alerta !== 'Resuelta';

                  return (
                    <div
                      key={al.ID_Seguimiento}
                      className={`p-4 transition hover:bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        esVencida
                          ? 'border-l-4 border-l-rose-500 bg-rose-50/20'
                          : esHoy
                          ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                          : al.Estado_Alerta === 'Resuelta'
                          ? 'border-l-4 border-l-emerald-500 opacity-70'
                          : 'border-l-4 border-l-blue-500'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {al.ID_Seguimiento}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              al.Prioridad === 'Urgente'
                                ? 'bg-rose-100 text-rose-800'
                                : al.Prioridad === 'Alta'
                                ? 'bg-amber-100 text-amber-800'
                                : al.Prioridad === 'Media'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Prioridad {al.Prioridad}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {al.Apellido_Nombre}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            (DNI {al.DNI})
                          </span>
                          {al.ID_Ayuda_Relacionada && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Mutuo: {al.ID_Ayuda_Relacionada}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-700">
                          <strong className="text-slate-900">{al.Subtipo_Tramite}:</strong>{' '}
                          {al.Detalle_Gestion}
                        </div>

                        {al.Resultado_Proximo_Paso && (
                          <div className="text-[11px] text-slate-600 bg-slate-100/70 p-2 rounded border border-slate-200">
                            <strong>Próximo Paso:</strong> {al.Resultado_Proximo_Paso}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>
                            📅 Vence SLA: <strong>{al.Fecha_Vencimiento_Alerta}</strong>
                          </span>
                          <span>
                            👤 Asignado a: <strong>{al.Operador_Asignado}</strong>
                          </span>
                          {al.Notificado_WhatsApp === 'SI' && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Send className="w-3 h-3" /> WhatsApp Enviado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción sobre la Alerta */}
                      <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                        {onVerSocio && (
                          <button
                            onClick={() => onVerSocio(al.DNI)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Ver ficha del socio"
                          >
                            Ver Ficha
                          </button>
                        )}

                        {/* Botón Ver Historial Auditado de Etapas */}
                        <button
                          onClick={() => setAlertaParaHistorial(al)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer flex items-center gap-1"
                          title="Ver historial de gestiones de este trámite"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Historial</span>
                        </button>

                        {/* Botón Agregar Nueva Etapa de Gestión */}
                        <button
                          onClick={() => {
                            setModalNuevaEtapa(al);
                            setFormEtapaAccion('Contacto telefónico');
                            setFormEtapaDetalle('');
                            setFormEtapaResultado('');
                            setFormEtapaEstado('En Gestión');
                          }}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer flex items-center gap-1"
                          title="Agregar nueva etapa o avance a este trámite"
                        >
                          <span>+ Etapa</span>
                        </button>

                        {al.Estado_Alerta !== 'Resuelta' && al.Estado_Alerta !== 'Cancelada' ? (
                          <>
                            <button
                              onClick={() => {
                                const obs = window.prompt(
                                  'Ingrese el resultado de la gestión o próximo paso:',
                                  'Contacto telefónico exitoso. Cuota regularizada.'
                                );
                                if (obs !== null) {
                                  onActualizarEstadoAlerta(al.ID_Seguimiento, 'Resuelta', obs);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Resolver</span>
                            </button>
                            <button
                              onClick={() => {
                                const nuevoDetalle = window.prompt(
                                  'Reprogramar seguimiento - Ingrese nueva observación:',
                                  al.Resultado_Proximo_Paso || 'Reintentar en 48hs.'
                                );
                                if (nuevoDetalle !== null) {
                                  onActualizarEstadoAlerta(al.ID_Seguimiento, 'Reprogramada', nuevoDetalle);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reprogramar</span>
                            </button>
                          </>
                        ) : al.Estado_Alerta === 'Resuelta' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Resuelta
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            Cancelada
                          </span>
                        )}

                        {/* Botón Cancelar / Eliminar Alerta */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Está seguro de cancelar/eliminar la alerta ${al.ID_Seguimiento} de ${al.Apellido_Nombre}?`)) {
                              if (onCancelarAlerta) {
                                onCancelarAlerta(al.ID_Seguimiento);
                              } else {
                                onActualizarEstadoAlerta(al.ID_Seguimiento, 'Cancelada', 'Alerta cancelada por el operador.');
                              }
                            }
                          }}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          title="Cancelar o eliminar este seguimiento"
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: TABLERO DE LIQUIDACIONES DE TESORERÍA */}
      {/* ============================================================== */}
      {subTab === 'liquidaciones' && (
        <div className="space-y-4">
          {/* Filtros de Rango de Fechas y Líneas */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Conciliación y Liquidaciones por Período
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV Excel</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Criterio Fecha:</label>
                <select
                  value={criterioFecha}
                  onChange={(e) => setCriterioFecha(e.target.value as any)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                >
                  <option value="Fecha_Liquidacion">Fecha de Liquidación</option>
                  <option value="Fecha_Solicitud">Fecha de Solicitud</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Línea:</label>
                <select
                  value={lineaFiltro}
                  onChange={(e) => setLineaFiltro(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                >
                  <option value="TODAS">Todas las Líneas</option>
                  <option value="FEDEM Provincial">FEDEM Provincial</option>
                  <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
                  <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Operador / Canal:</label>
                <select
                  value={operadorLiquidacionFiltro}
                  onChange={(e) => setOperadorLiquidacionFiltro(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#135596]"
                >
                  <option value="TODOS">Todos los Operadores</option>
                  {OPERADORES_MUTUAL_LISTA.map((op) => (
                    <option key={op} value={op}>
                      👤 {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 6 Tarjetas KPI de Tesorería */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
                Operaciones
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {kpisLiquidaciones.cant}
              </div>
              <span className="text-[10px] text-slate-400">Total en período</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
                Total Solicitado
              </span>
              <div className="text-lg font-black text-slate-900 font-mono mt-1 truncate">
                {formatMonedaAR(kpisLiquidaciones.solicitado)}
              </div>
              <span className="text-[10px] text-slate-400">Bruto formal</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/30">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-tight block">
                Total Depositado
              </span>
              <div className="text-lg font-black text-blue-700 font-mono mt-1 truncate">
                {formatMonedaAR(kpisLiquidaciones.depositado)}
              </div>
              <span className="text-[10px] text-blue-600">Monto originado</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/30">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight block">
                Retenido Refinanciación
              </span>
              <div className="text-lg font-black text-amber-700 font-mono mt-1 truncate">
                {formatMonedaAR(kpisLiquidaciones.retenido)}
              </div>
              <span className="text-[10px] text-amber-600">Deudas consolidadas</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-xs bg-emerald-50/40">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-tight block">
                Neto Efectivo en Mano
              </span>
              <div className="text-lg font-black text-emerald-700 font-mono mt-1 truncate">
                {formatMonedaAR(kpisLiquidaciones.neto)}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Transferido a socios</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs bg-purple-50/30">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-tight block">
                Total a Cobrar
              </span>
              <div className="text-lg font-black text-purple-700 font-mono mt-1 truncate">
                {formatMonedaAR(kpisLiquidaciones.totalDevolver)}
              </div>
              <span className="text-[10px] text-purple-600">Capital + Intereses</span>
            </div>
          </div>

          {/* Tabla Detallada de Liquidaciones */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Detalle de Movimientos de Tesorería ({liquidacionesFiltradas.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Período: {fechaDesde} al {fechaHasta}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mutuo / Fecha</th>
                    <th className="py-2.5 px-3">Socio & DNI</th>
                    <th className="py-2.5 px-3">Línea</th>
                    <th className="py-2.5 px-3 text-right">Solicitado</th>
                    <th className="py-2.5 px-3 text-right">Depositado</th>
                    <th className="py-2.5 px-3 text-right text-amber-700">Ret. Refi</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">Neto en Mano</th>
                    <th className="py-2.5 px-3 text-center">Plazo</th>
                    <th className="py-2.5 px-3 text-right">Cuota</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liquidacionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        No hay liquidaciones en el rango seleccionado.
                      </td>
                    </tr>
                  ) : (
                    liquidacionesFiltradas.map((ay) => (
                      <tr key={ay.ID_Ayuda} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-blue-700 block">
                            {ay.Nro_Mutuo}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ay[criterioFecha]}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                            {ay.Apellido_Nombre}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            DNI {ay.DNI}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {ay.Linea_Ayuda}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {formatMonedaAR(ay.Monto_Solicitado)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-900">
                          {formatMonedaAR(ay.Monto_Depositado)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-semibold">
                          {ay.Monto_Retenido_Refi > 0 ? formatMonedaAR(ay.Monto_Retenido_Refi) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                          {formatMonedaAR(ay.Neto_Efectivo_Entregado)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {ay.Cantidad_Cuotas} ctas
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {formatMonedaAR(ay.Valor_Cuota)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ay.Estado_Tramite === 'Liquidado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ay.Estado_Tramite === 'Aprobado'
                                ? 'bg-blue-100 text-blue-800'
                                : ay.Estado_Tramite === 'Cancelado por Refinanciación'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ay.Estado_Tramite}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          👤 {ay.Operador}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: PLANILLAS DE PAGO OFICIALES & IMPRESIÓN */}
      {/* ============================================================== */}
      {subTab === 'planillas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Planilla Oficial de Pagos & Balance de Egresos de Tesorería
              </h3>
              <p className="text-xs text-slate-500">
                Diseño optimizado para impresión y archivo institucional con sello de Tesorería y Presidencia.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImprimirPlanilla}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Planilla Oficial</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>CSV Excel</span>
              </button>
            </div>
          </div>

          {/* Plantilla Impresa (Se adapta vía @media print) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md printable-area space-y-6">
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="./logo.jpg" alt="Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Asociación Mutual Modelo de Entre Ríos
                  </h2>
                  <p className="text-xs text-slate-600">
                    Matrícula INAES E.R. 204 • CUIT 30-68219482-1 • Paraná, Entre Ríos
                  </p>
                  <p className="text-xs font-bold text-blue-900 mt-1">
                    TESORERÍA GENERAL — ORDEN DE PAGO Y RENDICIÓN DE AYUDAS ECONÓMICAS
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p>
                  <strong>Período:</strong> {fechaDesde} al {fechaHasta}
                </p>
                <p>
                  <strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-AR')}
                </p>
                <p className="font-mono text-slate-500">OP-TES-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>

            {/* Resumen Contable */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Total Operaciones:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {kpisLiquidaciones.cant} mutuos
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Monto Total Liquidado:</span>
                <span className="text-base font-bold font-mono text-blue-800">
                  {formatMonedaAR(kpisLiquidaciones.depositado)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Retenciones Refi:</span>
                <span className="text-base font-bold font-mono text-amber-700">
                  {formatMonedaAR(kpisLiquidaciones.retenido)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Neto Efectivo Desembolsado:</span>
                <span className="text-base font-bold font-mono text-emerald-700">
                  {formatMonedaAR(kpisLiquidaciones.neto)}
                </span>
              </div>
            </div>

            {/* Tabla para la Planilla */}
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-200/80 text-slate-800">
                <tr>
                  <th className="p-2 border-b">N° Mutuo</th>
                  <th className="p-2 border-b">Asociado</th>
                  <th className="p-2 border-b">DNI</th>
                  <th className="p-2 border-b">Línea</th>
                  <th className="p-2 border-b text-right">Monto Bruto</th>
                  <th className="p-2 border-b text-right">Ret. Refinanciación</th>
                  <th className="p-2 border-b text-right font-bold">Neto a Pagar</th>
                  <th className="p-2 border-b">Firma de Conformidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {liquidacionesFiltradas.map((ay) => (
                  <tr key={ay.ID_Ayuda}>
                    <td className="p-2 font-mono font-bold">{ay.Nro_Mutuo}</td>
                    <td className="p-2">{ay.Apellido_Nombre}</td>
                    <td className="p-2 font-mono">{ay.DNI}</td>
                    <td className="p-2">{ay.Linea_Ayuda}</td>
                    <td className="p-2 text-right font-mono">{formatMonedaAR(ay.Monto_Depositado)}</td>
                    <td className="p-2 text-right font-mono text-amber-800">
                      {ay.Monto_Retenido_Refi > 0 ? formatMonedaAR(ay.Monto_Retenido_Refi) : '-'}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-800">
                      {formatMonedaAR(ay.Neto_Efectivo_Entregado)}
                    </td>
                    <td className="p-2 border-b text-slate-300">
                      _______________________
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Firmas de Autoridad */}
            <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold">
                  Tesorero General
                </div>
                <span className="text-slate-500">Mutual Modelo E.R.</span>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold">
                  Auditoría Interna / Fiscalización
                </div>
                <span className="text-slate-500">Cumplimiento INAES</span>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold">
                  Presidente del Consejo Directivo
                </div>
                <span className="text-slate-500">Mutual Modelo E.R.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 4: FLUJO DE TRÁMITES & ESTADOS DE AYUDAS */}
      {/* ============================================================== */}
      {subTab === 'tramites' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(['Solicitado', 'En Evaluación', 'Aprobado', 'Liquidado'] as EstadoTramite[]).map((estado) => {
              const ayudasEnEstado = ayudas.filter((a) => a.Estado_Tramite === estado);
              const totalMonto = ayudasEnEstado.reduce((acc, curr) => acc + (curr.Monto_Depositado || 0), 0);

              return (
                <div key={estado} className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
                    <span className="text-xs font-bold text-slate-800">{estado}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {ayudasEnEstado.length}
                    </span>
                  </div>

                  <div className="p-2 text-[11px] text-slate-500 font-mono bg-slate-50/30 border-b border-slate-100 px-3">
                    Total: <strong>{formatMonedaAR(totalMonto)}</strong>
                  </div>

                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                    {ayudasEnEstado.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs italic">
                        Sin trámites en esta etapa
                      </div>
                    ) : (
                      ayudasEnEstado.map((ay) => (
                        <div
                          key={ay.ID_Ayuda}
                          className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-sm transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-700">
                              {ay.Nro_Mutuo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ay.Fecha_Solicitud}
                            </span>
                          </div>

                          <div className="font-bold text-xs text-slate-900 truncate">
                            {ay.Apellido_Nombre}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between">
                            <span>DNI {ay.DNI}</span>
                            <span className="font-semibold text-slate-700">{ay.Linea_Ayuda}</span>
                          </div>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Monto:</span>
                            <span className="font-bold font-mono text-slate-900">
                              {formatMonedaAR(ay.Monto_Depositado)}
                            </span>
                          </div>

                          {ay.Monto_Retenido_Refi > 0 && (
                            <div className="flex items-center justify-between text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                              <span>Refinanciación:</span>
                              <span>-{formatMonedaAR(ay.Monto_Retenido_Refi)}</span>
                            </div>
                          )}

                          {onActualizarEstadoAyuda && (
                            <div className="pt-2 flex items-center justify-end gap-1">
                              {estado === 'Solicitado' && (
                                <button
                                  onClick={() => onActualizarEstadoAyuda(ay.ID_Ayuda, 'En Evaluación')}
                                  className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded font-medium hover:bg-amber-600 transition"
                                >
                                  Pasar a Evaluación
                                </button>
                              )}
                              {estado === 'En Evaluación' && (
                                <button
                                  onClick={() => onActualizarEstadoAyuda(ay.ID_Ayuda, 'Aprobado')}
                                  className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                                >
                                  Aprobar Trámite
                                </button>
                              )}
                              {estado === 'Aprobado' && (
                                <button
                                  onClick={() => onActualizarEstadoAyuda(ay.ID_Ayuda, 'Liquidado')}
                                  className="text-[10px] px-2 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition"
                                >
                                  Liquidar en BERSA
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: HISTORIAL AUDITADO DE GESTIONES / ETAPAS DE LA ALERTA */}
      {/* ============================================================== */}
      {alertaParaHistorial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {alertaParaHistorial.ID_Seguimiento}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Historial de Gestiones y Etapas
                </h3>
                <p className="text-xs text-slate-500">
                  {alertaParaHistorial.Apellido_Nombre} (DNI {alertaParaHistorial.DNI})
                </p>
              </div>
              <button
                onClick={() => setAlertaParaHistorial(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Listado Cronológico de Etapas */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Etapa inicial */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-bold text-slate-700">Etapa 1 • Apertura</span>
                  <span>{alertaParaHistorial.Fecha_Hora}</span>
                </div>
                <div className="font-semibold text-slate-900">{alertaParaHistorial.Subtipo_Tramite}</div>
                <p className="text-slate-600">{alertaParaHistorial.Detalle_Gestion}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  Operador Creador: {alertaParaHistorial.Operador_Creador}
                </div>
              </div>

              {/* Etapas subsecuentes parseadas */}
              {alertaParaHistorial.Historial_Gestiones_JSON ? (
                (() => {
                  try {
                    const etapas = JSON.parse(alertaParaHistorial.Historial_Gestiones_JSON);
                    return etapas.map((etapa: any, idx: number) => (
                      <div key={etapa.idEtapa || idx} className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-blue-700 font-bold">
                          <span>Etapa {idx + 2} • {etapa.accion}</span>
                          <span className="text-slate-400 font-normal">{etapa.fechaHora}</span>
                        </div>
                        <p className="text-slate-700">{etapa.detalle}</p>
                        {etapa.resultado && (
                          <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-blue-100">
                            <strong>Resultado:</strong> {etapa.resultado}
                          </div>
                        )}
                        <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-blue-100/60">
                          <span>Operador: {etapa.operador}</span>
                          <span className="font-bold text-blue-800">Estado: {etapa.nuevoEstado}</span>
                        </div>
                      </div>
                    ));
                  } catch {
                    return null;
                  }
                })()
              ) : (
                <div className="text-center py-2 text-xs text-slate-400 italic">
                  Aún no se han registrado etapas adicionales para este trámite.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAlertaParaHistorial(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: AGREGAR NUEVA ETAPA DE GESTIÓN A UN TRÁMITE */}
      {/* ============================================================== */}
      {modalNuevaEtapa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {modalNuevaEtapa.ID_Seguimiento}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Registrar Nueva Etapa de Gestión
                </h3>
                <p className="text-xs text-slate-500">
                  {modalNuevaEtapa.Apellido_Nombre} (DNI {modalNuevaEtapa.DNI})
                </p>
              </div>
              <button
                onClick={() => setModalNuevaEtapa(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Acción Realizada:</label>
                <select
                  value={formEtapaAccion}
                  onChange={(e) => setFormEtapaAccion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Contacto telefónico">Contacto telefónico</option>
                  <option value="Envío mensaje WhatsApp">Envío mensaje WhatsApp</option>
                  <option value="Recepción de documentación">Recepción de documentación</option>
                  <option value="Verificación CBU / Banco">Verificación CBU / Banco</option>
                  <option value="Acuerdo de pago">Acuerdo de pago</option>
                  <option value="Auditoría legal">Auditoría legal</option>
                  <option value="Otro avance">Otro avance</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detalle de la Gestión Realizada:</label>
                <textarea
                  value={formEtapaDetalle}
                  onChange={(e) => setFormEtapaDetalle(e.target.value)}
                  placeholder="Describa el contacto, respuesta del socio o documentación recibida..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resultado / Próximo Paso:</label>
                <input
                  type="text"
                  value={formEtapaResultado}
                  onChange={(e) => setFormEtapaResultado(e.target.value)}
                  placeholder="ej. Se aguarda recibo de sueldo de noviembre para liquidar."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actualizar Estado de la Alerta:</label>
                <select
                  value={formEtapaEstado}
                  onChange={(e) => setFormEtapaEstado(e.target.value as EstadoAlerta)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="En Gestión">En Gestión</option>
                  <option value="Reprogramada">Reprogramada</option>
                  <option value="Resuelta">Resuelta</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalNuevaEtapa(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!formEtapaDetalle.trim()) {
                    alert('Por favor ingrese el detalle de la gestión realizada.');
                    return;
                  }
                  if (onAgregarEtapaGestion) {
                    onAgregarEtapaGestion(modalNuevaEtapa.ID_Seguimiento, {
                      accion: formEtapaAccion,
                      detalle: formEtapaDetalle,
                      resultado: formEtapaResultado,
                      nuevoEstado: formEtapaEstado
                    });
                  } else {
                    onActualizarEstadoAlerta(
                      modalNuevaEtapa.ID_Seguimiento,
                      formEtapaEstado,
                      `${formEtapaAccion}: ${formEtapaDetalle} (${formEtapaResultado})`
                    );
                  }
                  setModalNuevaEtapa(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Guardar Etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
