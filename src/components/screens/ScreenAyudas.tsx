import React from 'react';
import { AyudaEconomica, EstadoTramite } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Layers,
  Table as TableIcon,
  Kanban
} from 'lucide-react';

interface ScreenAyudasProps {
  ayudas: AyudaEconomica[];
  onCambiarEstadoAyuda: (idAyuda: string, nuevoEstado: EstadoTramite) => void;
  onNuevaAyuda: () => void;
}

export const ScreenAyudas: React.FC<ScreenAyudasProps> = ({
  ayudas,
  onCambiarEstadoAyuda,
  onNuevaAyuda
}) => {
  const [vista, setVista] = React.useState<'kanban' | 'tabla'>('kanban');
  const [filtroTexto, setFiltroTexto] = React.useState('');
  const [filtroLinea, setFiltroLinea] = React.useState('TODAS');
  const [ayudaSeleccionadaPlan, setAyudaSeleccionadaPlan] = React.useState<AyudaEconomica | null>(null);

  const ayudasFiltradas = React.useMemo(() => {
    return ayudas.filter((a) => {
      if (filtroTexto.trim()) {
        const q = filtroTexto.toLowerCase();
        const coincide =
          a.ID_Ayuda.toLowerCase().includes(q) ||
          a.Apellido_Nombre.toLowerCase().includes(q) ||
          a.DNI.includes(q);
        if (!coincide) return false;
      }
      if (filtroLinea !== 'TODAS' && a.Linea_Ayuda !== filtroLinea) {
        return false;
      }
      return true;
    });
  }, [ayudas, filtroTexto, filtroLinea]);

  const columnasKanban: { estado: EstadoTramite; titulo: string; color: string }[] = [
    { estado: 'Solicitado', titulo: '📝 1. Solicitado', color: 'border-slate-300 bg-slate-50' },
    { estado: 'En Evaluación', titulo: '🔍 2. En Evaluación', color: 'border-amber-300 bg-amber-50/40' },
    { estado: 'Aprobado', titulo: '✅ 3. Aprobado', color: 'border-blue-300 bg-blue-50/40' },
    { estado: 'Liquidado', titulo: '💳 4. Liquidado', color: 'border-emerald-300 bg-emerald-50/40' }
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Switch de Vista */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setVista('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                vista === 'kanban'
                  ? 'bg-white text-[#135596] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero Kanban</span>
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                vista === 'tabla'
                  ? 'bg-white text-[#135596] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Vista Tabla Detallada</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Buscar por ID, Socio o DNI..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            />
          </div>

          <select
            value={filtroLinea}
            onChange={(e) => setFiltroLinea(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
          >
            <option value="TODAS">Todas las Líneas</option>
            <option value="FEDEM Provincial">FEDEM Provincial</option>
            <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
            <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
          </select>

          <button
            onClick={onNuevaAyuda}
            className="px-3 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            + Nueva Solicitud
          </button>
        </div>
      </div>

      {vista === 'kanban' ? (
        /* VISTA TABLERO KANBAN DE 4 COLUMNAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnasKanban.map((col) => {
            const items = ayudasFiltradas.filter((a) => a.Estado_Tramite === col.estado);
            return (
              <div
                key={col.estado}
                className={`rounded-xl border ${col.color} p-3 min-h-[500px] flex flex-col`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    {col.titulo}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 shadow-2xs border border-slate-200">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {items.map((ay) => (
                    <div
                      key={ay.ID_Ayuda}
                      className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:shadow-md transition text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#135596] text-[11px]">
                          {ay.ID_Ayuda}
                        </span>
                        <span className="text-[10px] text-slate-400">{ay.Fecha_Solicitud}</span>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900">{ay.Apellido_Nombre}</div>
                        <div className="text-[11px] text-slate-500">DNI: {ay.DNI} • {ay.Organismo}</div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-100 space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans text-[11px]">Línea:</span>
                          <span className="font-semibold text-slate-800 font-sans">{ay.Linea_Ayuda}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans text-[11px]">Entregado:</span>
                          <span className="font-bold text-slate-900">{formatMonedaAR(ay.Neto_Efectivo_Entregado)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans text-[11px]">Plan:</span>
                          <span className="text-emerald-700 font-bold">
                            {ay.Cantidad_Cuotas} cuotas de {formatMonedaAR(ay.Valor_Cuota)}
                          </span>
                        </div>
                        {ay.Es_Refinanciacion === 'SI' && (
                          <div className="text-[10px] text-amber-700 font-sans font-semibold pt-1 border-t border-slate-200">
                            🔄 Refinanciación: Cancela {ay.IDs_Ayudas_Canceladas || 'Créditos Previos'}
                          </div>
                        )}
                      </div>

                      {/* Transición de Estados */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Doc: {ay.Estado_Documentacion}
                        </span>

                        <div className="flex items-center gap-1">
                          {col.estado === 'Solicitado' && (
                            <button
                              onClick={() => onCambiarEstadoAyuda(ay.ID_Ayuda, 'En Evaluación')}
                              className="px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded transition"
                            >
                              Evaluar →
                            </button>
                          )}
                          {col.estado === 'En Evaluación' && (
                            <button
                              onClick={() => onCambiarEstadoAyuda(ay.ID_Ayuda, 'Aprobado')}
                              className="px-2 py-1 text-[10px] font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 rounded transition"
                            >
                              Aprobar →
                            </button>
                          )}
                          {col.estado === 'Aprobado' && (
                            <button
                              onClick={() => onCambiarEstadoAyuda(ay.ID_Ayuda, 'Liquidado')}
                              className="px-2 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition"
                            >
                              Liquidar 💳
                            </button>
                          )}
                          {col.estado === 'Liquidado' && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> En Cobranza
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 italic">
                      Sin solicitudes en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA TABLA ADMINISTRATIVA */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">ID / Mutuo</th>
                  <th className="py-2.5 px-3">Socio / DNI</th>
                  <th className="py-2.5 px-3">Línea</th>
                  <th className="py-2.5 px-3 text-right">Solicitado</th>
                  <th className="py-2.5 px-3 text-right">Retenido Refi</th>
                  <th className="py-2.5 px-3 text-right">Neto Entregado</th>
                  <th className="py-2.5 px-3 text-right">Cuota Fija</th>
                  <th className="py-2.5 px-3 text-center">Cuotas</th>
                  <th className="py-2.5 px-3 text-right">Saldo Total</th>
                  <th className="py-2.5 px-3">Estado Trámite</th>
                  <th className="py-2.5 px-3">Documentación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ayudasFiltradas.map((ay) => (
                  <tr key={ay.ID_Ayuda} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      <div>{ay.ID_Ayuda}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{ay.Nro_Mutuo || 'S/N'}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900">{ay.Apellido_Nombre}</div>
                      <div className="text-[11px] text-slate-500 font-mono">DNI: {ay.DNI}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{ay.Linea_Ayuda}</td>
                    <td className="py-2.5 px-3 text-right">{formatMonedaAR(ay.Monto_Solicitado)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">
                      {ay.Monto_Retenido_Refi > 0 ? formatMonedaAR(ay.Monto_Retenido_Refi) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {formatMonedaAR(ay.Neto_Efectivo_Entregado)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                      {formatMonedaAR(ay.Valor_Cuota)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {ay.Cuotas_Pagadas} / {ay.Cantidad_Cuotas}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                      {formatMonedaAR(ay.Saldo_Total_Restante)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ay.Estado_Tramite === 'Liquidado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ay.Estado_Tramite === 'Cancelado por Refinanciación'
                            ? 'bg-slate-100 text-slate-600 line-through'
                            : ay.Estado_Tramite === 'Aprobado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ay.Estado_Tramite}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ay.Estado_Documentacion === 'Legajo Completo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ay.Estado_Documentacion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
