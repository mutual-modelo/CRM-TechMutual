import React from 'react';
import { OperadorMutual, SocioPadron } from '../types/crm';
import { OPERADORES_MUTUAL_LISTA } from '../data/seedData';
import { Search, UserPlus, CreditCard, Bell, Code, ExternalLink, Printer } from 'lucide-react';

interface HeaderProps {
  operadorActivo: OperadorMutual;
  onCambiarOperador: (op: OperadorMutual) => void;
  socios: SocioPadron[];
  onSeleccionarSocio: (socio: SocioPadron) => void;
  onAbrirModalSocio: () => void;
  onAbrirModalAyuda: () => void;
  onAbrirModalAlerta: () => void;
  onAbrirDespliegueGAS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  operadorActivo,
  onCambiarOperador,
  socios,
  onSeleccionarSocio,
  onAbrirModalSocio,
  onAbrirModalAyuda,
  onAbrirModalAlerta,
  onAbrirDespliegueGAS
}) => {
  const [busqueda, setBusqueda] = React.useState('');
  const [mostrarResultados, setMostrarResultados] = React.useState(false);

  const resultados = React.useMemo(() => {
    if (!busqueda.trim()) return [];
    const q = busqueda.toLowerCase().trim();
    return socios.filter(
      (s) =>
        s.DNI.toLowerCase().includes(q) ||
        s.Apellido_Nombre.toLowerCase().includes(q) ||
        s.Nro_Socio.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [busqueda, socios]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="./logo.jpg"
              alt="Asociación Mutual Modelo de Entre Ríos"
              className="h-10 w-auto max-w-[200px] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/180x45/135596/ffffff?text=Mutual+Modelo';
              }}
            />
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-[#135596] tracking-tight uppercase">
                CRM & Backoffice Financiero
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Asociación Mutual Modelo de Entre Ríos
              </span>
            </div>
          </div>

          {/* Global Search Box */}
          <div className="relative flex-1 max-w-md mx-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarResultados(true);
                }}
                onFocus={() => setMostrarResultados(true)}
                placeholder="Buscar asociado por DNI o Apellido..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135596]/20 focus:border-[#135596] transition"
              />
            </div>

            {/* Quick Search Dropdown */}
            {mostrarResultados && resultados.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-50">
                <div className="p-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Resultados encontrados ({resultados.length})
                </div>
                {resultados.map((s) => (
                  <button
                    key={s.DNI}
                    onClick={() => {
                      onSeleccionarSocio(s);
                      setMostrarResultados(false);
                      setBusqueda('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50/80 transition flex items-center justify-between border-b border-slate-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{s.Apellido_Nombre}</div>
                      <div className="text-[11px] text-slate-500">
                        DNI: {s.DNI} • {s.Organismo}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-700 font-medium text-[11px]">
                        Margen: ${s.Margen_Cuota_Disponible.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Active Operator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Operador:</span>
              <select
                value={operadorActivo}
                onChange={(e) => onCambiarOperador(e.target.value as OperadorMutual)}
                className="bg-transparent font-semibold text-[#135596] text-xs focus:outline-none cursor-pointer"
              >
                {OPERADORES_MUTUAL_LISTA.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAbrirModalSocio}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-md shadow-xs transition"
                title="Registrar nuevo asociado"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">+ Socio</span>
              </button>

              <button
                onClick={onAbrirModalAyuda}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
                title="Nueva solicitud de ayuda económica"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">+ Ayuda</span>
              </button>

              <button
                onClick={onAbrirModalAlerta}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
                title="Nueva alerta de seguimiento"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden md:inline">+ Alerta</span>
              </button>

              {/* GAS Deployment Button */}
              <button
                onClick={onAbrirDespliegueGAS}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-md shadow-xs transition ml-1"
                title="Ver archivos y guía de despliegue para Google Apps Script"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Despliegue Apps Script</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
