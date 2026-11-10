import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  AlertCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  X
} from 'lucide-react';
import { SocioPadron, AyudaEconomica } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface PantallaAyudasProps {
  socio: SocioPadron;
  ayudas: AyudaEconomica[];
  onSolicitarNuevaAyuda: (solicitud: { monto: number; cuotas: number; destino: string }) => void;
}

export const PantallaAyudas: React.FC<PantallaAyudasProps> = ({
  socio,
  ayudas,
  onSolicitarNuevaAyuda
}) => {
  const [ayudaExpandida, setAyudaExpandida] = useState<string | null>(null);
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState<boolean>(false);
  const [montoSolicitado, setMontoSolicitado] = useState<number>(300000);
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number>(12);
  const [destino, setDestino] = useState<string>('Gastos Personales / Salud');
  const [enviadoExito, setEnviadoExito] = useState<boolean>(false);

  // Filtrar ayudas asociadas al socio o mostrar las activas
  const ayudasSocio = ayudas.filter((a) => a.DNI === socio.DNI);
  const ayudasRender = ayudasSocio.length > 0 ? ayudasSocio : ayudas.slice(0, 2);

  const handleSubmitSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    onSolicitarNuevaAyuda({
      monto: montoSolicitado,
      cuotas: cuotasSeleccionadas,
      destino
    });
    setEnviadoExito(true);
    setTimeout(() => {
      setEnviadoExito(false);
      setModalSolicitudAbierto(false);
    }, 1800);
  };

  const estimacionCuota = Math.round((montoSolicitado * 1.832) / cuotasSeleccionadas);

  return (
    <div className="pb-24 pt-4 px-4 space-y-4 animate-in fade-in duration-300">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financiamiento Oficial</span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mis Ayudas Activas</h1>
        </div>
        <button
          type="button"
          onClick={() => setModalSolicitudAbierto(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Nueva Solicitud
        </button>
      </div>

      {/* RESUMEN DE CUPO Y MARGEN */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Margen Disponible Mensual</p>
          <p className="text-lg font-extrabold text-slate-900 font-mono">
            {formatMonedaAR(socio.Margen_Cuota_Disponible)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Capacidad Estimada</p>
          <p className="text-sm font-bold text-emerald-700 font-mono">
            Hasta {formatMonedaAR(socio.Margen_Cuota_Disponible * 10)}
          </p>
        </div>
      </div>

      {/* LISTADO DE AYUDAS ACTIVAS */}
      <div className="space-y-3">
        {ayudasRender.map((ayuda) => {
          const expandida = ayudaExpandida === ayuda.ID_Ayuda;
          const cuotasTotales = ayuda.Cantidad_Cuotas || 12;
          const cuotasPagadas = ayuda.Cuotas_Pagadas ?? Math.floor(cuotasTotales * 0.4);
          const cuotasRestantes = cuotasTotales - cuotasPagadas;
          const porcentaje = Math.min(100, Math.round((cuotasPagadas / cuotasTotales) * 100));

          return (
            <div
              key={ayuda.ID_Ayuda}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {ayuda.Linea_Ayuda}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      Crédito #{ayuda.ID_Ayuda.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Otorgado: {ayuda.Fecha_Liquidacion || '15/03/2026'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Cuota Mensual</p>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      {formatMonedaAR(ayuda.Valor_Cuota)}
                    </p>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>
                      Progreso: <strong>{cuotasPagadas} de {cuotasTotales} cuotas</strong>
                    </span>
                    <span className="text-blue-600 font-bold">{porcentaje}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Próximo Vencimiento</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      10 del mes próximo
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Saldo Restante</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {formatMonedaAR(cuotasRestantes * ayuda.Valor_Cuota)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAyudaExpandida(expandida ? null : ayuda.ID_Ayuda)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 rounded-xl transition-colors"
                >
                  <span>{expandida ? 'Ocultar Cuadro de Cuotas' : 'Ver Cuadro de Cuotas'}</span>
                  {expandida ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {expandida && (
                <div className="bg-slate-50 border-t border-slate-200/80 p-4 space-y-2 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Cronograma de Cuotas
                  </h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {Array.from({ length: cuotasTotales }, (_, i) => {
                      const numCuota = i + 1;
                      const estaPagada = numCuota <= cuotasPagadas;
                      return (
                        <div
                          key={numCuota}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-bold text-slate-400 font-mono">
                              #{numCuota}
                            </span>
                            <span className="text-slate-600">Cuota {numCuota}/{cuotasTotales}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-800">
                              {formatMonedaAR(ayuda.Valor_Cuota)}
                            </span>
                            {estaPagada ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Pagada 🟢
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pendiente ⏳
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL SOLICITUD */}
      {modalSolicitudAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Solicitar Nueva Ayuda</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalSolicitudAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enviadoExito ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">¡Solicitud Registrada!</h4>
                <p className="text-xs text-slate-500">
                  Un operador mutual evaluará tu legajo y te notificará por WhatsApp en menos de 2 horas hábiles.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSolicitud} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monto Solicitado: <strong className="text-blue-600 font-mono">{formatMonedaAR(montoSolicitado)}</strong>
                  </label>
                  <input
                    type="range"
                    min="50000"
                    max="1500000"
                    step="25000"
                    value={montoSolicitado}
                    onChange={(e) => setMontoSolicitado(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>$ 50.000</span>
                    <span>$ 1.500.000</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cantidad de Cuotas</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[6, 12, 18, 24].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCuotasSeleccionadas(n)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          cuotasSeleccionadas === n
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {n} m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Destino de los Fondos</label>
                  <select
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Gastos Personales / Salud">Gastos Personales / Salud</option>
                    <option value="Refacción de Vivienda">Refacción de Vivienda</option>
                    <option value="Compra de Electro / Motovehículo">Compra de Electro / Motovehículo</option>
                    <option value="Consolidación de Deudas">Consolidación de Deudas</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Cuota mensual estimada:</span>
                    <strong className="text-blue-700 font-mono text-sm">{formatMonedaAR(estimacionCuota)}</strong>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Sujeto a verificación de margen de cuota en recibo de haberes.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
                >
                  Confirmar Solicitud de Ayuda
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
