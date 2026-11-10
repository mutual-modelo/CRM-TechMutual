import React from 'react';
import {
  Comercializador,
  LiquidacionComision,
  AyudaEconomica,
  HistorialComisionComercializador
} from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  Briefcase,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
  UserCheck,
  Edit3,
  TrendingUp,
  History,
  FileText
} from 'lucide-react';

interface ScreenComercializadoresProps {
  comercializadores: Comercializador[];
  liquidaciones: LiquidacionComision[];
  ayudas: AyudaEconomica[];
  historialComisiones: HistorialComisionComercializador[];
  onNuevoComercializador: () => void;
  onEditarComercializador: (comercializador: Comercializador) => void;
  onEmitirLiquidacion: (payload: any) => void;
  onCambiarEstadoPago: (idLiq: string, nuevoEstado: 'Pendiente de Pago' | 'Pagado' | 'Anulado') => void;
  onActualizarComercializador?: (comercializador: Comercializador, motivoCambio?: string) => void;
}

export const ScreenComercializadores: React.FC<ScreenComercializadoresProps> = ({
  comercializadores,
  liquidaciones,
  ayudas,
  historialComisiones,
  onNuevoComercializador,
  onEditarComercializador,
  onEmitirLiquidacion,
  onCambiarEstadoPago,
  onActualizarComercializador
}) => {
  const [comercializadorSel, setComercializadorSel] = React.useState(comercializadores[0]?.ID_Comercializador || '');
  const [fechaDesde, setFechaDesde] = React.useState('2026-10-01');
  const [fechaHasta, setFechaHasta] = React.useState('2026-10-31');
  const [deducciones, setDeducciones] = React.useState<number>(0);

  // Modal para "Modificar Ficha" y registrar evolución de comisión
  const [modalEditarFicha, setModalEditarFicha] = React.useState<Comercializador | null>(null);
  const [formNombre, setFormNombre] = React.useState('');
  const [formCuit, setFormCuit] = React.useState('');
  const [formTelefono, setFormTelefono] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formCbu, setFormCbu] = React.useState('');
  const [formBase, setFormBase] = React.useState<'Capital_Bruto' | 'Monto_Solicitado' | 'Neto_Efectivo_Entregado'>('Neto_Efectivo_Entregado');
  const [formPct, setFormPct] = React.useState<number>(4.5);
  const [formEstado, setFormEstado] = React.useState<'Activo' | 'Inactivo'>('Activo');
  const [formMotivo, setFormMotivo] = React.useState('');

  const comercializadorActivo = React.useMemo(() => {
    return comercializadores.find((c) => c.ID_Comercializador === comercializadorSel);
  }, [comercializadores, comercializadorSel]);

  // Historial de cambios de comisión para el comercializador seleccionado
  const logsComisionSocio = React.useMemo(() => {
    if (!comercializadorActivo) return [];
    return historialComisiones.filter((h) => h.ID_Comercializador === comercializadorActivo.ID_Comercializador);
  }, [historialComisiones, comercializadorActivo]);

  // Liquidaciones históricas de este comercializador
  const liquidacionesComercializador = React.useMemo(() => {
    if (!comercializadorActivo) return [];
    return liquidaciones.filter((l) => l.ID_Comercializador === comercializadorActivo.ID_Comercializador);
  }, [liquidaciones, comercializadorActivo]);

  // Buscar operaciones del comercializador dentro del rango no liquidadas previamente
  const operacionesPrevisualizadas = React.useMemo(() => {
    if (!comercializadorActivo) return [];

    const yaLiquidadas: Record<string, boolean> = {};
    liquidaciones.forEach((l) => {
      if (l.Estado_Pago !== 'Anulado' && l.IDs_Ayudas_Incluidas_JSON) {
        try {
          const arr = JSON.parse(l.IDs_Ayudas_Incluidas_JSON);
          arr.forEach((id: string) => {
            yaLiquidadas[id] = true;
          });
        } catch {}
      }
    });

    return ayudas.filter((ay) => {
      if (ay.ID_Comercializador !== comercializadorActivo.ID_Comercializador) return false;
      if (ay.Estado_Tramite !== 'Liquidado') return false;
      const fLiq = ay.Fecha_Liquidacion || ay.Fecha_Solicitud;
      if (fLiq < fechaDesde || fLiq > fechaHasta) return false;
      if (yaLiquidadas[ay.ID_Ayuda]) return false;
      return true;
    });
  }, [comercializadorActivo, ayudas, liquidaciones, fechaDesde, fechaHasta]);

  // Cálculos de liquidación
  const calculoComisiones = React.useMemo(() => {
    if (!comercializadorActivo) {
      return { totalBase: 0, montoBruto: 0, netoPagar: 0 };
    }

    const baseKey = comercializadorActivo.Base_Calculo_Comision || 'Neto_Efectivo_Entregado';
    const pct = Number(comercializadorActivo.Porcentaje_Comision) || 0;

    let totalBase = 0;
    operacionesPrevisualizadas.forEach((op) => {
      let valor = 0;
      if (baseKey === 'Neto_Efectivo_Entregado') {
        valor = op.Neto_Efectivo_Entregado || op.Monto_Depositado || 0;
      } else if (baseKey === 'Capital_Bruto') {
        valor = op.Capital_Bruto || op.Monto_Solicitado || 0;
      } else if (baseKey === 'Monto_Solicitado') {
        valor = op.Monto_Solicitado || 0;
      } else {
        valor = (op as any)[baseKey] || op.Monto_Depositado || 0;
      }
      totalBase += Number(valor) || 0;
    });

    const montoBruto = Math.round(totalBase * (pct / 100));
    const netoPagar = Math.max(0, montoBruto - (Number(deducciones) || 0));

    return { totalBase, montoBruto, netoPagar };
  }, [comercializadorActivo, operacionesPrevisualizadas, deducciones]);

  const handleEmitir = () => {
    if (!comercializadorActivo || operacionesPrevisualizadas.length === 0) {
      alert('No hay operaciones disponibles para liquidar en el período seleccionado.');
      return;
    }

    const payload = {
      periodoDesde: fechaDesde,
      periodoHasta: fechaHasta,
      idComercializador: comercializadorActivo.ID_Comercializador,
      nombreComercializador: comercializadorActivo.Nombre_Estudio_Agente,
      cantidadAyudas: operacionesPrevisualizadas.length,
      totalMontoSolicitado: operacionesPrevisualizadas.reduce((acc, a) => acc + a.Monto_Solicitado, 0),
      totalMontoDepositado: operacionesPrevisualizadas.reduce((acc, a) => acc + a.Monto_Depositado, 0),
      totalNetoEfectivo: operacionesPrevisualizadas.reduce((acc, a) => acc + a.Neto_Efectivo_Entregado, 0),
      baseAplicada: comercializadorActivo.Base_Calculo_Comision,
      porcentajeComision: comercializadorActivo.Porcentaje_Comision,
      montoComisionBruta: calculoComisiones.montoBruto,
      deduccionesAjustes: deducciones,
      netoPagarComision: calculoComisiones.netoPagar,
      idsAyudasIncluidas: operacionesPrevisualizadas.map((a) => a.ID_Ayuda)
    };

    onEmitirLiquidacion(payload);
  };

  const handleAbrirEdicion = (c: Comercializador) => {
    setModalEditarFicha(c);
    setFormNombre(c.Nombre_Estudio_Agente);
    setFormCuit(c.DNI_CUIT);
    setFormTelefono(c.Telefono);
    setFormEmail(c.Email);
    setFormCbu(c.CBU_Pago);
    setFormBase(c.Base_Calculo_Comision);
    setFormPct(c.Porcentaje_Comision);
    setFormEstado(c.Estado);
    setFormMotivo('Actualización de condiciones de comisiones');
  };

  const handleGuardarModificacionFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarFicha) return;

    const actualizado: Comercializador = {
      ...modalEditarFicha,
      Nombre_Estudio_Agente: formNombre,
      DNI_CUIT: formCuit,
      Telefono: formTelefono,
      Email: formEmail,
      CBU_Pago: formCbu,
      Base_Calculo_Comision: formBase,
      Porcentaje_Comision: Number(formPct) || 0,
      Estado: formEstado
    };

    if (onActualizarComercializador) {
      onActualizarComercializador(actualizado, formMotivo);
    } else {
      onEditarComercializador(actualizado);
    }
    setModalEditarFicha(null);
  };

  return (
    <div className="space-y-4">
      {/* SECCIÓN 1: PADRÓN DE COMERCIALIZADORES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              🤝 Padrón Oficial de Comercializadores & Agentes ({comercializadores.length})
            </h2>
            <p className="text-xs text-slate-500">
              Gestión de convenios, esquemas de comisión y cuentas bancarias registradas.
            </p>
          </div>

          <button
            onClick={onNuevoComercializador}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Nuevo Comercializador
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Estudio / Agente</th>
                <th className="py-2.5 px-3">CUIT</th>
                <th className="py-2.5 px-3">Contacto</th>
                <th className="py-2.5 px-3">Base de Cálculo</th>
                <th className="py-2.5 px-3 text-right">Comisión (%)</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comercializadores.map((c) => (
                <tr key={c.ID_Comercializador} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#135596]">{c.ID_Comercializador}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{c.Nombre_Estudio_Agente}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{c.DNI_CUIT}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <div>{c.Telefono}</div>
                    <div className="text-[11px] text-slate-400">{c.Email}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{c.Base_Calculo_Comision}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                    {c.Porcentaje_Comision} %
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.Estado === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleAbrirEdicion(c)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                        title="Modificar ficha y porcentaje de comisión"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Modificar Ficha</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE EVOLUCIÓN DE COMISIONES (LOG AUDITADO) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Historial de Evolución de Comisiones y Bases de Cálculo ({historialComisiones.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Auditado en Google Sheets: Historial_Comisiones_Comercializador
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2 px-3">Log ID</th>
                <th className="py-2 px-3">Comercializador</th>
                <th className="py-2 px-3">Fecha Cambio</th>
                <th className="py-2 px-3 text-center">Tasa Anterior</th>
                <th className="py-2 px-3 text-center">Tasa Nueva</th>
                <th className="py-2 px-3">Base Anterior → Nueva</th>
                <th className="py-2 px-3">Motivo Modificación</th>
                <th className="py-2 px-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {historialComisiones.map((h) => (
                <tr key={h.ID_Log} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-700">{h.ID_Log}</td>
                  <td className="py-2 px-3 font-sans font-semibold text-slate-900">{h.Nombre_Comercializador}</td>
                  <td className="py-2 px-3 text-slate-600">{h.Fecha_Cambio}</td>
                  <td className="py-2 px-3 text-center text-slate-500">{h.Comision_Anterior}%</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-700">{h.Comision_Nueva}%</td>
                  <td className="py-2 px-3 font-sans text-slate-600 text-[11px]">
                    {h.Base_Calculo_Anterior} → <strong>{h.Base_Calculo_Nueva}</strong>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-700">{h.Motivo_Modificacion}</td>
                  <td className="py-2 px-3 font-sans text-slate-500">{h.Operador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 3: LIQUIDADOR DE COMISIONES POR FECHAS */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Liquidador Oficial de Comisiones por Período
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Comercializador:</label>
            <select
              value={comercializadorSel}
              onChange={(e) => setComercializadorSel(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              {comercializadores.map((c) => (
                <option key={c.ID_Comercializador} value={c.ID_Comercializador}>
                  {c.Nombre_Estudio_Agente} ({c.Porcentaje_Comision}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Deducciones / Ajustes ($):</label>
            <input
              type="number"
              value={deducciones}
              onChange={(e) => setDeducciones(Number(e.target.value) || 0)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>
        </div>

        {/* 4 KPIs de Liquidación */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Operaciones Aprobadas
            </span>
            <span className="font-mono text-xl font-bold text-slate-800">
              {operacionesPrevisualizadas.length}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Base Total Acumulada
            </span>
            <span className="font-mono text-base font-bold text-blue-700">
              {formatMonedaAR(calculoComisiones.totalBase)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Comisión Bruta ({comercializadorActivo?.Porcentaje_Comision}%)
            </span>
            <span className="font-mono text-base font-bold text-slate-800">
              {formatMonedaAR(calculoComisiones.montoBruto)}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Neto a Pagar
            </span>
            <span className="font-mono text-xl font-bold text-emerald-700">
              {formatMonedaAR(calculoComisiones.netoPagar)}
            </span>
          </div>
        </div>

        {/* Botón de Emitir Liquidación */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleEmitir}
            disabled={operacionesPrevisualizadas.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Emitir Liquidación Oficial de Comisiones</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 4: HISTORIAL DE LIQUIDACIONES EMITIDAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
            📜 Historial de Lotes de Comisiones Emitidas ({liquidaciones.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">ID Lote</th>
                <th className="py-2.5 px-3">Fecha Emisión</th>
                <th className="py-2.5 px-3">Comercializador</th>
                <th className="py-2.5 px-3">Período</th>
                <th className="py-2.5 px-3 text-center">Créditos</th>
                <th className="py-2.5 px-3 text-right">Comisión Neta</th>
                <th className="py-2.5 px-3">Estado Pago</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {liquidaciones.map((l) => (
                <tr key={l.ID_Liquidacion} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{l.ID_Liquidacion}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{l.Fecha_Emision}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{l.Nombre_Comercializador}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">{l.Periodo_Desde} al {l.Periodo_Hasta}</td>
                  <td className="py-2.5 px-3 text-center">{l.Cantidad_Ayudas}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatMonedaAR(l.Neto_A_Pagar_Comision)}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.Estado_Pago === 'Pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {l.Estado_Pago}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {l.Estado_Pago === 'Pendiente de Pago' ? (
                      <button
                        onClick={() => onCambiarEstadoPago(l.ID_Liquidacion, 'Pagado')}
                        className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Marcar Pagado ✅
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-sans">Comprobante Adjunto</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: MODIFICAR FICHA DE COMERCIALIZADOR Y BASE DE COMISIONES */}
      {/* ============================================================== */}
      {modalEditarFicha && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {modalEditarFicha.ID_Comercializador}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Modificar Ficha & Esquema de Comisiones
                </h3>
                <p className="text-xs text-slate-500">
                  Los cambios de porcentaje o base se auditan automáticamente en el log histórico.
                </p>
              </div>
              <button
                onClick={() => setModalEditarFicha(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarModificacionFicha} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre / Estudio / Agente:</label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DNI / CUIT:</label>
                  <input
                    type="text"
                    required
                    value={formCuit}
                    onChange={(e) => setFormCuit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estado de Habilitación:</label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Inactivo">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">CBU / Alias para Pago de Honorarios:</label>
                <input
                  type="text"
                  value={formCbu}
                  onChange={(e) => setFormCbu(e.target.value)}
                  placeholder="22 dígitos de CBU o Alias bancario"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Base de Cálculo:</label>
                  <select
                    value={formBase}
                    onChange={(e) => setFormBase(e.target.value as any)}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 font-semibold text-amber-950"
                  >
                    <option value="Neto_Efectivo_Entregado">Neto Efectivo Entregado</option>
                    <option value="Capital_Bruto">Capital Bruto</option>
                    <option value="Monto_Solicitado">Monto Solicitado</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Comisión (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formPct}
                    onChange={(e) => setFormPct(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 font-mono font-black text-amber-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motivo de la Modificación (Auditado):</label>
                <input
                  type="text"
                  required
                  value={formMotivo}
                  onChange={(e) => setFormMotivo(e.target.value)}
                  placeholder="ej. Readecuación de convenio o incentivo comercial"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditarFicha(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Modificación & Registrar Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
