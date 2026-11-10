import React from 'react';
import { SeguimientoAlerta, EstadoAlerta, OperadorMutual } from '../../types/crm';
import { OPERADORES_MUTUAL_LISTA } from '../../data/seedData';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Search,
  Filter,
  UserCheck,
  RotateCcw
} from 'lucide-react';

interface ScreenAlertasProps {
  seguimientos: SeguimientoAlerta[];
  onActualizarEstadoAlerta: (idSeguimiento: string, nuevoEstado: EstadoAlerta, resultado?: string) => void;
  onNuevaAlerta: () => void;
}

export const ScreenAlertas: React.FC<ScreenAlertasProps> = ({
  seguimientos,
  onActualizarEstadoAlerta,
  onNuevaAlerta
}) => {
  const [filtroTexto, setFiltroTexto] = React.useState('');
  const [filtroSLA, setFiltroSLA] = React.useState('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = React.useState('TODOS');
  const [filtroOperador, setFiltroOperador] = React.useState('TODOS');

  // Conteo de tarjetas semáforo
  const kpis = React.useMemo(() => {
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

  const filtrados = React.useMemo(() => {
    return seguimientos.filter((s) => {
      if (filtroTexto.trim()) {
        const q = filtroTexto.toLowerCase();
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
      if (filtroOperador !== 'TODOS' && s.Operador_Asignado !== filtroOperador) return false;
      return true;
    });
  }, [seguimientos, filtroTexto, filtroSLA, filtroPrioridad, filtroOperador]);

  return (
    <div className="space-y-4">
      {/* 4 TARJETAS SEMÁFORO DE SLA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setFiltroSLA('VENCIDA')}
          className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-tight">
              Alertas Vencidas (SLA)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700 font-mono mt-1">
            {kpis.vencidas}
          </div>
          <span className="text-[11px] text-rose-600">Requieren gestión inmediata</span>
        </div>

        <div
          onClick={() => setFiltroSLA('VENCE_HOY')}
          className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-tight">
              Vencen Hoy
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700 font-mono mt-1">
            {kpis.hoy}
          </div>
          <span className="text-[11px] text-amber-600">Prioridad operativa del día</span>
        </div>

        <div
          onClick={() => setFiltroSLA('PROXIMA')}
          className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-tight">
              Próximos Vencimientos
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#135596] font-mono mt-1">
            {kpis.proximas}
          </div>
          <span className="text-[11px] text-blue-600">En plazo regular de gestión</span>
        </div>

        <div
          onClick={() => setFiltroSLA('RESUELTA')}
          className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">
              Gestiones Resueltas
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">
            {kpis.resueltas}
          </div>
          <span className="text-[11px] text-emerald-600">Completadas y archivadas</span>
        </div>
      </div>

      {/* BITÁCORA Y FILTROS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Bitácora General de Seguimientos & Alertas ({filtrados.length})
            </h2>
            <p className="text-xs text-slate-500">
              Control de plazos de documentación, trámites notariales, cobranzas y avisos a socios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por socio, DNI o detalle..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
              />
            </div>

            <select
              value={filtroSLA}
              onChange={(e) => setFiltroSLA(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="TODOS">Todos los Estados SLA</option>
              <option value="VENCIDA">Solo Vencidas</option>
              <option value="VENCE_HOY">Vence Hoy</option>
              <option value="PROXIMA">Próximas</option>
              <option value="RESUELTA">Resueltas</option>
            </select>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="TODOS">Todas las Prioridades</option>
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            <select
              value={filtroOperador}
              onChange={(e) => setFiltroOperador(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#135596]"
            >
              <option value="TODOS">Todos los Operadores</option>
              {OPERADORES_MUTUAL_LISTA.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>

            <button
              onClick={onNuevaAlerta}
              className="px-3 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-md shadow-xs transition"
            >
              + Nueva Alerta
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">SLA / Fecha</th>
                <th className="py-2.5 px-3">Socio / DNI</th>
                <th className="py-2.5 px-3">Trámite / Categoría</th>
                <th className="py-2.5 px-3">Prioridad</th>
                <th className="py-2.5 px-3">Detalle de la Gestión</th>
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((s) => (
                <tr key={s.ID_Seguimiento} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s.Estado_Alerta === 'Resuelta'
                            ? 'bg-emerald-500'
                            : s.estadoTemporalAlerta === 'VENCIDA'
                            ? 'bg-rose-500'
                            : s.estadoTemporalAlerta === 'VENCE_HOY'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="font-mono text-slate-700 font-medium">
                        {s.Fecha_Vencimiento_Alerta}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.Fecha_Hora}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <div>{s.Apellido_Nombre}</div>
                    <div className="text-[11px] text-slate-500 font-mono">DNI: {s.DNI}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{s.Subtipo_Tramite}</div>
                    <div className="text-[11px] text-slate-500">{s.Categoria}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.Prioridad === 'Urgente'
                          ? 'bg-rose-100 text-rose-800'
                          : s.Prioridad === 'Alta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.Prioridad}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs text-slate-700 text-xs leading-relaxed">
                    {s.Detalle_Gestion}
                    {s.Resultado_Proximo_Paso && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Resultado: {s.Resultado_Proximo_Paso}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">
                    {s.Operador_Asignado}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {s.Estado_Alerta !== 'Resuelta' ? (
                        <>
                          <button
                            onClick={() => onActualizarEstadoAlerta(s.ID_Seguimiento, 'En Gestión', 'En proceso de contacto')}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded transition"
                          >
                            En Gestión
                          </button>
                          <button
                            onClick={() => onActualizarEstadoAlerta(s.ID_Seguimiento, 'Resuelta', 'Gestión completada satisfactoriamente')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition"
                          >
                            Resolver ✅
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resuelta
                        </span>
                      )}
                    </div>
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
