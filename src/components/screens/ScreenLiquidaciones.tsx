import React from 'react';
import { AyudaEconomica } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { exportarA_CSV } from '../../utils/exportUtils';
import {
  Calendar,
  Download,
  Printer,
  PieChart,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface ScreenLiquidacionesProps {
  ayudas: AyudaEconomica[];
}

export const ScreenLiquidaciones: React.FC<ScreenLiquidacionesProps> = ({ ayudas }) => {
  const [criterioFecha, setCriterioFecha] = React.useState<'Fecha_Liquidacion' | 'Fecha_Solicitud'>('Fecha_Liquidacion');
  const [fechaDesde, setFechaDesde] = React.useState('2026-10-01');
  const [fechaHasta, setFechaHasta] = React.useState('2026-11-30');
  const [lineaFiltro, setLineaFiltro] = React.useState('TODAS');
  const [originacionFiltro, setOriginacionFiltro] = React.useState('TODAS');

  const filtradas = React.useMemo(() => {
    return ayudas.filter((ay) => {
      const f = ay[criterioFecha] || '';
      if (f < fechaDesde || f > fechaHasta) return false;
      if (lineaFiltro !== 'TODAS' && ay.Linea_Ayuda !== lineaFiltro) return false;
      if (originacionFiltro !== 'TODAS' && ay.Originacion !== originacionFiltro) return false;
      return true;
    });
  }, [ayudas, criterioFecha, fechaDesde, fechaHasta, lineaFiltro, originacionFiltro]);

  // 6 KPIs de Tesorería
  const kpis = React.useMemo(() => {
    let cant = filtradas.length;
    let solicitado = 0;
    let depositado = 0;
    let retenido = 0;
    let neto = 0;
    let totalDevolver = 0;

    const desgloseLineas: Record<string, number> = {};

    filtradas.forEach((ay) => {
      solicitado += Number(ay.Monto_Solicitado) || 0;
      depositado += Number(ay.Monto_Depositado) || 0;
      retenido += Number(ay.Monto_Retenido_Refi) || 0;
      neto += Number(ay.Neto_Efectivo_Entregado) || 0;
      totalDevolver += Number(ay.Total_A_Devolver) || 0;

      desgloseLineas[ay.Linea_Ayuda] = (desgloseLineas[ay.Linea_Ayuda] || 0) + (Number(ay.Monto_Depositado) || 0);
    });

    return { cant, solicitado, depositado, retenido, neto, totalDevolver, desgloseLineas };
  }, [filtradas]);

  const handleExportCSV = () => {
    const exportData = filtradas.map((ay) => ({
      ID_Ayuda: ay.ID_Ayuda,
      Nro_Mutuo: ay.Nro_Mutuo,
      Fecha: ay[criterioFecha],
      DNI: ay.DNI,
      Socio: ay.Apellido_Nombre,
      Linea: ay.Linea_Ayuda,
      Monto_Solicitado: ay.Monto_Solicitado,
      Monto_Depositado: ay.Monto_Depositado,
      Monto_Retenido_Refi: ay.Monto_Retenido_Refi,
      Neto_Efectivo_Entregado: ay.Neto_Efectivo_Entregado,
      Cantidad_Cuotas: ay.Cantidad_Cuotas,
      Valor_Cuota: ay.Valor_Cuota,
      Total_A_Devolver: ay.Total_A_Devolver,
      Estado_Tramite: ay.Estado_Tramite,
      Originacion: ay.Originacion,
      Comercializador: ay.Nombre_Comercializador || 'Orgánica'
    }));
    exportarA_CSV(exportData, 'Liquidaciones_Mutual_Modelo');
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros de Período */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-3">
          📅 Liquidaciones de Ayudas Económicas por Rango de Fechas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Criterio Fecha:</label>
            <select
              value={criterioFecha}
              onChange={(e) => setCriterioFecha(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="Fecha_Liquidacion">Fecha de Liquidación</option>
              <option value="Fecha_Solicitud">Fecha de Solicitud</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Línea:</label>
            <select
              value={lineaFiltro}
              onChange={(e) => setLineaFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="TODAS">Todas las Líneas</option>
              <option value="FEDEM Provincial">FEDEM Provincial</option>
              <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
              <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Originación:</label>
            <select
              value={originacionFiltro}
              onChange={(e) => setOriginacionFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="TODAS">Todas</option>
              <option value="Orgánica">Orgánica (Sede)</option>
              <option value="Comercializador">Comercializador Externo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 KPIS DE TESORERÍA DEL PERÍODO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Operaciones
          </span>
          <span className="font-mono text-xl font-extrabold text-slate-800">
            {kpis.cant}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Monto Solicitado
          </span>
          <span className="font-mono text-base font-bold text-slate-700">
            {formatMonedaAR(kpis.solicitado)}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Monto Depositado
          </span>
          <span className="font-mono text-base font-bold text-blue-700">
            {formatMonedaAR(kpis.depositado)}
          </span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Retenido Refi.
          </span>
          <span className="font-mono text-base font-bold text-amber-700">
            {formatMonedaAR(kpis.retenido)}
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Neto Entregado
          </span>
          <span className="font-mono text-lg font-extrabold text-emerald-700">
            {formatMonedaAR(kpis.neto)}
          </span>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Total a Devolver
          </span>
          <span className="font-mono text-base font-bold text-purple-700">
            {formatMonedaAR(kpis.totalDevolver)}
          </span>
        </div>
      </div>

      {/* PLANILLA DETALLADA Y ACCIONES DE EXPORTACIÓN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Planilla Detallada de Liquidaciones ({filtradas.length} créditos)
            </h3>
            <p className="text-xs text-slate-500">
              Período evaluado: {fechaDesde} al {fechaHasta}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel / CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Planilla</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">ID Ayuda</th>
                <th className="py-2.5 px-3">Fecha Liq.</th>
                <th className="py-2.5 px-3">Asociado / DNI</th>
                <th className="py-2.5 px-3">Línea</th>
                <th className="py-2.5 px-3 text-right">Solicitado</th>
                <th className="py-2.5 px-3 text-right">Depositado</th>
                <th className="py-2.5 px-3 text-right text-amber-700">Ret. Refi</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">Neto Entregado</th>
                <th className="py-2.5 px-3 text-right text-purple-800">Total Devolver</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtradas.map((ay) => (
                <tr key={ay.ID_Ayuda} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{ay.ID_Ayuda}</td>
                  <td className="py-2.5 px-3 text-slate-600">{ay.Fecha_Liquidacion || ay.Fecha_Solicitud}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-semibold text-slate-900">{ay.Apellido_Nombre}</div>
                    <div className="text-[11px] text-slate-500 font-mono">DNI {ay.DNI}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{ay.Linea_Ayuda}</td>
                  <td className="py-2.5 px-3 text-right">{formatMonedaAR(ay.Monto_Solicitado)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-blue-700">{formatMonedaAR(ay.Monto_Depositado)}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                    {ay.Monto_Retenido_Refi > 0 ? formatMonedaAR(ay.Monto_Retenido_Refi) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatMonedaAR(ay.Neto_Efectivo_Entregado)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                    {formatMonedaAR(ay.Total_A_Devolver)}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ay.Estado_Tramite === 'Liquidado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ay.Estado_Tramite === 'Cancelado por Refinanciación'
                          ? 'bg-slate-100 text-slate-600 line-through'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ay.Estado_Tramite}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
