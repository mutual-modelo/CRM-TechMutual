import React, { useState } from 'react';
import { Award, CheckCircle2, Gift, Sparkles, X, Info, ArrowRight } from 'lucide-react';
import { FidelidadSellosSocio } from '../../types/crm';

interface ModalFidelidadSellosProps {
  fidelidad?: FidelidadSellosSocio;
  onClose: () => void;
  onCanjearPremio?: () => void;
}

export const ModalFidelidadSellos: React.FC<ModalFidelidadSellosProps> = ({
  fidelidad,
  onClose,
  onCanjearPremio
}) => {
  const sellosAcumulados = fidelidad?.Sellos_Acumulados ?? 7;
  const totalSellos = 10;
  const [canjeado, setCanjeado] = useState(false);

  const handleCanjear = () => {
    setCanjeado(true);
    if (onCanjearPremio) onCanjearPremio();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Club Mutual • Tarjeta de Sellos</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ¡Suma sellos con tus consumos y desbloquea bonificaciones automáticas!
          </p>
        </div>

        {/* TARJETA DE 10 SELLOS */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl my-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-amber-900">Tarjeta Activa #MM-2026</span>
            <span className="text-xs font-extrabold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full font-mono">
              {sellosAcumulados} / {totalSellos} Sellos
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalSellos }, (_, i) => {
              const completado = i < sellosAcumulados;
              const esUltimo = i === totalSellos - 1;

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    completado
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : esUltimo
                      ? 'bg-amber-100/50 border-dashed border-2 border-amber-400 text-amber-700'
                      : 'bg-white border-dashed border-slate-200 text-slate-300'
                  }`}
                >
                  {completado ? (
                    <Award className="w-5 h-5 drop-shadow-xs" />
                  ) : esUltimo ? (
                    <Gift className="w-5 h-5 animate-bounce" />
                  ) : (
                    <span className="text-xs font-bold font-mono">{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALLE Y REGLAS */}
        <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p><strong>1 compra en comercio adherido</strong> con QR = 1 sello digital.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p><strong>Pago puntual de cuota social</strong> = 1 sello mensual extra.</p>
          </div>
          <div className="flex items-start gap-2">
            <Gift className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <p><strong>Al completar 10 sellos:</strong> Orden de compra de $25.000 o bonificación de cuota.</p>
          </div>
        </div>

        <div className="mt-4">
          {sellosAcumulados >= 10 ? (
            <button
              type="button"
              disabled={canjeado}
              onClick={handleCanjear}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              {canjeado ? '¡Premio Canjeado con Éxito!' : 'Canjear Orden de Compra ($25.000)'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
