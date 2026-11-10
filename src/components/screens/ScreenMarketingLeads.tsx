import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Globe,
  Share2,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatMonedaAR } from '../../utils/financialCalculations';

export interface LeadCampana {
  id: string;
  fechaHora: string;
  apellidoNombre: string;
  dni: string;
  telefono: string;
  canal: 'Meta Ads (Facebook/Instagram)' | 'Google Search' | 'TikTok Ads' | 'WhatsApp Referidos';
  organismoConvenio: string;
  montoInteres: number;
  cuotasInteres: number;
  calidadScore: 'Alta' | 'Media' | 'Baja' | 'No Califica';
  estadoLead: 'Nuevo' | 'Contactado WhatsApp' | 'Documentación Solicitada' | 'Pre-Aprobado' | 'Convertido a Ayuda' | 'Descartado';
  cpl: number;
  operadorAsignado: string;
  notas: string;
}

const INITIAL_LEADS: LeadCampana[] = [
  {
    id: 'LEAD-9481',
    fechaHora: '09/11/2026 14:22',
    apellidoNombre: 'Sánchez, María Elena',
    dni: '29841250',
    telefono: '343-4589210',
    canal: 'Meta Ads (Facebook/Instagram)',
    organismoConvenio: 'Docente CGE Entre Ríos',
    montoInteres: 350000,
    cuotasInteres: 24,
    calidadScore: 'Alta',
    estadoLead: 'Pre-Aprobado',
    cpl: 420,
    operadorAsignado: 'Julian',
    notas: 'Interesada en línea FEDEM. Recibo de sueldo sin afectación previa.'
  },
  {
    id: 'LEAD-9482',
    fechaHora: '09/11/2026 13:40',
    apellidoNombre: 'Ríos, Gonzalo Damián',
    dni: '34112984',
    telefono: '343-5120489',
    canal: 'TikTok Ads',
    organismoConvenio: 'Municipalidad de Paraná',
    montoInteres: 200000,
    cuotasInteres: 12,
    calidadScore: 'Alta',
    estadoLead: 'Contactado WhatsApp',
    cpl: 380,
    operadorAsignado: 'Melina',
    notas: 'Ingresó por video de Billetera Virtual y convenio motos.'
  },
  {
    id: 'LEAD-9483',
    fechaHora: '09/11/2026 11:15',
    apellidoNombre: 'Villalba, Horacio Alberto',
    dni: '24980124',
    telefono: '343-4109842',
    canal: 'Google Search',
    organismoConvenio: 'Policía de Entre Ríos',
    montoInteres: 600000,
    cuotasInteres: 36,
    calidadScore: 'Alta',
    estadoLead: 'Convertido a Ayuda',
    cpl: 560,
    operadorAsignado: 'Julian',
    notas: 'Buscó préstamos mutuales Entre Ríos. Ayuda FEDEM liquidada hoy.'
  },
  {
    id: 'LEAD-9484',
    fechaHora: '09/11/2026 10:05',
    apellidoNombre: 'Toledo, Claudia Beatriz',
    dni: '32450891',
    telefono: '3442-458912',
    canal: 'Meta Ads (Facebook/Instagram)',
    organismoConvenio: 'Salud Pública Entre Ríos',
    montoInteres: 150000,
    cuotasInteres: 12,
    calidadScore: 'Media',
    estadoLead: 'Documentación Solicitada',
    cpl: 420,
    operadorAsignado: 'Lucrecia',
    notas: 'Enfermera en Hospital San Martín. Enviará recibo de haberes por Drive.'
  },
  {
    id: 'LEAD-9485',
    fechaHora: '08/11/2026 18:50',
    apellidoNombre: 'García, Pedro Ignacio',
    dni: '27891230',
    telefono: '343-4890123',
    canal: 'WhatsApp Referidos',
    organismoConvenio: 'Jubilado Provincial Ley 8732',
    montoInteres: 250000,
    cuotasInteres: 18,
    calidadScore: 'Alta',
    estadoLead: 'Pre-Aprobado',
    cpl: 180,
    operadorAsignado: 'Andrea',
    notas: 'Recomendado por socio activo N° 10.428. Cupo precalificado.'
  },
  {
    id: 'LEAD-9486',
    fechaHora: '08/11/2026 16:30',
    apellidoNombre: 'Benítez, Lucas Martín',
    dni: '39410293',
    telefono: '343-5891234',
    canal: 'TikTok Ads',
    organismoConvenio: 'Privado / Monotributo',
    montoInteres: 100000,
    cuotasInteres: 12,
    calidadScore: 'No Califica',
    estadoLead: 'Descartado',
    cpl: 380,
    operadorAsignado: 'Melina',
    notas: 'No pertenece a convenios de haberes provinciales ni municipales.'
  }
];

