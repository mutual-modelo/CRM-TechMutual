import React from 'react';
import { PortalType, SesionUsuario } from '../../types/crm';
import {
  Building2,
  Smartphone,
  Store,
  LogOut,
  ShieldCheck,
  User,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PortalSwitcherHeaderProps {
  portalActivo: PortalType;
  sesionActual: SesionUsuario | null;
  onCambiarPortal: (nuevoPortal: PortalType) => void;
  onAbrirLogin: (portalDeseado?: PortalType) => void;
  onCerrarSesion: () => void;
}

export const PortalSwitcherHeader: React.FC<PortalSwitcherHeaderProps> = ({
  portalActivo,
  sesionActual,
  onCambiarPortal,
  onAbrirLogin,
  onCerrarSesion
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Identidad Institucional & Selector de Experiencia */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700/80">
            <img
              src="./logo.jpg"
              alt="Mutual Modelo"
              className="w-7 h-7 object-contain rounded-md bg-white p-0.5"
            />
            <div className="hidden md:block">
              <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold block uppercase leading-none">
                ECOSISTEMA DIGITAL 360°
              </span>
              <span className="text-xs font-bold tracking-tight text-white leading-none">
                Mutual Modelo Entre Ríos
              </span>
            </div>
          </div>

          {/* Navegación por los 3 Portales */}
          <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {/* PORTAL 1: CRM BACKOFFICE */}
            <button
              onClick={() => onCambiarPortal('portal-crm-admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                portalActivo === 'portal-crm-admin'
                  ? 'bg-[#135596] text-white shadow-sm ring-1 ring-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Portal 1:</span>
              <span>CRM Backoffice</span>
            </button>

            {/* PORTAL 2: APP DEL SOCIO */}
            <button
              onClick={() => onCambiarPortal('portal-socio-app')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                portalActivo === 'portal-socio-app'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Portal 2:</span>
              <span>App Socio</span>
              <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1 rounded-sm uppercase tracking-wider font-mono">
                PWA
              </span>
            </button>

            {/* PORTAL 3: PORTAL COMERCIO B2B */}
            <button
              onClick={() => onCambiarPortal('portal-comercio-b2b')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                portalActivo === 'portal-comercio-b2b'
                  ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Portal 3:</span>
              <span>Comercio B2B</span>
            </button>
          </nav>
        </div>

        {/* Sesión Activa / Acciones de Login */}
        <div className="flex items-center gap-2">
          {sesionActual ? (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="w-6 h-6 rounded-full bg-slate-700 text-blue-300 flex items-center justify-center text-xs font-bold">
                {sesionActual.nombre.charAt(0)}
              </div>
              <div className="text-left hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white max-w-[130px] truncate">
                    {sesionActual.nombre}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-blue-900/60 text-blue-200 border border-blue-700/50">
                    {sesionActual.tipo === 'OPERADOR_CRM'
                      ? 'OPERADOR'
                      : sesionActual.tipo === 'SOCIO_APP'
                      ? 'SOCIO'
                      : 'COMERCIO'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block leading-none">
                  {sesionActual.idUsuario}
                </span>
              </div>

              <button
                onClick={onCerrarSesion}
                title="Cerrar Sesión Activa"
                className="ml-1 text-slate-400 hover:text-rose-400 p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAbrirLogin(portalActivo)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
