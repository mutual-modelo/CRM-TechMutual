import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Search,
  Phone,
  Store,
  Sparkles,
  ExternalLink,
  X,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ComercioAlianzaB2B, PromocionPoolReintegro } from '../../types/crm';

interface PantallaMapaComerciosProps {
  comercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  onSeleccionarParaPagoQR?: (comercio: ComercioAlianzaB2B) => void;
}

export const PantallaMapaComercios: React.FC<PantallaMapaComerciosProps> = ({
  comercios,
  promociones,
  onSeleccionarParaPagoQR
}) => {
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [bottomSheetAbierto, setBottomSheetAbierto] = useState<boolean>(false);
  const [comercioActivo, setComercioActivo] = useState<ComercioAlianzaB2B | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const rubrosDisponibles = [
    { id: 'TODOS', label: 'Todos los Rubros', icon: '🏪' },
    { id: 'Farmacia', label: 'Farmacias y Salud', icon: '💊' },
    { id: 'Óptica', label: 'Ópticas', icon: '👓' },
    { id: 'Motos & Movilidad', label: 'Motos y Rodados', icon: '🛵' },
    { id: 'Electro & Hogar', label: 'Electrodomésticos', icon: '📺' },
    { id: 'Proveeduría', label: 'Proveeduría y Gastronomía', icon: '🛒' }
  ];

  const comerciosFiltrados = useMemo(() => {
    return comercios.filter((c) => {
      const matchRubro =
        rubroSeleccionado === 'TODOS' ||
        c.Rubro.toLowerCase().includes(rubroSeleccionado.toLowerCase());
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        c.Nombre_Fantasia.toLowerCase().includes(q) ||
        c.Rubro.toLowerCase().includes(q) ||
        c.Direccion.toLowerCase().includes(q);
      return matchRubro && matchBusqueda;
    });
  }, [comercios, rubroSeleccionado, busqueda]);

  // Inicialización de Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-31.7333, -60.5297], // Paraná, Entre Ríos
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar pines cuando cambian los filtros
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    comerciosFiltrados.forEach((c) => {
      const lat = c.Latitud || -31.7333;
      const lng = c.Longitud || -60.5297;

      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `<div style="
          background: #135596;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          font-size: 14px;
        ">🏪</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setComercioActivo(c);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
      });

      markersGroupRef.current?.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    if (comerciosFiltrados.length > 0 && bounds.isValid() && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [comerciosFiltrados]);

  return (
    <div className="pb-24 pt-4 px-4 space-y-3 animate-in fade-in duration-300 overflow-x-hidden">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Red de Comercios Aliados</span>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mapa de Comercios</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Descubre comercios adheridos con cuotas sin interés y reintegros con QR.
        </p>
      </div>

      {/* BOTÓN SUPERIOR DE FILTRO POR RUBRO (ABRE EL BOTTOM SHEET) */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setBottomSheetAbierto(true)}
          className="flex-1 flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-800 text-xs font-bold shadow-xs hover:border-blue-400 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">
              🔍 Filtrar por Rubro: <strong className="text-blue-700">{rubroSeleccionado}</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal shrink-0">Cambiar</span>
        </button>

        {rubroSeleccionado !== 'TODOS' && (
          <button
            type="button"
            onClick={() => setRubroSeleccionado('TODOS')}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
            title="Limpiar filtro"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar comercio por nombre o calle..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* CONTENEDOR DEL MAPA LEAFLET */}
      <div className="relative w-full h-72 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200/70">
          📍 {comerciosFiltrados.length} comercios adheridos
        </div>
      </div>

      {/* DETALLE DEL COMERCIO SELECCIONADO */}
      {comercioActivo && (
        <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-lg space-y-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                🏪
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{comercioActivo.Nombre_Fantasia}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {comercioActivo.Rubro}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setComercioActivo(null)}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{comercioActivo.Direccion}, {comercioActivo.Localidad}</span>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <a
              href={`tel:${comercioActivo.Telefono_WhatsApp}`}
              className="text-blue-600 hover:underline font-mono"
            >
              {comercioActivo.Telefono_WhatsApp}
            </a>
          </div>

          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900">Planes con Mutual:</span>
            <span className="font-bold text-blue-700">Hasta 12 cuotas fijas</span>
          </div>

          {onSeleccionarParaPagoQR && (
            <button
              type="button"
              onClick={() => onSeleccionarParaPagoQR(comercioActivo)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Pagar en este Comercio con QR
            </button>
          )}
        </div>
      )}

      {/* LISTADO DE COMERCIOS */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Directorio en Paraná ({comerciosFiltrados.length})
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {comerciosFiltrados.map((comercio) => {
            const lat = comercio.Latitud || -31.7333;
            const lng = comercio.Longitud || -60.5297;
            return (
              <div
                key={comercio.ID_Comercio}
                onClick={() => {
                  setComercioActivo(comercio);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 16);
                  }
                }}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-xs cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{comercio.Nombre_Fantasia}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {comercio.Direccion}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {comercio.Rubro}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Hasta 12 cuotas</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SHEET */}
      {bottomSheetAbierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl max-w-[480px] w-full p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-4"></div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Seleccionar Rubro Comercial</h3>
              </div>
              <button
                type="button"
                onClick={() => setBottomSheetAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4">
              {rubrosDisponibles.map((r) => {
                const seleccionado = rubroSeleccionado === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRubroSeleccionado(r.id);
                      setBottomSheetAbierto(false);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      seleccionado
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className="text-xs leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