export const ScreenMarketingLeads: React.FC = () => {
  const [leads, setLeads] = useState<LeadCampana[]>(INITIAL_LEADS);
  const [filtroCanal, setFiltroCanal] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [leadModal, setLeadModal] = useState<LeadCampana | null>(null);

  // Métricas Consolidadas del Funnel
  const metricas = useMemo(() => {
    const total = leads.length;
    const convertidos = leads.filter((l) => l.estadoLead === 'Convertido a Ayuda').length;
    const preaprobados = leads.filter((l) => l.estadoLead === 'Pre-Aprobado').length;
    const cplPromedio = Math.round(leads.reduce((acc, l) => acc + l.cpl, 0) / (total || 1));
    const inversionTotal = leads.reduce((acc, l) => acc + l.cpl, 0);
    const cac = convertidos > 0 ? Math.round(inversionTotal / convertidos) : 1850;
    const tasaConversion = total > 0 ? ((convertidos / total) * 100).toFixed(1) : '0';
    const volumenOriginado = leads
      .filter((l) => l.estadoLead === 'Convertido a Ayuda')
      .reduce((acc, l) => acc + l.montoInteres, 0);

    return {
      total,
      convertidos,
      preaprobados,
      cplPromedio,
      cac,
      tasaConversion,
      inversionTotal,
      volumenOriginado
    };
  }, [leads]);

  // Filtrado reactivo
  const leadsFiltrados = useMemo(() => {
    return leads.filter((l) => {
      const matchCanal = filtroCanal === 'TODOS' || l.canal === filtroCanal;
      const matchEstado = filtroEstado === 'TODOS' || l.estadoLead === filtroEstado;
      const q = busqueda.toLowerCase().trim();
      const matchQ =
        !q ||
        l.apellidoNombre.toLowerCase().includes(q) ||
        l.dni.includes(q) ||
        l.telefono.includes(q) ||
        l.organismoConvenio.toLowerCase().includes(q);
      return matchCanal && matchEstado && matchQ;
    });
  }, [leads, filtroCanal, filtroEstado, busqueda]);

  const getCalidadBadge = (calidad: LeadCampana['calidadScore']) => {
    switch (calidad) {
      case 'Alta':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Media':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Baja':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'No Califica':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  const getEstadoBadge = (estado: LeadCampana['estadoLead']) => {
    switch (estado) {
      case 'Convertido a Ayuda':
        return 'bg-emerald-600 text-white font-bold';
      case 'Pre-Aprobado':
        return 'bg-blue-600 text-white font-bold';
      case 'Documentación Solicitada':
        return 'bg-purple-500/30 text-purple-300 border border-purple-400/40';
      case 'Contactado WhatsApp':
        return 'bg-teal-500/30 text-teal-300 border border-teal-400/40';
      case 'Nuevo':
        return 'bg-amber-500/30 text-amber-300 border border-amber-400/40 animate-pulse';
      case 'Descartado':
        return 'bg-slate-700 text-slate-400 border border-slate-600';
    }
  };

  const contactarWhatsApp = (lead: LeadCampana) => {
    const texto = encodeURIComponent(
      `Hola ${lead.apellidoNombre.split(',')[1]?.trim() || lead.apellidoNombre} 👋 Te contactamos de Asociación Mutual Modelo de Entre Ríos. Vimos tu consulta para la línea de Ayuda Económica de ${formatMonedaAR(lead.montoInteres)} en ${lead.cuotasInteres} cuotas. ¿Querés que simulemos tu disponible de afectación hoy mismo?`
    );
    window.open(`https://wa.me/549${lead.telefono.replace(/[^0-9]/g, '')}?text=${texto}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-[#135596] to-slate-900 border border-slate-700/80 shadow-xl text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Target className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                GROWTH & PERFORMANCE MUTUAL
              </span>
              <span className="text-xs text-blue-200">Campañas Digitales 2026</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
              Funnel de Conversión, Leads & Marketing Digital
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nuevo: LeadCampana = {
                id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
                fechaHora: new Date().toLocaleString('es-AR'),
                apellidoNombre: 'Nuevo Prospecto Campaña',
                dni: '33100200',
                telefono: '343-4900123',
                canal: 'Meta Ads (Facebook/Instagram)',
                organismoConvenio: 'Docente CGE Entre Ríos',
                montoInteres: 300000,
                cuotasInteres: 18,
                calidadScore: 'Alta',
                estadoLead: 'Nuevo',
                cpl: 420,
                operadorAsignado: 'Julian',
                notas: 'Ingresó vía anuncio "Ayudas sin Burocracia en el día".'
              };
              setLeads([nuevo, ...leads]);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simular Webhook Lead Meta/TikTok</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Performance y Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CPL Promedio</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatMonedaAR(metricas.cplPromedio)}
          </div>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
            Meta Ads & TikTok
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CAC (Costo Adquisición)</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatMonedaAR(metricas.cac)}
          </div>
          <span className="text-[11px] text-blue-300 font-bold mt-1 inline-block">
            Por crédito originado
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tasa de Conversión</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {metricas.tasaConversion}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {metricas.convertidos} ayudas de {metricas.total} leads
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Volumen Originado</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {formatMonedaAR(metricas.volumenOriginado || 1200000)}
          </div>
          <span className="text-[11px] text-amber-400 font-bold mt-1 inline-block">
            RoAS: 4.8x de inversión
          </span>
        </div>
      </div>

      {/* Controles de Filtrado y Búsqueda */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar lead por nombre, DNI, teléfono u organismo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#135596]"
            />
          </div>

          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="TODOS">Todos los Canales</option>
            <option value="Meta Ads (Facebook/Instagram)">Meta Ads (FB/IG)</option>
            <option value="Google Search">Google Search</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="WhatsApp Referidos">WhatsApp Referidos</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Nuevo">Nuevos</option>
            <option value="Contactado WhatsApp">Contactados</option>
            <option value="Pre-Aprobado">Pre-Aprobados</option>
            <option value="Convertido a Ayuda">Convertidos</option>
            <option value="Descartado">Descartados</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Mostrando <strong>{leadsFiltrados.length} leads</strong>
        </span>
      </div>

      {/* Tabla de Leads y Funnel */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">ID / Fecha</th>
                <th className="p-3.5 font-bold">Prospecto / Teléfono</th>
                <th className="p-3.5 font-bold">Canal / Campaña</th>
                <th className="p-3.5 font-bold">Organismo / Convenio</th>
                <th className="p-3.5 font-bold">Monto / Cuotas</th>
                <th className="p-3.5 font-bold">Semáforo Calidad</th>
                <th className="p-3.5 font-bold">Estado Funnel</th>
                <th className="p-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {leadsFiltrados.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-blue-400 block">{l.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{l.fechaHora}</span>
                  </td>
                  <td className="p-3.5">
                    <strong className="text-white block">{l.apellidoNombre}</strong>
                    <span className="text-[11px] text-slate-400 font-mono">DNI {l.dni} • {l.telefono}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {l.canal}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">
                      CPL: ${l.cpl}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-300">{l.organismoConvenio}</span>
                  </td>
                  <td className="p-3.5">
                    <strong className="text-emerald-400 font-mono block">
                      {formatMonedaAR(l.montoInteres)}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {l.cuotasInteres} cuotas fijas
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getCalidadBadge(
                        l.calidadScore
                      )}`}
                    >
                      {l.calidadScore === 'Alta' && '🟢 Alta Calidad'}
                      {l.calidadScore === 'Media' && '🟡 Califica'}
                      {l.calidadScore === 'Baja' && '🟠 Observado'}
                      {l.calidadScore === 'No Califica' && '🔴 No Califica'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] ${getEstadoBadge(l.estadoLead)}`}>
                      {l.estadoLead}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => contactarWhatsApp(l)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm"
                        title="Contactar por WhatsApp Oficial"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setLeadModal(l)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-bold cursor-pointer"
                        title="Ver detalle de lead"
                      >
                        Gestionar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gestión de Lead */}
      {leadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                  FICHA DE PROSPECTO • {leadModal.id}
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {leadModal.apellidoNombre}
                </h3>
              </div>
              <button
                onClick={() => setLeadModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">DNI:</span>
                  <span className="text-white font-bold">{leadModal.dni}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TELÉFONO:</span>
                  <span className="text-white font-bold">{leadModal.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ORGANISMO:</span>
                  <span className="text-white font-bold">{leadModal.organismoConvenio}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MONTO SOLICITADO:</span>
                  <span className="text-emerald-400 font-bold">{formatMonedaAR(leadModal.montoInteres)}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  ESTADO EN EL FUNNEL:
                </label>
                <select
                  value={leadModal.estadoLead}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value as LeadCampana['estadoLead'];
                    setLeads(leads.map((x) => (x.id === leadModal.id ? { ...x, estadoLead: nuevoEstado } : x)));
                    setLeadModal({ ...leadModal, estadoLead: nuevoEstado });
                  }}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Contactado WhatsApp">Contactado WhatsApp</option>
                  <option value="Documentación Solicitada">Documentación Solicitada</option>
                  <option value="Pre-Aprobado">Pre-Aprobado</option>
                  <option value="Convertido a Ayuda">Convertido a Ayuda</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  NOTAS DE GESTIÓN OPERADOR:
                </label>
                <textarea
                  rows={3}
                  value={leadModal.notas}
                  onChange={(e) => {
                    const newNotas = e.target.value;
                    setLeads(leads.map((x) => (x.id === leadModal.id ? { ...x, notas: newNotas } : x)));
                    setLeadModal({ ...leadModal, notas: newNotas });
                  }}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => contactarWhatsApp(leadModal)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar WhatsApp</span>
              </button>
              <button
                onClick={() => setLeadModal(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
