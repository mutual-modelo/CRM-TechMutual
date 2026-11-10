import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ComercioAlianzaB2B, PromocionPoolReintegro, RubroComercioB2B } from '../../types/crm';
import {
  MapPin,
  List,
  Search,
  Filter,
  Store,
  Clock,
  Sparkles,
  Phone,
  QrCode,
  Navigation,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DirectorioComerciosMapaProps {
  comercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  onSeleccionarParaPagoQR: (comercio: ComercioAlianzaB2B) => void;
}

export const DirectorioComerciosMapa: React.FC<DirectorioComerciosMapaProps> = ({
  comercios,
  promociones,
  onSeleccionarParaPagoQR
}) => {
  const [vistaModo, setVistaModo] = useState<'MAPA' | 'LISTA'>('MAPA');
  const [busqueda, setBusqueda] = useState('');
  const [rubroFiltro, setRubroFiltro] = useState<string>('TODOS');
  const [comercioSeleccionado, setComercioSeleccionado] = useState<ComercioAlianzaB2B | null>(null);
  const [modalRubrosAbierto, setModalRubrosAbierto] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Lista de rubros disponibles para filtro
  const rubrosDisponibles = useMemo(() => {
    const setR = new Set<string>();
    comercios.forEach((c) => setR.add(c.Rubro));
    return ['TODOS', ...Array.from(setR)];
  }, [comercios]);

  // Filtrado reactivo de comercios
  const comerciosFiltrados = useMemo(() => {
    return comercios.filter((c) => {
      const matchRubro = rubroFiltro === 'TODOS' || c.Rubro === rubroFiltro;
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        c.Nombre_Fantasia.toLowerCase().includes(q) ||
        c.Rubro.toLowerCase().includes(q) ||
        c.Direccion.toLowerCase().includes(q) ||
        (c.Descripcion && c.Descripcion.toLowerCase().includes(q));
      return matchRubro && matchBusqueda;
    });
  }, [comercios, rubroFiltro, busqueda]);

  // Ícono según rubro
  const getRubroBadgeColor = (rubro: RubroComercioB2B) => {
    switch (rubro) {
      case 'Farmacia':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Proveeduría':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Motos & Movilidad':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Óptica':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Odontología':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'Turismo & Hotelería':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Electro & Hogar':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getRubroEmoji = (rubro: RubroComercioB2B) => {
    switch (rubro) {
      case 'Farmacia':
        return '💊';
      case 'Proveeduría':
        return '🛒';
      case 'Motos & Movilidad':
        return '🏍️';
      case 'Náutica & Pesca':
        return '⛵';
      case 'Óptica':
        return '👓';
      case 'Odontología':
        return '🦷';
      case 'Turismo & Hotelería':
        return '🏖️';
      case 'Electro & Hogar':
        return '⚡';
      default:
        return '🏪';
    }
  };

  // Inicializar o actualizar mapa Leaflet
  useEffect(() => {
    if (vistaModo !== 'MAPA' || !mapContainerRef.current) return;

    // Verificar si Leaflet está cargado globalmente (window.L)
    const L = (window as any).L;
    if (!L) {
      console.warn('Librería Leaflet no detectada aún en window.L');
      return;
    }

    // Inicializar mapa si no existe
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([-31.7332, -60.5289], 14); // Centro Paraná, Entre Ríos

      // Capa de mosaicos OpenStreetMap con diseño claro y nítido
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      leafletMapRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
    }

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;

    // Limpiar marcadores anteriores
    if (markersGroup) {
      markersGroup.clearLayers();
    }

    // Agregar marcadores de los comercios filtrados
    comerciosFiltrados.forEach((c) => {
      const lat = c.Latitud ?? -31.7332;
      const lng = c.Longitud ?? -60.5289;

      // Crear icono HTML personalizado para Leaflet
      const emoji = getRubroEmoji(c.Rubro);
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: #135596;
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${emoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup informativo enriquecido
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 180px;">
          <strong style="color: #135596; font-size: 13px; display: block; margin-bottom: 2px;">${c.Nombre_Fantasia}</strong>
          <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">${c.Rubro}</span>
          <p style="margin: 4px 0; font-size: 11px;">📍 ${c.Direccion}, ${c.Localidad}</p>
          <div style="margin-top: 6px;">
            <span style="background: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">ABIERTO AHORA 🟢</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setComercioSeleccionado(c);
      });

      markersGroup.addLayer(marker);
    });

    // Ajustar zoom y vista si hay marcadores
    if (markersGroup.getLayers().length > 0) {
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      // Dejar el mapa activo mientras siga en vista mapa
    };
  }, [vistaModo, comerciosFiltrados]);

  // Limpiar mapa al desmontar el componente completo
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Cabecera y Conmutador de Vistas */}
      <div className="p-4 bg-slate-800/95 rounded-3xl border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#135596] flex items-center justify-center text-white shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                Directorio & Mapa de Comercios
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Red aliada de la Asociación Mutual Modelo
              </p>
            </div>
          </div>

          {/* Selector Conmutador Dual: Mapa / Listado */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setVistaModo('MAPA')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                vistaModo === 'MAPA'
                  ? 'bg-[#135596] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaModo('LISTA')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                vistaModo === 'LISTA'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Listado ({comerciosFiltrados.length})</span>
            </button>
          </div>
        </div>

        {/* Buscador en tiempo real */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por comercio, dirección, medicamentos, motos, etc..."
            className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#135596]"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botón Prominente de Filtro de Rubros (CERO SCROLL HORIZONTAL) */}
        <button
          type="button"
          onClick={() => setModalRubrosAbierto(true)}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 hover:from-slate-800 hover:to-slate-800 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl text-xs font-bold text-white flex items-center justify-between shadow-md transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>
              Filtrar por Rubro:{' '}
              <strong className="text-emerald-400 font-extrabold ml-1">
                {rubroFiltro === 'TODOS' ? 'Todos los Rubros' : rubroFiltro}
              </strong>
            </span>
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
            <span>Cambiar</span>
            <span>▼</span>
          </span>
        </button>
      </div>

      {/* VISTA 1: MAPA INTERACTIVO LEAFLET */}
      {vistaModo === 'MAPA' && (
        <div className="relative bg-slate-900 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl">
          <div
            ref={mapContainerRef}
            className="w-full h-[360px] z-10"
            style={{ minHeight: '360px' }}
          />

          {/* Banner Flotante Inferior de Indicación */}
          <div className="absolute bottom-3 inset-x-3 z-20 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between pointer-events-auto">
              <span className="text-[11px] text-slate-300 font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  Mostrando <strong>{comerciosFiltrados.length} comercios</strong> en Paraná y Entre Ríos
                </span>
              </span>
              <button
                type="button"
                onClick={() => setVistaModo('LISTA')}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver lista</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: LISTADO FILTRABLE */}
      {vistaModo === 'LISTA' && (
        <div className="space-y-2.5">
          {comerciosFiltrados.length === 0 ? (
            <div className="p-8 bg-slate-800/60 rounded-3xl border border-slate-800 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">No se encontraron comercios</h4>
              <p className="text-[11px] text-slate-400">
                Pruebe ajustando los términos de búsqueda o cambiando el filtro de rubro.
              </p>
            </div>
          ) : (
            comerciosFiltrados.map((c) => {
              const promos = c.Promos_Activas_JSON ? JSON.parse(c.Promos_Activas_JSON) : [];
              return (
                <div
                  key={c.ID_Comercio}
                  onClick={() => setComercioSeleccionado(c)}
                  className="p-4 bg-slate-800/90 hover:bg-slate-750 rounded-2xl border border-slate-700/80 hover:border-[#135596]/60 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {getRubroEmoji(c.Rubro)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase border ${getRubroBadgeColor(
                              c.Rubro
                            )}`}
                          >
                            {c.Rubro}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                            ABIERTO 🟢
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-white mt-1 truncate">
                          {c.Nombre_Fantasia}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {c.Direccion}, {c.Localidad}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-0.5 text-amber-400 font-mono text-xs font-bold justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.Calificacion ?? 4.8}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Hasta {c.Planes_Cuotas_JSON ? JSON.parse(c.Planes_Cuotas_JSON).slice(-1)[0] : 6} ctas
                      </span>
                    </div>
                  </div>

                  {/* Promoción destacada si existe */}
                  {promos.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="flex items-center gap-1 font-semibold truncate">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{promos[0]}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FICHA INFORMATIVA DE COMERCIO (MODAL / DRAWER DETALLE) */}
      {comercioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setComercioSeleccionado(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera del Comercio */}
            <div className="flex items-start gap-3 border-b border-slate-800 pb-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#135596] to-blue-500 flex items-center justify-center text-2xl shadow-md shrink-0">
                {getRubroEmoji(comercioSeleccionado.Rubro)}
              </div>
              <div className="min-w-0 pr-6">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase border ${getRubroBadgeColor(
                      comercioSeleccionado.Rubro
                    )}`}
                  >
                    {comercioSeleccionado.Rubro}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                    ABIERTO AHORA 🟢
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-white mt-1 leading-snug">
                  {comercioSeleccionado.Nombre_Fantasia}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  CUIT: {comercioSeleccionado.CUIT_Responsable}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="leading-relaxed font-sans text-slate-200">
                {comercioSeleccionado.Descripcion ||
                  'Comercio formalmente adherido a la red de beneficios y Billetera Virtual de la Mutual Modelo.'}
              </p>

              {/* Horarios y Ubicación */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">
                      Horarios de Atención
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {comercioSeleccionado.Horarios_Atencion || 'Lunes a Sábados 08:30 a 20:30 hs'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">
                      Dirección Física
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {comercioSeleccionado.Direccion}, {comercioSeleccionado.Localidad}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${
                      comercioSeleccionado.Latitud ?? -31.7332
                    },${comercioSeleccionado.Longitud ?? -60.5289}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Cómo llegar</span>
                  </a>
                </div>
              </div>

              {/* Promociones y Beneficios Activos */}
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Promociones & Beneficios Activos</span>
                </span>

                <div className="space-y-1.5">
                  {comercioSeleccionado.Promos_Activas_JSON ? (
                    JSON.parse(comercioSeleccionado.Promos_Activas_JSON).map(
                      (pText: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{pText}</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 text-[11px]">
                      Financiación en hasta 6 cuotas mutuales sin interés con Billetera 1 y 2.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de Acción Rápida: Pagar con QR en este Comercio */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const com = comercioSeleccionado;
                  setComercioSeleccionado(null);
                  onSeleccionarParaPagoQR(com);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-950" />
                <span>Pagar con QR en este Comercio</span>
              </button>

              <button
                type="button"
                onClick={() => setComercioSeleccionado(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESLIZANTE INFERIOR (BOTTOM SHEET) PARA FILTRADO DE RUBROS (CERO SCROLL HORIZONTAL) */}
      {modalRubrosAbierto && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setModalRubrosAbierto(false)}
        >
          <div
            className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Manija táctil superior */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🔍
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Seleccionar Rubro Comercial</h3>
                  <p className="text-[10px] text-slate-400">Comercios adheridos con reintegros en Entre Ríos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalRubrosAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cuadrícula Táctil Vertical de Rubros (Cero Scroll Horizontal) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {rubrosDisponibles.map((r) => {
                const isSelected = rubroFiltro === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRubroFiltro(r);
                      setModalRubrosAbierto(false);
                    }}
                    className={`p-3 rounded-2xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">
                      {r === 'TODOS' ? '🌐' : getRubroEmoji(r as any)}
                    </span>
                    <span className="text-xs font-bold leading-tight">
                      {r === 'TODOS' ? 'Todos los Rubros' : r}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {r === 'TODOS'
                        ? `${comercios.length} comercios`
                        : `${comercios.filter((c) => c.Rubro === r).length} locales`}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setModalRubrosAbierto(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Listo / Volver al Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
