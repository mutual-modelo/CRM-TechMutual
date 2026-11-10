import React from 'react';
import { SocioPadron } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { exportarA_CSV } from '../../utils/exportUtils';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Building,
  CreditCard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface ScreenPadronSociosProps {
  socios: SocioPadron[];
  onSeleccionarSocioYVerFicha: (socio: SocioPadron) => void;
  onNuevoSocio: () => void;
  onSimularParaSocio: (socio: SocioPadron) => void;
}

export const ScreenPadronSocios: React.FC<ScreenPadronSociosProps> = ({
  socios,
  onSeleccionarSocioYVerFicha,
  onNuevoSocio,
  onSimularParaSocio
}) => {
  const [filtroTexto, setFiltroTexto] = React.useState('');
  const [filtroOrganismo, setFiltroOrganismo] = React.useState('TODOS');
  const [filtroEstadoSocial, setFiltroEstadoSocial] = React.useState('TODOS');
  const [filtroNormativo, setFiltroNormativo] = React.useState('TODOS');

  // Filtrado reactivo de socios
  const sociosFiltrados = React.useMemo(() => {
    return socios.filter((s) => {
      if (filtroTexto.trim()) {
        const q = filtroTexto.toLowerCase();
        const coincide =
          s.DNI.toLowerCase().includes(q) ||
          s.Apellido_Nombre.toLowerCase().includes(q) ||
          s.Nro_Socio.toLowerCase().includes(q) ||
          (s.CUIT_ARCA && s.CUIT_ARCA.toLowerCase().includes(q)) ||
          s.Localidad.toLowerCase().includes(q);
        if (!coincide) return false;
      }
      if (filtroOrganismo !== 'TODOS') {
        if (!s.Organismo.toLowerCase().includes(filtroOrganismo.toLowerCase())) return false;
      }
      if (filtroEstadoSocial !== 'TODOS') {
        if (s.Estado_Cuota_Social !== filtroEstadoSocial) return false;
      }
      if (filtroNormativo !== 'TODOS') {
        if (filtroNormativo === 'PEP' && s.Estado_PEP === 'NO_PEP') return false;
        if (filtroNormativo === 'REPET' && s.Estado_REPET !== 'EN_ALERTA') return false;
        if (filtroNormativo === 'ARCA_OBS' && s.Estado_ARCA_Constancia === 'ACTIVO_REGULAR') return false;
        if (filtroNormativo === 'INHIBIDO' && s.Estado_Inhibicion_Judicial !== 'INHIBIDO') return false;
        if (filtroNormativo === 'LEGALES' && s.Bloqueado_Legales !== 'SI') return false;
        if (filtroNormativo === 'JUBILACION' && s.En_Tramite_Jubilacion !== 'SI') return false;
      }
      return true;
    });
  }, [socios, filtroTexto, filtroOrganismo, filtroEstadoSocial, filtroNormativo]);

  // KPIs del Padrón
  const kpis = React.useMemo(() => {
    const total = socios.length;
    let alDia = 0;
    let conDeuda = 0;
    let alertaNormativa = 0;
    let margenTotal = 0;

    socios.forEach((s) => {
      if (s.Estado_Cuota_Social === 'Al Día') alDia++;
      if (s.Estado_Cuota_Social === 'Deuda 1 Mes' || s.Estado_Cuota_Social === 'Deuda 2+ Meses') conDeuda++;
      if (
        s.Estado_PEP !== 'NO_PEP' ||
        s.Estado_REPET === 'EN_ALERTA' ||
        s.Estado_ARCA_Constancia === 'OBSERVADO' ||
        s.Estado_Inhibicion_Judicial === 'INHIBIDO' ||
        s.Bloqueado_Legales === 'SI'
      ) {
        alertaNormativa++;
      }
      margenTotal += Number(s.Margen_Cuota_Disponible) || 0;
    });

    return { total, alDia, conDeuda, alertaNormativa, margenTotal };
  }, [socios]);

  const handleExportCSV = () => {
    const datosExport = sociosFiltrados.map((s) => ({
      Nro_Socio: s.Nro_Socio,
      DNI: s.DNI,
      Apellido_Nombre: s.Apellido_Nombre,
      Organismo: s.Organismo,
      Sector: s.Sector_Trabajo,
      Localidad: s.Localidad,
      Telefono: s.Telefono_WhatsApp,
      Email: s.Email,
      CBU_Alias: s.CBU_Alias,
      Sueldo_Neto: s.Sueldo_Neto,
      Margen_Cuota_Disponible: s.Margen_Cuota_Disponible,
      Estado_Cuota_Social: s.Estado_Cuota_Social,
      Control_PEP: s.Estado_PEP,
      RePET: s.Estado_REPET,
      Constancia_ARCA: s.Estado_ARCA_Constancia,
      Inhibicion_Judicial: s.Estado_Inhibicion_Judicial,
      Bloqueo_Legales: s.Bloqueado_Legales,
      Tramite_Jubilacion: s.En_Tramite_Jubilacion,
      Fecha_Alta: s.Fecha_Alta
    }));
    exportarA_CSV(datosExport, `Padron_General_Socios_MutualModelo_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5">
      {/* 4 KPIs Generales del Padrón */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Asociados
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
              {kpis.total}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Cuota Social Al Día
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-700">
              {kpis.alDia}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Alertas Normativas (UIF)
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-600">
              {kpis.alertaNormativa}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Margen Disponible Total
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-indigo-700">
              {formatMonedaAR(kpis.margenTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Botones de Acción */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Inputs de Búsqueda y Filtros */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por DNI, Nombre, N° Socio..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <select
              value={filtroOrganismo}
              onChange={(e) => setFiltroOrganismo(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="TODOS">Todos los Organismos</option>
              <option value="CGE">Consejo General de Educación (CGE)</option>
              <option value="Policía">Policía de Entre Ríos</option>
              <option value="Salud">Ministerio de Salud</option>
              <option value="Vialidad">Vialidad Provincial</option>
              <option value="Municipalidad">Municipalidad</option>
              <option value="Jubilados">Caja Jubilaciones (Ley 8732)</option>
            </select>

            <select
              value={filtroEstadoSocial}
              onChange={(e) => setFiltroEstadoSocial(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="TODOS">Estado Cuota: Todos</option>
              <option value="Al Día">Al Día</option>
              <option value="Deuda 1 Mes">Deuda 1 Mes</option>
              <option value="Deuda 2+ Meses">Deuda 2+ Meses</option>
              <option value="Exento">Exento</option>
            </select>

            <select
              value={filtroNormativo}
              onChange={(e) => setFiltroNormativo(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="TODOS">Filtro Normativo: Todos</option>
              <option value="PEP">Control PEP (UIF)</option>
              <option value="REPET">Alerta RePET (Terrorismo)</option>
              <option value="ARCA_OBS">ARCA Observado / Sin CUIT</option>
              <option value="INHIBIDO">Inhibición Judicial</option>
              <option value="LEGALES">Bloqueo por Legales</option>
              <option value="JUBILACION">Trámite Jubilación</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 cursor-pointer"
              title="Exportar padrón filtrado a archivo CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar Excel/CSV</span>
            </button>
            <button
              onClick={onNuevoSocio}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#135596] hover:bg-[#0e3b68] rounded-lg shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nuevo Asociado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla del Padrón General */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              Listado de Asociados ({sociosFiltrados.length} registros)
            </h2>
            <span className="text-[11px] text-slate-500">
              • Haga clic en una fila o en &quot;Ver Ficha 360°&quot; para abrir el perfil completo
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Sincronizado con Google Sheets (Socios_Padron)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Socio / DNI</th>
                <th className="py-2.5 px-3">Apellido y Nombre</th>
                <th className="py-2.5 px-3">Organismo / Repartición</th>
                <th className="py-2.5 px-3 text-right">Sueldo Neto</th>
                <th className="py-2.5 px-3 text-right">Margen Cuota</th>
                <th className="py-2.5 px-3 text-center">Cuota Social</th>
                <th className="py-2.5 px-3 text-center">Semáforo Normativo</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sociosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No se encontraron asociados que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                sociosFiltrados.map((s) => {
                  const tieneAlertaNormativa =
                    s.Estado_PEP !== 'NO_PEP' ||
                    s.Estado_REPET === 'EN_ALERTA' ||
                    s.Estado_ARCA_Constancia !== 'ACTIVO_REGULAR' ||
                    s.Estado_Inhibicion_Judicial === 'INHIBIDO' ||
                    s.Bloqueado_Legales === 'SI';

                  return (
                    <tr
                      key={s.DNI}
                      className="hover:bg-blue-50/50 transition cursor-pointer group"
                      onClick={() => onSeleccionarSocioYVerFicha(s)}
                    >
                      {/* Nro Socio & DNI */}
                      <td className="py-2.5 px-3 font-mono">
                        <span className="font-bold text-[#135596] block">{s.Nro_Socio}</span>
                        <span className="text-[10px] text-slate-500">DNI {s.DNI}</span>
                      </td>

                      {/* Apellido y Nombre */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                          {s.Apellido_Nombre}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.Edad} años • {s.Localidad}
                        </div>
                      </td>

                      {/* Organismo */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {s.Organismo}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {s.Sector_Trabajo || s.Dependencia_Funcion}
                        </div>
                      </td>

                      {/* Sueldo Neto */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatMonedaAR(s.Sueldo_Neto)}
                      </td>

                      {/* Margen Cuota Disponible */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                        {formatMonedaAR(s.Margen_Cuota_Disponible)}
                      </td>

                      {/* Cuota Social */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.Estado_Cuota_Social === 'Al Día'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.Estado_Cuota_Social === 'Al Día' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                          )}
                          {s.Estado_Cuota_Social}
                        </span>
                      </td>

                      {/* Semáforo Normativo UIF/INAES/ARCA */}
                      <td className="py-2.5 px-3 text-center">
                        {tieneAlertaNormativa ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Revisión Normativa
                            </span>
                            <span className="text-[9px] text-amber-700 mt-0.5">
                              {s.Estado_PEP !== 'NO_PEP' ? 'PEP' : ''}{' '}
                              {s.Estado_Inhibicion_Judicial === 'INHIBIDO' ? '• Inhibido' : ''}{' '}
                              {s.Bloqueado_Legales === 'SI' ? '• Legales' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Aprobado UIF/ARCA
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-center">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSeleccionarSocioYVerFicha(s)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Abrir Ficha 360°"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ficha 360°</span>
                          </button>
                          <button
                            onClick={() => onSimularParaSocio(s)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Simular préstamo para este socio"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Simular</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
