import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Trash2,
  FolderPlus,
  Upload,
  FileText,
  DollarSign,
  Heart,
  ShoppingBag,
  Award,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';
import { SocioPadron, FamiliarSocio, SubsidioSocio, AuditoriaIALegajo } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface CrmPadronYFicha360Props {
  socios: SocioPadron[];
  onGuardarSocio: (socio: SocioPadron) => void;
  onCrearSocio: (socio: SocioPadron) => void;
  onEliminarSocio: (dni: string) => void;
}

type TabFicha360 =
  | 'PERSONALES'
  | 'CAPACIDAD_RECIBOS'
  | 'FAMILIARES_SUBSIDIOS'
  | 'CONSUMOS'
  | 'FIDELIDAD'
  | 'LEGAJO_DRIVE'
  | 'ANALIZADOR_IA';

export const CrmPadronYFicha360: React.FC<CrmPadronYFicha360Props> = ({
  socios,
  onGuardarSocio,
  onCrearSocio,
  onEliminarSocio
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroOrganismo, setFiltroOrganismo] = useState<string>('TODOS');
  const [filtroCuota, setFiltroCuota] = useState<string>('TODOS');
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioPadron | null>(null);
  const [tabFicha, setTabFicha] = useState<TabFicha360>('PERSONALES');
  const [modalNuevoSocio, setModalNuevoSocio] = useState<boolean>(false);
  const [toastNotificacion, setToastNotificacion] = useState<string | null>(null);

  // Estados editables en Ficha 360
  const [editSocio, setEditSocio] = useState<SocioPadron | null>(null);

  // Estados pestaña Familiares
  const [familiares, setFamiliares] = useState<FamiliarSocio[]>([
    { id: 'FAM-1', nombre: 'María Rosa Gómez', parentesco: 'Cónyuge', dni: '34890123', fechaNacimiento: '1988-06-12', aCargo: true },
    { id: 'FAM-2', nombre: 'Ignacio Albornoz', parentesco: 'Hijo/a', dni: '52341902', fechaNacimiento: '2016-09-24', aCargo: true }
  ]);
  const [nuevoFamNombre, setNuevoFamNombre] = useState('');
  const [nuevoFamParentesco, setNuevoFamParentesco] = useState<'Cónyuge' | 'Hijo/a' | 'Padre/Madre' | 'Otro'>('Hijo/a');
  const [nuevoFamDni, setNuevoFamDni] = useState('');

  // Estados pestaña Analizador de Recibos IA con afectaciones manuales
  const [itemsReciboManuales, setItemsReciboManuales] = useState<{ concepto: string; importe: number; tipo: 'HABER' | 'DESCUENTO' }[]>([
    { concepto: 'Sueldo Básico Provincial', importe: 650000, tipo: 'HABER' },
    { concepto: 'Adicional Código 027 (Antigüedad)', importe: 180000, tipo: 'HABER' },
    { concepto: 'Aporte Jubilatorio Ley 8732 (16%)', importe: 132800, tipo: 'DESCUENTO' },
    { concepto: 'Obra Social IOSPER (4%)', importe: 33200, tipo: 'DESCUENTO' }
  ]);
  const [nuevoConcepto, setNuevoConcepto] = useState('Consumo BERSA por Alivio Financiero');
  const [nuevoImporte, setNuevoImporte] = useState(45000);
  const [nuevoTipo, setNuevoTipo] = useState<'HABER' | 'DESCUENTO'>('DESCUENTO');

  // Documentos en Drive
  const [documentosDrive, setDocumentosDrive] = useState<{ id: string; tipo: string; archivo: string; fecha: string }[]>([
    { id: 'DOC-1', tipo: 'DNI Frente y Dorso', archivo: 'dni_frente_dorso.pdf', fecha: '10/02/2026' },
    { id: 'DOC-2', tipo: 'Último Recibo de Sueldo', archivo: 'recibo_haberes_09_2026.pdf', fecha: '05/10/2026' },
    { id: 'DOC-3', tipo: 'Constancia de CBU Bancaria', archivo: 'constancia_bersa_cbu.pdf', fecha: '12/01/2026' },
    { id: 'DOC-4', tipo: 'Mutuo Firmado', archivo: 'mutuo_ayuda_fedem_2026.pdf', fecha: '15/03/2026' }
  ]);
  const [nuevoDocTipo, setNuevoDocTipo] = useState('Recibo de Sueldo Adicional');
  const [nuevoDocNombre, setNuevoDocNombre] = useState('nuevo_comprobante.pdf');

  const showToast = (msg: string) => {
    setToastNotificacion(msg);
    setTimeout(() => setToastNotificacion(null), 3000);
  };

  const abrirFicha = (socio: SocioPadron) => {
    setSocioSeleccionado(socio);
    setEditSocio({ ...socio });
    setTabFicha('PERSONALES');
  };

  const handleGuardarCambiosFicha = () => {
    if (!editSocio) return;
    onGuardarSocio(editSocio);
    setSocioSeleccionado(editSocio);
    showToast('¡Ficha 360° actualizada exitosamente!');
  };

  // Filtrado de socios
  const sociosFiltrados = useMemo(() => {
    return socios.filter((s) => {
      const matchOrg =
        filtroOrganismo === 'TODOS' ||
        (filtroOrganismo === 'PROVINCIAL' && s.Organismo.toLowerCase().includes('provincia')) ||
        (filtroOrganismo === 'MUNICIPAL' && s.Organismo.toLowerCase().includes('municipal'));

      const matchCuota =
        filtroCuota === 'TODOS' ||
        (filtroCuota === 'AL_DIA' && s.Estado_Cuota_Social === 'Al Día') ||
        (filtroCuota === 'MORA' && s.Estado_Cuota_Social !== 'Al Día');

      const q = busqueda.toLowerCase().trim();
      const matchQ =
        !q ||
        s.Apellido_Nombre.toLowerCase().includes(q) ||
        s.DNI.includes(q) ||
        s.Nro_Socio.includes(q) ||
        s.Organismo.toLowerCase().includes(q) ||
        s.Dependencia_Funcion.toLowerCase().includes(q);

      return matchOrg && matchCuota && matchQ;
    });
  }, [socios, filtroOrganismo, filtroCuota, busqueda]);

  // Recálculo del margen en analizador IA
  const totalHaberes = itemsReciboManuales
    .filter((i) => i.tipo === 'HABER')
    .reduce((sum, i) => sum + i.importe, 0);
  const totalDescuentos = itemsReciboManuales
    .filter((i) => i.tipo === 'DESCUENTO')
    .reduce((sum, i) => sum + i.importe, 0);
  const netoCalculadoIA = totalHaberes - totalDescuentos;
  const margenCuotaCalculadoIA = Math.round(netoCalculadoIA * 0.35); // 35% por ley provincial

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
            Módulo 1 • Backoffice Central
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Padrón General y Ficha Socio 360°
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión integral de asociados, haberes computables, legajos Drive y compliance normativo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNuevoSocio(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Socio
        </button>
      </div>

      {toastNotificacion && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastNotificacion}</span>
        </div>
      )}

      {/* FILTROS Y BUSCADOR MULTICRITERIO */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por DNI, N° de Socio, Apellido, Organismo o Dependencia..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filtroOrganismo}
            onChange={(e) => setFiltroOrganismo(e.target.value)}
            className="py-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="TODOS">Todos los Organismos</option>
            <option value="PROVINCIAL">Provinciales</option>
            <option value="MUNICIPAL">Municipales</option>
          </select>

          <select
            value={filtroCuota}
            onChange={(e) => setFiltroCuota(e.target.value)}
            className="py-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="TODOS">Cuota Social: Todas</option>
            <option value="AL_DIA">Al Día 🟢</option>
            <option value="MORA">En Mora 🔴</option>
          </select>
        </div>
      </div>

      {/* TABLA OBLIGATORIA CON LAS 9 COLUMNAS EXACTAS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">1. N° Socio</th>
                <th className="py-3 px-3">2. Apellido y Nombres</th>
                <th className="py-3 px-3">3. DNI</th>
                <th className="py-3 px-3">4. Organismo</th>
                <th className="py-3 px-3">5. Condición</th>
                <th className="py-3 px-3">6. Dependencia / Trabajo</th>
                <th className="py-3 px-3">7. Cuota Social</th>
                <th className="py-3 px-3">8. Estado / Alertas</th>
                <th className="py-3 px-3 text-center">9. Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sociosFiltrados.map((s) => {
                const tieneAlertas =
                  s.Bloqueado_Legales === 'SI' ||
                  s.En_Tramite_Jubilacion === 'SI' ||
                  s.Alivio_Financiero === 'SI' ||
                  s.Pagos_Duplicados === 'SI';

                return (
                  <tr key={s.DNI} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">#{s.Nro_Socio}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.Apellido_Nombre}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{s.DNI}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.Organismo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{s.Condicion_Laboral}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={s.Dependencia_Funcion}>
                      {s.Dependencia_Funcion}
                    </td>
                    <td className="py-3 px-3">
                      {s.Estado_Cuota_Social === 'Al Día' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Al día 🟢
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Mora 🔴
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {s.Bloqueado_Legales === 'SI' ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          Bloqueo Legales
                        </span>
                      ) : s.En_Tramite_Jubilacion === 'SI' ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Trámite Jubilación
                        </span>
                      ) : s.Alivio_Financiero === 'SI' ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                          Alivio Financiero
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Sin Alertas</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => abrirFicha(s)}
                        className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-colors"
                      >
                        Ver Ficha 360°
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          DRAWER / MODAL DE PANTALLA COMPLETA: FICHA SOCIO 360° (7 PESTAÑAS)
          ========================================================================= */}
      {socioSeleccionado && editSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Drawer 360 */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  {editSocio.Apellido_Nombre.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold">{editSocio.Apellido_Nombre}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Socio #{editSocio.Nro_Socio}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    DNI {editSocio.DNI} • {editSocio.Organismo} • {editSocio.Dependencia_Funcion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGuardarCambiosFicha}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Ficha
                </button>
                <button
                  type="button"
                  onClick={() => setSocioSeleccionado(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BARRA DE LAS 7 PESTAÑAS OPERATIVAS */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'PERSONALES', label: '1. Datos Personales/Laborales' },
                { id: 'CAPACIDAD_RECIBOS', label: '2. Capacidad Económica' },
                { id: 'FAMILIARES_SUBSIDIOS', label: '3. Familia y Subsidios' },
                { id: 'CONSUMOS', label: '4. Historial Consumos' },
                { id: 'FIDELIDAD', label: '5. Fidelización & Cupones' },
                { id: 'LEGAJO_DRIVE', label: '6. Legajo Google Drive' },
                { id: 'ANALIZADOR_IA', label: '7. Analizador Recibos IA' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTabFicha(tab.id as TabFicha360)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    tabFicha === tab.id
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENIDO INTERNO DE CADA PESTAÑA */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* TAB 1: DATOS PERSONALES Y LABORALES */}
              {tabFicha === 'PERSONALES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Apellido y Nombres</label>
                    <input
                      type="text"
                      value={editSocio.Apellido_Nombre}
                      onChange={(e) => setEditSocio({ ...editSocio, Apellido_Nombre: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={editSocio.Telefono_WhatsApp}
                      onChange={(e) => setEditSocio({ ...editSocio, Telefono_WhatsApp: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={editSocio.Email}
                      onChange={(e) => setEditSocio({ ...editSocio, Email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Domicilio y Localidad</label>
                    <input
                      type="text"
                      value={`${editSocio.Domicilio}, ${editSocio.Localidad}`}
                      onChange={(e) => setEditSocio({ ...editSocio, Domicilio: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">CBU / Alias Bancario</label>
                    <input
                      type="text"
                      value={editSocio.CBU_Alias}
                      onChange={(e) => setEditSocio({ ...editSocio, CBU_Alias: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Banco y Legajo</label>
                    <input
                      type="text"
                      value={`${editSocio.Banco} - Legajo #${editSocio.Legajo_Sueldo}`}
                      onChange={(e) => setEditSocio({ ...editSocio, Banco: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CAPACIDAD ECONÓMICA Y RECIBOS */}
              {tabFicha === 'CAPACIDAD_RECIBOS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500">Sueldo Bruto</p>
                      <p className="text-lg font-extrabold text-slate-900 font-mono">
                        {formatMonedaAR(editSocio.Sueldo_Bruto)}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500">Afectaciones Ley (20%)</p>
                      <p className="text-lg font-extrabold text-rose-700 font-mono">
                        -{formatMonedaAR(editSocio.Afectaciones_Ley)}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500">Sueldo Neto de Bolsillo</p>
                      <p className="text-lg font-extrabold text-blue-900 font-mono">
                        {formatMonedaAR(editSocio.Sueldo_Neto)}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <p className="text-xs text-emerald-800 font-bold">Margen Cuota Disponible</p>
                      <p className="text-lg font-extrabold text-emerald-700 font-mono">
                        {formatMonedaAR(editSocio.Margen_Cuota_Disponible)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                    <p>
                      El margen de cuota se encuentra regulado por el Decreto Provincial 418/19 y el régimen municipal correspondiente al 35% del sueldo neto disponible luego de afectaciones particulares.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: GRUPO FAMILIAR Y SUBSIDIOS */}
              {tabFicha === 'FAMILIARES_SUBSIDIOS' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Familiares a Cargo Registrados ({familiares.length})
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                      {familiares.map((f) => (
                        <div key={f.id} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{f.nombre}</p>
                            <p className="text-slate-500 font-mono">
                              {f.parentesco} • DNI {f.dni} • Nac. {f.fechaNacimiento}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFamiliares(familiares.filter((x) => x.id !== f.id))}
                            className="text-rose-500 hover:text-rose-700 text-xs p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Formulario Agregar Familiar */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nuevoFamNombre}
                        onChange={(e) => setNuevoFamNombre(e.target.value)}
                        className="col-span-2 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="DNI"
                        value={nuevoFamDni}
                        onChange={(e) => setNuevoFamDni(e.target.value)}
                        className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!nuevoFamNombre || !nuevoFamDni) return;
                          setFamiliares([
                            ...familiares,
                            {
                              id: `FAM-${Date.now()}`,
                              nombre: nuevoFamNombre,
                              parentesco: nuevoFamParentesco,
                              dni: nuevoFamDni,
                              fechaNacimiento: '2018-05-10',
                              aCargo: true
                            }
                          ]);
                          setNuevoFamNombre('');
                          setNuevoFamDni('');
                          showToast('Familiar agregado.');
                        }}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HISTORIAL DE CONSUMOS */}
              {tabFicha === 'CONSUMOS' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Consumos y Ayudas Registradas en Mutual
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span>Crédito FEDEM Provincial (Expediente #4892)</span>
                      <strong className="font-mono">$ 850.000 (24 cuotas de $ 94.862)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span>Órdenes de Farmacia Modelo (Setiembre 2026)</span>
                      <strong className="font-mono">$ 48.200 (Al cobro en haberes)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Compra Electrodomésticos Paraná (Ticket #402)</span>
                      <strong className="font-mono">$ 180.000 (6 cuotas)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FIDELIZACIÓN & CUPONES */}
              {tabFicha === 'FIDELIDAD' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Tarjeta de 10 Sellos</h4>
                      <p className="text-xs text-amber-700 mt-0.5">7 de 10 sellos acumulados</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-amber-500 text-white rounded-full">
                      Próximo Canje: $25.000
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 6: LEGAJO DIGITAL EN GOOGLE DRIVE */}
              {tabFicha === 'LEGAJO_DRIVE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Documentación Digitalizada en Google Drive
                      </h4>
                      <p className="text-xs text-slate-500">
                        Carpeta ID: <code>drive.google.com/folders/MUTUAL_SOCIO_{editSocio.DNI}</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Carpeta sincronizada con Google Drive API.')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Crear Carpeta Drive
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    {documentosDrive.map((doc) => (
                      <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-bold text-slate-800">{doc.tipo}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{doc.archivo} • {doc.fecha}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocumentosDrive(documentosDrive.filter((d) => d.id !== doc.id))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cargador para Subir Documento */}
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Subir y categorizar nuevo comprobante</p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                      <input
                        type="text"
                        value={nuevoDocTipo}
                        onChange={(e) => setNuevoDocTipo(e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentosDrive([
                            ...documentosDrive,
                            {
                              id: `DOC-${Date.now()}`,
                              tipo: nuevoDocTipo,
                              archivo: `doc_${Date.now()}.pdf`,
                              fecha: new Date().toLocaleDateString('es-AR')
                            }
                          ]);
                          showToast('Documento subido a Drive con éxito.');
                        }}
                        className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                      >
                        Subir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: ANALIZADOR DE RECIBOS IA CON AFECTACIONES MANUALES */}
              {tabFicha === 'ANALIZADOR_IA' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                        OCR Inteligente y Desglose de Haberes
                      </h4>
                    </div>
                    <p className="text-xs text-blue-800">
                      Permite añadir manualmente conceptos no computables o marcas de afectación (ej. BERSA, Embargos Judiciales) recalculando el margen computable al instante.
                    </p>
                  </div>

                  {/* Listado de Ítems del Recibo */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    {itemsReciboManuales.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.concepto}</p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.tipo === 'HABER'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.tipo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {formatMonedaAR(item.importe)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setItemsReciboManuales(itemsReciboManuales.filter((_, i) => i !== idx))
                            }
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formulario Añadir Concepto Manual */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-700">Añadir Afectación Manual o Ajuste OCR</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={nuevoConcepto}
                        onChange={(e) => setNuevoConcepto(e.target.value)}
                        placeholder="Concepto (ej. Embargo Judicial)"
                        className="md:col-span-2 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="number"
                        value={nuevoImporte}
                        onChange={(e) => setNuevoImporte(Number(e.target.value))}
                        placeholder="Importe"
                        className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setItemsReciboManuales([
                            ...itemsReciboManuales,
                            { concepto: nuevoConcepto, importe: nuevoImporte, tipo: nuevoTipo }
                          ]);
                          showToast('Concepto añadido al cálculo.');
                        }}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>

                  {/* Resumen Recalculado */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-blue-900 text-white rounded-2xl">
                    <div>
                      <p className="text-[10px] text-blue-200">Haberes Computables</p>
                      <p className="text-base font-extrabold font-mono">{formatMonedaAR(totalHaberes)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-200">Descuentos y Afectaciones</p>
                      <p className="text-base font-extrabold font-mono text-rose-300">-{formatMonedaAR(totalDescuentos)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-200 font-bold">Nuevo Margen Disponible</p>
                      <p className="text-base font-extrabold font-mono text-emerald-300">
                        {formatMonedaAR(margenCuotaCalculadoIA)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL ALTA NUEVO SOCIO (ABM) ===================== */}
      {modalNuevoSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Alta de Nuevo Asociado</h3>
              <button
                type="button"
                onClick={() => setModalNuevoSocio(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const nuevoS: SocioPadron = {
                  DNI: (form.elements.namedItem('dni') as HTMLInputElement).value,
                  Nro_Socio: `${socios.length + 1001}`,
                  Apellido_Nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
                  Fecha_Nacimiento: '1985-05-10',
                  Edad: 41,
                  Sexo: 'M',
                  Domicilio: 'Calle San Martín 540',
                  Localidad: 'Paraná',
                  Telefono_WhatsApp: (form.elements.namedItem('telefono') as HTMLInputElement).value,
                  Email: 'nuevo.socio@mutualmodelo.com.ar',
                  CBU_Alias: '0070012300000000000000',
                  Banco: 'Banco de Entre Ríos (BERSA)',
                  Organismo: (form.elements.namedItem('organismo') as HTMLSelectElement).value,
                  Sector_Trabajo: 'Administración General',
                  Dependencia_Funcion: 'Casa de Gobierno',
                  Condicion_Laboral: 'Planta Permanente',
                  Legajo_Sueldo: `${Math.floor(10000 + Math.random() * 90000)}`,
                  Sueldo_Bruto: Number((form.elements.namedItem('sueldo') as HTMLInputElement).value),
                  Afectaciones_Ley: Number((form.elements.namedItem('sueldo') as HTMLInputElement).value) * 0.2,
                  Afectaciones_Particulares: 0,
                  Sueldo_Neto: Number((form.elements.namedItem('sueldo') as HTMLInputElement).value) * 0.8,
                  Margen_Cuota_Disponible: Number((form.elements.namedItem('sueldo') as HTMLInputElement).value) * 0.8 * 0.35,
                  Monto_Preaprobado: Number((form.elements.namedItem('sueldo') as HTMLInputElement).value) * 0.8 * 0.35 * 10,
                  Estado_Cuota_Social: 'Al Día',
                  Deuda_Cuota_Social: 0,
                  En_Tramite_Jubilacion: 'NO',
                  Detalle_Jubilacion: '',
                  Bloqueado_Legales: 'NO',
                  Detalle_Legales: '',
                  Pagos_Duplicados: 'NO',
                  Detalle_Pagos_Duplicados: '',
                  Alivio_Financiero: 'NO',
                  Mutuales_Alivio: '',
                  Certificacion_Deuda: 'NO',
                  Detalle_Certificacion: '',
                  Estado_PEP: 'NO_PEP',
                  Estado_REPET: 'LIMPIO',
                  Estado_ARCA_Constancia: 'ACTIVO_REGULAR',
                  Estado_Inhibicion_Judicial: 'HABILITADO',
                  Condicion_Previsional: 'ACTIVO_APORTANTE',
                  Fecha_Auditoria_Normativa: new Date().toLocaleDateString('es-AR'),
                  Subsidios_JSON: '[]',
                  Grupo_Familiar_JSON: '[]',
                  Carpeta_Drive_ID: 'DRIVE_NEW_FOLDER',
                  Carpeta_Drive_URL: 'https://drive.google.com',
                  Originacion: 'Orgánica',
                  Fecha_Alta: new Date().toISOString().slice(0, 10),
                  Ultima_Actualizacion: new Date().toISOString().slice(0, 10),
                  Operador: 'Julian'
                };

                onCrearSocio(nuevoS);
                setModalNuevoSocio(false);
                showToast(`Socio ${nuevoS.Apellido_Nombre} registrado con éxito.`);
              }}
              className="space-y-3 pt-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Apellido y Nombres</label>
                <input name="nombre" required placeholder="Ej. ALBORNOZ, Roberto" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">DNI</label>
                  <input name="dni" required placeholder="32456789" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono WhatsApp</label>
                  <input name="telefono" required placeholder="0343-154987654" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Organismo</label>
                  <select name="organismo" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50">
                    <option value="Gobierno de Entre Ríos (Provincial)">Gobierno de Entre Ríos (Provincial)</option>
                    <option value="Municipalidad de Paraná">Municipalidad de Paraná</option>
                    <option value="CGE - Consejo General de Educación">CGE - Consejo Educación</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sueldo Bruto ($)</label>
                  <input name="sueldo" type="number" defaultValue={850000} required className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                Confirmar Alta de Asociado
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
