import React, { useState } from 'react';
import {
  Store,
  QrCode,
  DollarSign,
  TrendingUp,
  Tag,
  MessageCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Zap,
  Camera,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  X
} from 'lucide-react';
import { ComercioAlianzaB2B, PromocionPoolReintegro, TransaccionBilletera, AdelantoLiquidacionComercio } from '../../types/crm';
import { QRCodeView } from '../common/QRCodeView';
import { QRCameraScannerModal } from '../common/QRCameraScannerModal';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface PortalComercioB2BViewProps {
  comercioActual?: ComercioAlianzaB2B;
  todosLosComercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  transacciones: TransaccionBilletera[];
  onNuevaVenta: (venta: Partial<TransaccionBilletera>) => void;
  onCrearPromocion: (promo: Partial<PromocionPoolReintegro>) => void;
  onEliminarPromocion: (id: string) => void;
  onSolicitarAnticipo: (anticipo: Partial<AdelantoLiquidacionComercio>) => void;
  onCambiarComercio: (comercio: ComercioAlianzaB2B) => void;
  onCerrarSesion: () => void;
}

type TabComercioType = 'TERMINAL' | 'VENTAS' | 'FINANCIAMIENTO' | 'PROMOCIONES' | 'SOPORTE';

export const PortalComercioB2BView: React.FC<PortalComercioB2BViewProps> = ({
  comercioActual,
  todosLosComercios,
  promociones,
  transacciones,
  onNuevaVenta,
  onCrearPromocion,
  onEliminarPromocion,
  onSolicitarAnticipo,
  onCambiarComercio,
  onCerrarSesion
}) => {
  const comercio = comercioActual || todosLosComercios[0] || {
    ID_Comercio: 'COM-001',
    CUIT_Responsable: '30-71458921-9',
    Razon_Social: 'FARMACIA MODELO CENTRAL S.A.',
    Nombre_Fantasia: 'Farmacia Modelo Central',
    Rubro: 'Farmacia' as const,
    Direccion: 'Urquiza 1120',
    Localidad: 'Paraná',
    Telefono_WhatsApp: '0343-4221199',
    Email: 'cobros@farmaciamodelo.com.ar',
    Arancel_Mutual_Pct: 3.5,
    Planes_Cuotas_JSON: '[1, 3, 6, 12]',
    Acepta_Cuenta_Corriente: 'SI' as const,
    Permite_Adelanto_Liquidacion: 'SI' as const,
    Tasa_Descuento_Adelanto_Pct: 3.0,
    PIN_Token_Acceso: '4521',
    Estado: 'Activo' as const,
    Saldo_Ventas_Pendientes: 485200,
    Total_Facturado_Historico: 5890000,
    Fecha_Alta: '2024-01-15'
  };

  const [tabActiva, setTabActiva] = useState<TabComercioType>('TERMINAL');

  // Terminal de Cobro
  const [modoCobro, setModoCobro] = useState<'GENERAR_QR' | 'ESCANEAR_SOCIO' | 'DNI_ASISTIDO'>('GENERAR_QR');
  const [montoCobro, setMontoCobro] = useState<number>(15000);
  const [cuotasCobro, setCuotasCobro] = useState<number>(3);
  const [conceptoCobro, setConceptoCobro] = useState<string>('Compra de mostrador');
  const [qrGenerado, setQrGenerado] = useState<string | null>(null);
  const [modalScannerAbierto, setModalScannerAbierto] = useState<boolean>(false);
  const [dniSocioAsistido, setDniSocioAsistido] = useState<string>('');
  const [cobroExitosoToast, setCobroExitosoToast] = useState<string | null>(null);

  // Liquidaciones & Anticipo
  const [modalAnticipoAbierto, setModalAnticipoAbierto] = useState<boolean>(false);
  const [montoAnticipo, setMontoAnticipo] = useState<number>(Math.round((comercio.Saldo_Ventas_Pendientes || 450000) * 0.9));
  const [anticipoExito, setAnticipoExito] = useState<boolean>(false);

  // Financiamiento B2B
  const [montoCreditoB2B, setMontoCreditoB2B] = useState<number>(1500000);
  const [plazoB2B, setPlazoB2B] = useState<number>(18);
  const [creditoEnviado, setCreditoEnviado] = useState<boolean>(false);

  // Modal Crear Promoción ABM
  const [modalPromoAbierto, setModalPromoAbierto] = useState<boolean>(false);
  const [nuevaPromoTitulo, setNuevaPromoTitulo] = useState<string>('Especial 20% OFF en Medicamentos');
  const [nuevaPromoDescuento, setNuevaPromoDescuento] = useState<number>(20);
  const [nuevaPromoCuotas, setNuevaPromoCuotas] = useState<number>(6);
  const [nuevaPromoTope, setNuevaPromoTope] = useState<number>(15000);

  const handleGenerarQR = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = JSON.stringify({
      tipo: 'TERMINAL_B2B_COBRO',
      cuit: comercio.CUIT_Responsable,
      comercio: comercio.Nombre_Fantasia,
      monto: montoCobro,
      cuotas: cuotasCobro,
      concepto: conceptoCobro,
      idOperacion: `OP-${Date.now().toString().slice(-6)}`,
      timestamp: Date.now()
    });
    setQrGenerado(payload);
  };

  const procesarCobroFinalizado = (socioDesc: string) => {
    onNuevaVenta({
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Monto_Total_Compra: montoCobro,
      Cuotas: cuotasCobro,
      DNI_Socio: socioDesc,
      Fecha_Hora: new Date().toLocaleDateString('es-AR'),
      Estado_Transaccion: 'Aprobada'
    });
    setCobroExitosoToast(`¡Cobro de ${formatMonedaAR(montoCobro)} en ${cuotasCobro} cuotas completado con éxito!`);
    setQrGenerado(null);
    setTimeout(() => setCobroExitosoToast(null), 3500);
  };

  const handleConfirmarAnticipo = (e: React.FormEvent) => {
    e.preventDefault();
    const tasaAnticipo = 0.04;
    const netoAcreditar = montoAnticipo * (1 - tasaAnticipo);

    onSolicitarAnticipo({
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Monto_Ventas_Adelantadas: montoAnticipo,
      Neto_Transferido: netoAcreditar,
      Tasa_Descuento_Pct: tasaAnticipo * 100,
      Estado: 'Liquidado'
    });

    setAnticipoExito(true);
    setTimeout(() => {
      setAnticipoExito(false);
      setModalAnticipoAbierto(false);
    }, 2000);
  };

  const handleGuardarPromocion = (e: React.FormEvent) => {
    e.preventDefault();
    onCrearPromocion({
      ID_Promo: `PROMO-${Date.now()}`,
      Titulo: nuevaPromoTitulo,
      Rubro: comercio.Rubro,
      Pct_Descuento: nuevaPromoDescuento,
      Tope_Mensual_Socio: nuevaPromoTope,
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Estado: 'Vigente'
    });
    setModalPromoAbierto(false);
  };

  const ventasComercio = transacciones.filter(
    (t) => t.ID_Comercio === comercio.ID_Comercio || t.Nombre_Comercio === comercio.Nombre_Fantasia
  );

  const promocionesComercio = promociones.filter(
    (p) => p.ID_Comercio === comercio.ID_Comercio || p.Rubro === comercio.Rubro
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* HEADER SUPERIOR */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-slate-900">{comercio.Nombre_Fantasia}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  COMERCIO ADHERIDO 🟢
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">CUIT: {comercio.CUIT_Responsable} • {comercio.Rubro}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={comercio.ID_Comercio}
              onChange={(e) => {
                const encontrado = todosLosComercios.find((c) => c.ID_Comercio === e.target.value);
                if (encontrado) onCambiarComercio(encontrado);
              }}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              {todosLosComercios.map((c) => (
                <option key={c.ID_Comercio} value={c.ID_Comercio}>
                  {c.Nombre_Fantasia} ({c.Rubro})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onCerrarSesion}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* 5 VISTAS AISLADAS - CERO SCROLL INFINITO */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'TERMINAL', label: 'Terminal de Cobros', icon: QrCode },
            { id: 'VENTAS', label: 'Ventas y Liquidaciones', icon: DollarSign },
            { id: 'FINANCIAMIENTO', label: 'Financiamiento Comercial', icon: TrendingUp },
            { id: 'PROMOCIONES', label: 'Promociones & Cupones (ABM)', icon: Tag },
            { id: 'SOPORTE', label: 'Soporte y Convenios', icon: MessageCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const activo = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabActiva(tab.id as TabComercioType)}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activo
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {cobroExitosoToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span className="text-xs font-bold">{cobroExitosoToast}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL POR PANTALLA */}
      <main className="max-w-6xl mx-auto w-full p-4 flex-1">
        {/* PANTALLA 1: TERMINAL DE COBROS */}
        {tabActiva === 'TERMINAL' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-extrabold text-slate-900">Terminal de Cobro Mutual</h2>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  Arancel: {comercio.Arancel_Mutual_Pct}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setModoCobro('GENERAR_QR'); setQrGenerado(null); }}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                    modoCobro === 'GENERAR_QR'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Generar QR
                </button>
                <button
                  type="button"
                  onClick={() => setModoCobro('ESCANEAR_SOCIO')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                    modoCobro === 'ESCANEAR_SOCIO'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Escanear Carnet
                </button>
                <button
                  type="button"
                  onClick={() => setModoCobro('DNI_ASISTIDO')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                    modoCobro === 'DNI_ASISTIDO'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cobro por DNI
                </button>
              </div>

              {modoCobro === 'GENERAR_QR' && (
                <form onSubmit={handleGenerarQR} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Importe a Cobrar ($ ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={montoCobro}
                        onChange={(e) => setMontoCobro(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 text-base font-extrabold text-slate-900 bg-slate-50 font-mono focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Planes de Cuotas Mutual
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 6, 12].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCuotasCobro(n)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            cuotasCobro === n
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {n === 1 ? '1 Pago' : `${n} Cuotas`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Concepto / Factura o Ticket
                    </label>
                    <input
                      type="text"
                      value={conceptoCobro}
                      onChange={(e) => setConceptoCobro(e.target.value)}
                      placeholder="Ticket #004-9842"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Generar Código QR Dinámico
                  </button>
                </form>
              )}

              {modoCobro === 'ESCANEAR_SOCIO' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Escanear Carnet del Socio</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      El socio muestra su QR rotativo desde su App y la terminal captura sus datos en tiempo real.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalScannerAbierto(true)}
                    className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    Abrir Cámara y Escanear Socio
                  </button>
                </div>
              )}

              {modoCobro === 'DNI_ASISTIDO' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!dniSocioAsistido) return;
                    procesarCobroFinalizado(`Socio DNI ${dniSocioAsistido}`);
                    setDniSocioAsistido('');
                  }}
                  className="space-y-4 py-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      DNI del Asociado
                    </label>
                    <input
                      type="text"
                      value={dniSocioAsistido}
                      onChange={(e) => setDniSocioAsistido(e.target.value)}
                      placeholder="Ej. 32456789"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-mono"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      Se enviará una notificación de confirmación al WhatsApp del socio para autorizar el cargo en su cuota.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Procesar Cobro Asistido
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center">
              {qrGenerado ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Terminal Lista para Escanear
                  </span>

                  <h3 className="text-lg font-extrabold text-slate-900 font-mono">
                    Total: {formatMonedaAR(montoCobro)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cuotasCobro === 1 ? '1 pago contado' : `${cuotasCobro} cuotas con descuento`} • {conceptoCobro}
                  </p>

                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 inline-block shadow-inner">
                    <QRCodeView
                      value={qrGenerado}
                      size={200}
                      colorDark="#0f172a"
                      centerLogo="logo.jpg"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => procesarCobroFinalizado('Socio Escaneo QR')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Simular Pago Exitoso del Socio
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrGenerado(null)}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-12 text-slate-400">
                  <QrCode className="w-16 h-16 mx-auto stroke-1 text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-600">Sin Cobro Activo en Pantalla</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Completa el importe y cuotas a la izquierda para generar el QR oficial que escaneará el socio.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANTALLA 2: VENTAS Y LIQUIDACIONES */}
        {tabActiva === 'VENTAS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Liquidación Periódica Acumulada
                </span>
                <h2 className="text-3xl font-extrabold font-mono mt-1">
                  {formatMonedaAR(comercio.Saldo_Ventas_Pendientes || 485200)}
                </h2>
                <p className="text-xs text-blue-200/80 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Fecha ordinaria de acreditación bancaria: <strong>15 del mes próximo</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAnticipoAbierto(true)}
                className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                ⚡ Solicitar Anticipo Express a 24hs
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Ventas Cobradas con Mutual ({ventasComercio.length})
                </h3>
                <span className="text-xs font-bold text-slate-500">Últimos 30 días</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">Fecha</th>
                      <th className="py-2.5 px-3">Socio / Identificador</th>
                      <th className="py-2.5 px-3">Cuotas</th>
                      <th className="py-2.5 px-3">Importe Bruto</th>
                      <th className="py-2.5 px-3">Neto Comercio</th>
                      <th className="py-2.5 px-3 rounded-r-xl">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {ventasComercio.length > 0 ? (
                      ventasComercio.map((tx) => {
                        const neto = tx.Monto_Total_Compra * (1 - (comercio.Arancel_Mutual_Pct || 3.5) / 100);
                        return (
                          <tr key={tx.ID_Transaccion} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-mono text-slate-500">{tx.Fecha_Hora}</td>
                            <td className="py-3 px-3 font-semibold text-slate-800">{tx.DNI_Socio || 'Socio Mutual'}</td>
                            <td className="py-3 px-3">{tx.Cuotas} cuotas</td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              {formatMonedaAR(tx.Monto_Total_Compra)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                              {formatMonedaAR(neto)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {tx.Estado_Transaccion}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Aún no se registran ventas para este comercio. Genera un cobro desde la terminal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 3: FINANCIAMIENTO COMERCIAL */}
        {tabActiva === 'FINANCIAMIENTO' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Línea de Capital de Trabajo</span>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Financiamiento Comercial B2B</h2>
              <p className="text-xs text-slate-500 mt-1">
                Línea exclusiva para adquisición de mercadería, capital operativo y ampliación comercial para comercios adheridos.
              </p>
            </div>

            {creditoEnviado ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-900">¡Solicitud de Crédito B2B Recibida!</h3>
                <p className="text-xs text-slate-600">
                  La Comisión de Créditos de Mutual Modelo revisará el balance comercial y se comunicará en 24hs hábiles.
                </p>
                <button
                  type="button"
                  onClick={() => setCreditoEnviado(false)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Nueva Simulación
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCreditoEnviado(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monto de Capital Solicitado: <strong className="text-blue-600 font-mono">{formatMonedaAR(montoCreditoB2B)}</strong>
                  </label>
                  <input
                    type="range"
                    min="500000"
                    max="10000000"
                    step="250000"
                    value={montoCreditoB2B}
                    onChange={(e) => setMontoCreditoB2B(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>$ 500.000</span>
                    <span>$ 10.000.000</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Plazo de Repago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[12, 18, 24].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlazoB2B(p)}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          plazoB2B === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p} Meses
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">TNA Preferencial B2B:</span>
                    <strong className="text-blue-900 font-mono">42.50% fija anual</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cuota mensual estimada:</span>
                    <strong className="text-blue-900 font-mono text-sm">
                      {formatMonedaAR(Math.round((montoCreditoB2B * 1.65) / plazoB2B))}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-blue-200/60">
                    Acreditación en CBU comercial dentro de las 48hs de aprobado el legajo.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Enviar Solicitud a Evaluación de Créditos
                </button>
              </form>
            )}
          </div>
        )}

        {/* PANTALLA 4: PROMOCIONES ABM */}
        {tabActiva === 'PROMOCIONES' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pool Global de Reintegros
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Promociones y Ofertas Vigentes
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalPromoAbierto(true)}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Promoción
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promocionesComercio.map((promo) => (
                <div
                  key={promo.ID_Promo}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {promo.Rubro}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEliminarPromocion(promo.ID_Promo)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Eliminar promoción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{promo.Titulo}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-mono">
                      <span>🎉 {promo.Pct_Descuento}% Reintegro</span>
                      <span>•</span>
                      <span>💳 Hasta 12 cuotas</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Tope socio: <strong>{formatMonedaAR(promo.Tope_Mensual_Socio)}</strong>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {promo.Estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANTALLA 5: SOPORTE B2B */}
        {tabActiva === 'SOPORTE' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Mesa de Convenios B2B</h2>
              <p className="text-xs text-slate-500 mt-1">
                Atención preferencial directa para comercios aliados de Asociación Mutual Modelo.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/5493435123456?text=${encodeURIComponent(`Hola Mesa de Convenios B2B Mutual Modelo, me comunico desde el comercio adherido ${comercio.Nombre_Fantasia} (CUIT ${comercio.CUIT_Responsable}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Contactar por WhatsApp Oficial de Convenios
              </a>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800">Preguntas Frecuentes para Comercios:</h4>
                <p><strong>• ¿Cuándo se acreditan las ventas?</strong> Las ventas con cuotas mutual se liquidan los días 15 de cada mes, o de forma inmediata solicitando el anticipo express a 24hs.</p>
                <p><strong>• ¿Cómo pedir cartelería QR física?</strong> Solicítala por WhatsApp y te enviaremos el acrílico con tu código QR oficial para exhibir en tu caja.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ANTICIPO */}
      {modalAnticipoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Anticipo Express a 24hs</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAnticipoAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {anticipoExito ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-extrabold text-slate-900">¡Anticipo Aprobado!</h4>
                <p className="text-xs text-slate-600">
                  Los fondos serán transferidos a tu CBU registrado en las próximas 24 horas hábiles.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmarAnticipo} className="space-y-4 pt-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monto a Anticipar ($ ARS)
                  </label>
                  <input
                    type="number"
                    max={comercio.Saldo_Ventas_Pendientes || 500000}
                    value={montoAnticipo}
                    onChange={(e) => setMontoAnticipo(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900 bg-slate-50 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Saldo máximo liquidable: {formatMonedaAR(comercio.Saldo_Ventas_Pendientes || 500000)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between text-amber-900">
                    <span>Costo por acreditación rápida:</span>
                    <strong>4.0%</strong>
                  </div>
                  <div className="flex justify-between text-amber-950 font-bold border-t border-amber-200 pt-1">
                    <span>Neto a recibir en 24hs:</span>
                    <span className="font-mono">{formatMonedaAR(montoAnticipo * 0.96)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all"
                >
                  Confirmar y Transferir en 24hs
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL NUEVA PROMO */}
      {modalPromoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Nueva Promoción Mutual</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPromoAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarPromocion} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título de la Oferta</label>
                <input
                  type="text"
                  required
                  value={nuevaPromoTitulo}
                  onChange={(e) => setNuevaPromoTitulo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">% Reintegro</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={nuevaPromoDescuento}
                    onChange={(e) => setNuevaPromoDescuento(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cuotas Fijas</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={nuevaPromoCuotas}
                    onChange={(e) => setNuevaPromoCuotas(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tope Reintegro por Socio ($)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={nuevaPromoTope}
                  onChange={(e) => setNuevaPromoTope(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Publicar Promoción en la App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {modalScannerAbierto && (
        <QRCameraScannerModal
          isOpen={modalScannerAbierto}
          title="Escanear Carnet del Socio"
          subtitle="Apunta la cámara al carnet QR dinámico del socio"
          expectedType="SOCIO"
          onScanSuccess={(texto) => {
            setModalScannerAbierto(false);
            procesarCobroFinalizado(texto);
          }}
          onClose={() => setModalScannerAbierto(false)}
        />
      )}
    </div>
  );
};
