import React, { useState, useMemo } from 'react';
import {
  Kanban,
  List,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { SeguimientoAlerta, OperadorMutual, PrioridadAlerta, EstadoAlerta } from '../../types/crm';
import { OPERADORES_MUTUAL } from '../../data/seedData';

interface CrmCentroOperacionesProps {
  alertas: SeguimientoAlerta[];
  onCrearAlerta: (alerta: SeguimientoAlerta) => void;
  onActualizarAlerta: (alerta: SeguimientoAlerta) => void;
  onResolverAlerta: (id: string) => void;
}

type VistaOperacionesType = 'LISTADO' | 'KANBAN' | 'CALENDARIO';

const COLUMNAS_KANBAN = [
  'Solicitado',
  'En Evaluación',
  'Aprobado',
  'Liquidado',
  'Rechazado'
] as const;

export const CrmCentroOperaciones: React.FC<CrmCentroOperacionesProps> = ({
  alertas,
  onCrearAlerta,
  onActualizarAlerta,
  onResolverAlerta
}) => {
  const [vistaActiva, setVistaActiva] = useState<VistaOperacionesType>('KANBAN');
  const [filtroOperador, setFiltroOperador] = useState<string>('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modal ABM Alerta
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [alertaEnEdicion, setAlertaEnEdicion] = useState<SeguimientoAlerta | null>(null);

  // Formulario Alerta
  const [formSocio, setFormSocio] = useState<string>('RODRIGUEZ, Marcos');
  const [formDni, setFormDni] = useState<string>('30123456');
  const [formMotivo, setFormMotivo] = useState<string>('Vencimiento de documentación de legajo');
  const [formOperador, setFormOperador] = useState<OperadorMutual>('Julian');
  const [formPrioridad, setFormPrioridad] = useState<PrioridadAlerta>('Media');
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().slice(0, 10));

  // Filtrado reactivo de alertas
  const alertasFiltradas = useMemo(() => {
    return alertas.filter((a) => {
      const matchOp = filtroOperador === 'TODOS' || a.Operador_Asignado === filtroOperador;
      const matchPri = filtroPrioridad === 'TODOS' || a.Prioridad === filtroPrioridad;
      const q = busqueda.toLowerCase().trim();
      const matchQ =
        !q ||
        a.Apellido_Nombre.toLowerCase().includes(q) ||
        a.DNI.includes(q) ||
        a.Detalle_Gestion.toLowerCase().includes(q);
      return matchOp && matchPri && matchQ;
    });
  }, [alertas, filtroOperador, filtroPrioridad, busqueda]);

  const abrirModalCrear = () => {
    setAlertaEnEdicion(null);
    setFormSocio('');
    setFormDni('');
    setFormMotivo('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (alerta: SeguimientoAlerta) => {
    setAlertaEnEdicion(alerta);
    setFormSocio(alerta.Apellido_Nombre);
    setFormDni(alerta.DNI);
    setFormMotivo(alerta.Detalle_Gestion);
    setFormOperador(alerta.Operador_Asignado);
    setFormPrioridad(alerta.Prioridad);
    setFormFecha(alerta.Fecha_Vencimiento_Alerta);
    setModalAbierto(true);
  };

  const handleGuardarAlerta = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertaEnEdicion) {
      onActualizarAlerta({
        ...alertaEnEdicion,
        Apellido_Nombre: formSocio,
        DNI: formDni,
        Detalle_Gestion: formMotivo,
        Operador_Asignado: formOperador,
        Prioridad: formPrioridad,
        Fecha_Vencimiento_Alerta: formFecha
      });
    } else {
      const nueva: SeguimientoAlerta = {
        ID_Seguimiento: `ALT-${Date.now().toString().slice(-6)}`,
        Fecha_Hora: new Date().toISOString().slice(0, 10),
        DNI: formDni || '30000000',
        Apellido_Nombre: formSocio || 'Socio Mutual',
        ID_Ayuda_Relacionada: `AYU-${Math.floor(1000 + Math.random() * 9000)}`,
        Tipo_Registro: 'Alerta Trámite',
        Categoria: 'Alerta SLA',
        Subtipo_Tramite: 'Revisión Legajo',
        Prioridad: formPrioridad,
        Fecha_Vencimiento_Alerta: formFecha,
        Estado_Alerta: 'Pendiente',
        Detalle_Gestion: formMotivo || 'Seguimiento administrativo',
        Resultado_Proximo_Paso: 'Contacto telefónico',
        Operador_Asignado: formOperador,
        Operador_Creador: formOperador,
        Notificado_WhatsApp: 'NO'
      };
      onCrearAlerta(nueva);
    }
    setModalAbierto(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
            Módulo 3 • SLA & Gestión Operativa
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Centro de Operaciones y Alertas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de trámites en curso, vencimientos documentales y workflow operativo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Conmutador Triple Vista */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setVistaActiva('KANBAN')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                vistaActiva === 'KANBAN'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('LISTADO')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                vistaActiva === 'LISTADO'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Listado
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('CALENDARIO')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                vistaActiva === 'CALENDARIO'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario
            </button>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Alerta
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por socio, DNI o motivo de alerta..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filtroOperador}
            onChange={(e) => setFiltroOperador(e.target.value)}
            className="py-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="TODOS">Todos los Operadores</option>
            {OPERADORES_MUTUAL.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>

          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="py-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="TODOS">Todas las Prioridades</option>
            <option value="Urgente">Urgente 🔴</option>
            <option value="Alta">Alta 🟠</option>
            <option value="Media">Media 🟡</option>
            <option value="Baja">Baja 🟢</option>
          </select>
        </div>
      </div>

      {/* VISTA 1: KANBAN */}
      {vistaActiva === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
          {COLUMNAS_KANBAN.map((colEstado) => {
            const items = alertasFiltradas.filter((a) => {
              if (colEstado === 'Solicitado') return a.Estado_Alerta === 'Pendiente';
              if (colEstado === 'En Evaluación') return a.Estado_Alerta === 'En Gestión';
              if (colEstado === 'Aprobado') return a.Estado_Alerta === 'Reprogramada';
              if (colEstado === 'Liquidado') return a.Estado_Alerta === 'Resuelta';
              return a.Estado_Alerta === 'Cancelada';
            });

            return (
              <div
                key={colEstado}
                className="bg-slate-100/90 rounded-3xl p-3 border border-slate-200/80 flex flex-col min-h-[380px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 px-1">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {colEstado}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs font-mono">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {items.map((item) => (
                    <div
                      key={item.ID_Seguimiento}
                      onClick={() => abrirModalEditar(item)}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            item.Prioridad === 'Urgente'
                              ? 'bg-rose-100 text-rose-800'
                              : item.Prioridad === 'Alta'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.Prioridad}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{item.ID_Seguimiento}</span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug">{item.Apellido_Nombre}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{item.Detalle_Gestion}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-500" />
                          {item.Operador_Asignado}
                        </span>
                        <span className="font-mono">{item.Fecha_Vencimiento_Alerta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: LISTADO */}
      {vistaActiva === 'LISTADO' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Socio</th>
                  <th className="py-3 px-3">Motivo / Tarea</th>
                  <th className="py-3 px-3">Operador</th>
                  <th className="py-3 px-3">Prioridad</th>
                  <th className="py-3 px-3">Compromiso</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {alertasFiltradas.map((a) => (
                  <tr key={a.ID_Seguimiento} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-500">{a.ID_Seguimiento}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{a.Apellido_Nombre}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{a.Detalle_Gestion}</td>
                    <td className="py-3 px-3 text-blue-700 font-semibold">{a.Operador_Asignado}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {a.Prioridad}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{a.Fecha_Vencimiento_Alerta}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {a.Estado_Alerta}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(a)}
                        className="py-1 px-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-colors"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: CALENDARIO */}
      {vistaActiva === 'CALENDARIO' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Vencimientos y Vistas de Liquidación • Noviembre 2026
            </h3>
            <span className="text-xs text-slate-500 font-mono">15 alertas programadas</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-2">
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const dia = i + 1;
              const tieneAlerta = dia === 10 || dia === 15 || dia === 20 || dia === 28;
              return (
                <div
                  key={dia}
                  className={`min-h-[70px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    tieneAlerta
                      ? 'bg-blue-50/80 border-blue-200 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/60'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-slate-700">{dia}</span>
                  {tieneAlerta && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600 text-white truncate block">
                      {dia === 10 ? 'Venc. Cuotas' : dia === 15 ? 'Liquidación B2B' : 'Revisión SLA'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL ABM ALERTA */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {alertaEnEdicion ? 'Modificar Alerta' : 'Crear Alerta Operativa'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAlerta} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Socio</label>
                <input
                  type="text"
                  required
                  value={formSocio}
                  onChange={(e) => setFormSocio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">DNI del Socio</label>
                <input
                  type="text"
                  required
                  value={formDni}
                  onChange={(e) => setFormDni(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Motivo / Detalle SLA</label>
                <textarea
                  rows={2}
                  required
                  value={formMotivo}
                  onChange={(e) => setFormMotivo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Operador Asignado</label>
                  <select
                    value={formOperador}
                    onChange={(e) => setFormOperador(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    {OPERADORES_MUTUAL.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prioridad</label>
                  <select
                    value={formPrioridad}
                    onChange={(e) => setFormPrioridad(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha Límite Compromiso</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {alertaEnEdicion && (
                  <button
                    type="button"
                    onClick={() => {
                      onResolverAlerta(alertaEnEdicion.ID_Seguimiento);
                      setModalAbierto(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Marcar Resuelta
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Guardar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
