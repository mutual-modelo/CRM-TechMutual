import React from 'react';
import { Home, CreditCard, Sparkles, Store, QrCode } from 'lucide-react';

export type PantallaSocioType = 'INICIO' | 'AYUDAS' | 'SERVICIOS' | 'COMERCIOS';

interface SocioBottomNavProps {
  pantallaActiva: PantallaSocioType;
  onCambiarPantalla: (pantalla: PantallaSocioType) => void;
  onAbrirCarnetQR: () => void;
}

export const SocioBottomNav: React.FC<SocioBottomNavProps> = ({
  pantallaActiva,
  onCambiarPantalla,
  onAbrirCarnetQR
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around relative">
        {/* INICIO */}
        <button
          type="button"
          onClick={() => onCambiarPantalla('INICIO')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            pantallaActiva === 'INICIO'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 transition-transform ${pantallaActiva === 'INICIO' ? 'scale-110' : ''}`} />
          <span className="text-[11px]">Inicio</span>
        </button>

        {/* AYUDAS */}
        <button
          type="button"
          onClick={() => onCambiarPantalla('AYUDAS')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            pantallaActiva === 'AYUDAS'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-0.5 transition-transform ${pantallaActiva === 'AYUDAS' ? 'scale-110' : ''}`} />
          <span className="text-[11px]">Ayudas</span>
        </button>

        {/* BOTÓN CENTRAL FLOTANTE SOBREELEVADO PAGO / CARNET QR */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onAbrirCarnetQR}
            aria-label="Abrir Carnet Digital y Pagar con QR"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.6)] active:scale-95 transition-all border-4 border-slate-100 group"
          >
            <QrCode className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[11px] font-bold text-blue-700 mt-0.5 tracking-tight">Pagar QR</span>
        </div>

        {/* SERVICIOS */}
        <button
          type="button"
          onClick={() => onCambiarPantalla('SERVICIOS')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            pantallaActiva === 'SERVICIOS'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className={`w-5 h-5 mb-0.5 transition-transform ${pantallaActiva === 'SERVICIOS' ? 'scale-110' : ''}`} />
          <span className="text-[11px]">Servicios</span>
        </button>

        {/* COMERCIOS */}
        <button
          type="button"
          onClick={() => onCambiarPantalla('COMERCIOS')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
            pantallaActiva === 'COMERCIOS'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Store className={`w-5 h-5 mb-0.5 transition-transform ${pantallaActiva === 'COMERCIOS' ? 'scale-110' : ''}`} />
          <span className="text-[11px]">Comercios</span>
        </button>
      </div>
    </nav>
  );
};
