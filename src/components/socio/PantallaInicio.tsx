import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Pill,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SocioPadron, TransaccionBilletera, FidelidadSellosSocio } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { PantallaSocioType } from './SocioBottomNav';

interface PantallaInicioProps {
  socio: SocioPadron;
  fidelidad?: FidelidadSellosSocio;
  transacciones: TransaccionBilletera[];
  onCambiarPantalla: (pantalla: PantallaSocioType) => void;
  onAbrirCarnetQR: () => void;
  onAbrirFidelidad: () => void;
}

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  socio,
  fidelidad,
  transacciones,
  onCambiarPantalla,
  onAbrirCarnetQR,
  onAbrirFidelidad
}) => {
  const [mostrarSaldo, setMostrarSaldo] = useState<boolean>(true);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  const nombreCorto = socio.Apellido_Nombre.split(',')[1]?.trim() || socio.Apellido_Nombre.split(' ')[0] || 'Socio';
  const totalDisponible = socio.Margen_Cuota_Disponible * 10;
  const cupoFarmacia = 150000;
  const cupoB2B = 600000;
  const cupoAyudaLibre = 500000;

  const faqs = [
    {
      q: '¿Cómo pago con QR en comercios adheridos?',
      a: 'Toca el botón circular azul "Pagar QR" en la barra inferior. El comercio escaneará tu código dinámico que se renueva cada 30 segundos, o puedes escanear el QR del comercio.'
    },
    {
      q: '¿Cómo solicito una ampliación de margen o una nueva ayuda?',
      a: 'Ingresa en la pestaña "Ayudas" de la barra inferior y presiona "Solicitar Ampliación". También puedes enviar tu último recibo digital desde la mesa de ayuda.'
    },
    {
      q: '¿Cómo funcionan los 10 sellos de fidelización?',
      a: 'Por cada compra en comercios aliados o pago puntual de cuota sumas 1 sello digital. Al completar 10 sellos obtienes una orden de compra o bonificación automática.'
    },
    {
      q: '¿Dónde retiro las órdenes de farmacia?',
      a: 'Al autorizar tu compra en la farmacia con el QR de la Mutual, el descuento del 30% al 50% se aplica al instante y el saldo se debita de tu cuota de haberes.'
    }
  ];

  const ultimosConsumos = transacciones.slice(0, 5);

  return (
    <div className="pb-24 pt-4 px-4 space-y-4 animate-in fade-in duration-300">
      {/* HEADER DE SALUDO Y ESTADO */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mutual Modelo</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AL DÍA 🟢
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Hola, {nombreCorto} 👋
          </h1>
          <p className="text-xs text-slate-500 font-mono">DNI {socio.DNI} • Socio #{socio.Nro_Socio}</p>
        </div>

        {/* LOGO INSTITUCIONAL */}
        <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-slate-200/80 flex items-center justify-center overflow-hidden">
          <img src="logo.jpg" alt="Mutual Modelo de Entre Ríos" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* TARJETA DE SALDO PRINCIPAL CON OJO TOGGLE */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-blue-100 mb-1">
          <span className="text-xs font-medium tracking-wide">Margen de Financiamiento Disponible</span>
          <button
            type="button"
            onClick={() => setMostrarSaldo(!mostrarSaldo)}
            className="p-1 rounded-lg hover:bg-white/15 transition-colors text-white"
            aria-label={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {mostrarSaldo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-mono">
            {mostrarSaldo ? formatMonedaAR(totalDisponible) : '••••••••'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-100/90 pt-1 border-t border-white/15 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Margen cuota mensual computable: <strong>{mostrarSaldo ? formatMonedaAR(socio.Margen_Cuota_Disponible) : '••••'}</strong></span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={onAbrirCarnetQR}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-sm hover:bg-blue-50 active:scale-98 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Pagar con QR
          </button>
          <button
            type="button"
            onClick={() => onCambiarPantalla('AYUDAS')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm active:scale-98 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Ver Mis Ayudas
          </button>
        </div>
      </div>

      {/* 3 BILLETERAS CON GRADIENTES SUTILES */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Líneas y Billeteras Asignadas</h2>
        <div className="grid grid-cols-3 gap-2">
          {/* Billetera 1 */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <Pill className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-tight">Farmacia</p>
              <p className="text-[10px] text-slate-500 mb-1">Órdenes 100%</p>
              <p className="text-xs font-extrabold text-emerald-800 font-mono">
                {mostrarSaldo ? formatMonedaAR(cupoFarmacia) : '••••'}
              </p>
            </div>
          </div>

          {/* Billetera 2 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50/70 border border-indigo-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-tight">Electro/Motos</p>
              <p className="text-[10px] text-slate-500 mb-1">Comercios B2B</p>
              <p className="text-xs font-extrabold text-indigo-900 font-mono">
                {mostrarSaldo ? formatMonedaAR(cupoB2B) : '••••'}
              </p>
            </div>
          </div>

          {/* Billetera 3 */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50/70 border border-amber-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-tight">Libre CBU</p>
              <p className="text-[10px] text-slate-500 mb-1">Acreditación</p>
              <p className="text-xs font-extrabold text-amber-900 font-mono">
                {mostrarSaldo ? formatMonedaAR(cupoAyudaLibre) : '••••'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETA FIDELIZACIÓN / SELLOS */}
      <div
        onClick={onAbrirFidelidad}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-800">Club Mutual • Tarjeta de Sellos</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                {fidelidad?.Sellos_Acumulados ?? 7}/10
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Te faltan 3 sellos para tu próxima bonificación</p>
          </div>
        </div>
        <div className="flex items-center text-blue-600 text-xs font-bold">
          Ver <ArrowUpRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>

      {/* ÚLTIMOS CONSUMOS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Últimos Consumos</h2>
          </div>
          <button
            type="button"
            onClick={() => onCambiarPantalla('AYUDAS')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
          >
            Ver todos
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {ultimosConsumos.length > 0 ? (
            ultimosConsumos.map((tx) => (
              <div key={tx.ID_Transaccion} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {tx.Nombre_Comercio.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{tx.Nombre_Comercio}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {tx.Fecha_Hora} • {tx.Cuotas} cuotas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900 font-mono">
                    {formatMonedaAR(tx.Monto_Total_Compra)}
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                    {tx.Estado_Transaccion}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No registras consumos recientes este mes.</p>
          )}
        </div>
      </div>

      {/* SOPORTE WHATSAPP */}
      <a
        href={`https://wa.me/5493435123456?text=${encodeURIComponent(`Hola Mesa de Ayuda Mutual Modelo, soy el socio ${socio.Apellido_Nombre} (DNI ${socio.DNI}). Quisiera consultar por mi cuenta.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-98 transition-all"
      >
        <MessageCircle className="w-4 h-4" />
        Soporte Directo por WhatsApp
      </a>

      {/* FAQs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preguntas Frecuentes</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-2">
              <button
                type="button"
                onClick={() => setFaqAbierta(faqAbierta === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-800 py-1"
              >
                <span>{faq.q}</span>
                {faqAbierta === idx ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                )}
              </button>
              {faqAbierta === idx && (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed pl-1 border-l-2 border-blue-500">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
