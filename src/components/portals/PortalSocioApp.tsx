import React, { useState, useEffect, useMemo } from 'react';
import {
  SocioPadron,
  ComercioAlianzaB2B,
  PromocionPoolReintegro,
  FidelidadSellosSocio,
  DetalleSelloItem,
  TransaccionBilletera,
  SubsidioYConsumo,
  SesionUsuario
} from '../../types/crm';
import { QRCodeView } from '../common/QRCodeView';
import { QRCameraScannerModal } from '../common/QRCameraScannerModal';
import { DirectorioComerciosMapa } from './DirectorioComerciosMapa';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  Wallet,
  QrCode,
  CreditCard,
  Award,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Camera,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  X,
  FileText,
  DollarSign,
  Store,
  RefreshCw,
  LogOut,
  Info,
  Gift,
  Lightbulb,
  Ticket,
  Check,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  MapPin,
  Eye,
  EyeOff,
  Home,
  User
} from 'lucide-react';

interface PortalSocioAppProps {
  socio: SocioPadron;
  comercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  fidelidad: FidelidadSellosSocio | undefined;
  transacciones: TransaccionBilletera[];
  onNuevaTransaccion: (tx: Partial<TransaccionBilletera>) => void;
  onDesconocerTransaccion: (idTx: string, motivo: string) => void;
  onSubirReciboDrive: (dni: string, file: File | null) => void;
  onCerrarSesion: () => void;
  onCambiarPortal: (portal: any) => void;
}

export const PortalSocioApp: React.FC<PortalSocioAppProps> = ({
  socio,
  comercios,
  promociones,
  fidelidad,
  transacciones,
  onNuevaTransaccion,
  onDesconocerTransaccion,
  onSubirReciboDrive,
  onCerrarSesion,
  onCambiarPortal
}) => {
  // Pestañas internas de la PWA
  const [seccionPWA, setSeccionPWA] = useState<
    'inicio' | 'credencial' | 'directorio' | 'billeteras' | 'sellos' | 'movimientos'
  >('inicio');

  // TOTP Dinámico rotativo de 30 segundos
  const [totpToken, setTotpToken] = useState('841920');
  const [segundosRestantes, setSegundosRestantes] = useState(30);

  // Modal Escáner QR de Cámara
  const [modalScannerCamara, setModalScannerCamara] = useState(false);

  // Modal Confirmación de Pago con QR
  const [modalConfirmarPago, setModalConfirmarPago] = useState(false);
  const [comercioDetectado, setComercioDetectado] = useState<ComercioAlianzaB2B | null>(null);
  const [montoPago, setMontoPago] = useState<number>(18500);
  const [cuotasPago, setCuotasPago] = useState<number>(3);
  const [billeteraElegida, setBilleteraElegida] = useState<
    'Disponible 1 - Cuenta Corriente' | 'Disponible 2 - Consumo Específico B2B' | 'Disponible 3 - Ayuda Libre'
  >('Disponible 1 - Cuenta Corriente');
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // Modal Desconocer Consumo
  const [modalDesconocer, setModalDesconocer] = useState<TransaccionBilletera | null>(null);
  const [motivoDesconocimiento, setMotivoDesconocimiento] = useState('');

  // Modal Subir Recibo / Legajo IA
  const [modalSubirRecibo, setModalSubirRecibo] = useState(false);
  const [reciboProcesado, setReciboProcesado] = useState(false);

  // Modal Detalle y Auditoría de Sello (Trazabilidad 10 Sellos)
  const [modalDetalleSello, setModalDetalleSello] = useState<DetalleSelloItem | null>(null);

  // Modal Voucher Ganado
  const [modalVoucherActivo, setModalVoucherActivo] = useState(false);

  // Temporizador para TOTP rotativo
  useEffect(() => {
    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          // Generar nuevo TOTP aleatorio de 6 dígitos
          const nuevo = Math.floor(100000 + Math.random() * 900000).toString();
          setTotpToken(nuevo);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Visibilidad de Saldo (Botón de Ojo Mercado Pago)
  const [saldoVisible, setSaldoVisible] = useState(true);
  const formatMasked = (amount: number) => (saldoVisible ? formatMonedaAR(amount) : '••••••');
  const primerNombre =
    socio.Apellido_Nombre.split(',')[1]?.trim() ||
    socio.Apellido_Nombre.split(' ')[0] ||
    'Socio';

  // Saldos dinámicos de las 3 Billeteras
  const saldoB1CtaCte = Math.round((socio.Margen_Cuota_Disponible || 150000) * 1.5);
  const saldoB2ConsumoB2B = Math.round((socio.Monto_Preaprobado || 1200000) * 1.2);
  const saldoB3AyudaLibre = socio.Monto_Preaprobado || 1200000;

  // Transacciones de este socio
  const misTransacciones = transacciones.filter((t) => t.DNI_Socio === socio.DNI);

  // Sellos del socio
  const sellosActuales = fidelidad?.Sellos_Acumulados ?? 7;
  const puntosTotales = fidelidad?.Puntos_Totales ?? 1450;

  // Trazabilidad de los 10 Sellos (Historial Auditado + Tips & Promociones)
  const listaDetalleSellos: DetalleSelloItem[] = useMemo(() => {
    const accionesAuditadas = [
      {
        accion: 'Pago de Cuota Social de Noviembre al día',
        comercio: 'Sede Central Mutual Modelo',
        fecha: '01/11/2026 09:30 hs',
        pts: 150,
        comp: 'REC-CUOTA-1126-01',
        icono: 'CheckCircle2'
      },
      {
        accion: 'Compra en Farmacia Modelo (Medicamentos recetados con 25% reintegro)',
        comercio: 'Farmacia Modelo (Peatonal)',
        fecha: '03/11/2026 18:20 hs',
        pts: 200,
        comp: 'TX-B2B-18500',
        icono: 'Store'
      },
      {
        accion: 'Débito Automático Plan Odontológico Familiar',
        comercio: 'Caja de Ahorro BERSA / Plan Salud',
        fecha: '04/11/2026 10:15 hs',
        pts: 100,
        comp: 'DEB-SALUD-0411',
        icono: 'ShieldCheck'
      },
      {
        accion: 'Compra de Canasta Básica Familiar en 3 cuotas sin interés',
        comercio: 'Proveeduría Belgrano',
        fecha: '05/11/2026 12:40 hs',
        pts: 250,
        comp: 'TX-B2B-34200',
        icono: 'Store'
      },
      {
        accion: 'Uso de Billetera Virtual en Óptica y Cristales recetados',
        comercio: 'Óptica Litoral',
        fecha: '06/11/2026 17:05 hs',
        pts: 180,
        comp: 'TX-B2B-28900',
        icono: 'ShoppingBag'
      },
      {
        accion: 'Renovación de Recibo de Sueldo y Legajo Digital con IA Gemini',
        comercio: 'Auditoría IA Drive Mutual',
        fecha: '07/11/2026 14:10 hs',
        pts: 120,
        comp: 'LEG-REC-2026-11',
        icono: 'FileText'
      },
      {
        accion: 'Compra en Motovehículos Paraná (Casco reglamentario en 6 cuotas)',
        comercio: 'Motos & Movilidad Paraná',
        fecha: '08/11/2026 11:30 hs',
        pts: 300,
        comp: 'TX-B2B-45000',
        icono: 'ShoppingBag'
      }
    ];

    const tipsPendientes = [
      {
        tip: 'Comprá en Farmacia Modelo con 25% de reintegro en compras mayores a $10.000 para liberar este sello.'
      },
      {
        tip: 'Adherí una factura de servicios o internet a tu Billetera Mutual y sumá 1 sello al instante.'
      },
      {
        tip: '¡Último casillero del ciclo! Hacé cualquier compra en comercios adheridos para desbloquear tu VOUCHER DE $15.000.'
      }
    ];

    const items: DetalleSelloItem[] = [];

    for (let i = 1; i <= 10; i++) {
      const isCompletado = i <= sellosActuales;
      if (isCompletado) {
        const itemAuditado = accionesAuditadas[i - 1] || {
          accion: `Consumo en Comercio Adherido #${i}`,
          comercio: 'Red de Comercios Aliados Mutual',
          fecha: `0${i}/11/2026 15:45 hs`,
          pts: 150,
          comp: `TX-B2B-00${i}`,
          icono: 'Store'
        };
        items.push({
          selloNum: i,
          fechaHora: itemAuditado.fecha,
          accion: itemAuditado.accion,
          comercio: itemAuditado.comercio,
          puntosGanados: itemAuditado.pts,
          estado: 'Completado',
          comprobanteId: itemAuditado.comp
        });
      } else {
        const tipObj = tipsPendientes[i - 8] || {
          tip: 'Sumá compras mayores a $10.000 o abonos mutuales con QR para completar este casillero.'
        };
        items.push({
          selloNum: i,
          fechaHora: 'Pendiente de acreditación',
          accion: `Casillero de Fidelidad #${i} (Pendiente)`,
          comercio: 'Red de Comercios Aliados Mutual Modelo',
          puntosGanados: 0,
          estado: 'Pendiente',
          tipRecomendado: tipObj.tip
        });
      }
    }
    return items;
  }, [sellosActuales]);

  // Manejador lectura de QR desde Cámara
  const handleScanQrComercio = (decodedText: string) => {
    // Detectar si contiene ID o datos de comercio
    let idCom = 'COM-B2B-001';
    let monto = 18500;

    if (decodedText.includes('COM-B2B-002')) {
      idCom = 'COM-B2B-002';
      monto = 34200;
    } else if (decodedText.includes('COM-B2B-003')) {
      idCom = 'COM-B2B-003';
      monto = 75000;
    }

    const matchMonto = decodedText.match(/MONTO:(\d+)/);
    if (matchMonto && matchMonto[1]) {
      monto = parseInt(matchMonto[1], 10);
    }

    const com = comercios.find((c) => c.ID_Comercio === idCom) || comercios[0];
    setComercioDetectado(com);
    setMontoPago(monto);
    setModalConfirmarPago(true);
  };

  // Confirmar Pago
  const handleConfirmarPagoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioDetectado) return;

    // Calcular reintegro si aplica promo
    const promo = promociones.find(
      (p) => p.ID_Comercio === comercioDetectado.ID_Comercio || p.Rubro === comercioDetectado.Rubro
    );

    let reintegro = 0;
    if (promo) {
      const calc = Math.round(montoPago * (promo.Pct_Descuento / 100));
      reintegro = Math.min(calc, promo.Tope_Mensual_Socio);
    }

    const netoFinanciado = montoPago - reintegro;
    const valorCuota = Math.round(netoFinanciado / cuotasPago);

    const nuevaTx: Partial<TransaccionBilletera> = {
      ID_Transaccion: `TX-PWA-${Date.now().toString().slice(-5)}`,
      Fecha_Hora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI_Socio: socio.DNI,
      Apellido_Nombre_Socio: socio.Apellido_Nombre,
      ID_Comercio: comercioDetectado.ID_Comercio,
      Nombre_Comercio: comercioDetectado.Nombre_Fantasia,
      Rubro: comercioDetectado.Rubro,
      Billetera_Utilizada: billeteraElegida,
      Monto_Total_Compra: montoPago,
      Monto_Reintegro_Aplicado: reintegro,
      Monto_Neto_Financiado: netoFinanciado,
      Cuotas: cuotasPago,
      Monto_Cuota: valorCuota,
      Metodo_Autorizacion: 'QR Dinámico Billetera',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: totpToken,
      Liquidado_Al_Comercio: 'NO',
      ID_Promo_Aplicada: promo?.ID_Promo
    };

    onNuevaTransaccion(nuevaTx);
    setPagoExitoso(true);

    setTimeout(() => {
      setPagoExitoso(false);
      setModalConfirmarPago(false);
      setSeccionPWA('movimientos');
    }, 2000);
  };

  // Desconocer consumo
  const handleEnviarDesconocimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDesconocer || !motivoDesconocimiento.trim()) return;

    onDesconocerTransaccion(modalDesconocer.ID_Transaccion, motivoDesconocimiento.trim());
    setModalDesconocer(null);
    setMotivoDesconocimiento('');
  };

  // Simular subida de recibo con IA Gemini
  const handleSimularSubirRecibo = () => {
    setReciboProcesado(true);
    setTimeout(() => {
      onSubirReciboDrive(socio.DNI, null);
      setModalSubirRecibo(false);
      setReciboProcesado(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans max-w-md mx-auto shadow-2xl relative border-x border-slate-800">
      {/* Barra Superior PWA del Socio */}
      <header className="p-4 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#135596] to-emerald-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-white text-sm">
              {socio.Apellido_Nombre.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white truncate max-w-[170px]">
                Hola, {primerNombre} 👋
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AL DÍA 🟢
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{socio.Nro_Socio}</span>
              <span>•</span>
              <span>DNI {socio.DNI}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setModalScannerCamara(true)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1"
            title="Pagar con QR Cámara"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={onCerrarSesion}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Contenido Principal con Scroll */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        {/* Navegación por Pestañas PWA (6 Secciones con Mapa Interactivo) */}
        <div className="grid grid-cols-6 gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 text-center text-[10px] font-bold">
          <button
            onClick={() => setSeccionPWA('inicio')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              seccionPWA === 'inicio' ? 'bg-[#135596] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setSeccionPWA('credencial')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              seccionPWA === 'credencial' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Carnet
          </button>
          <button
            onClick={() => setSeccionPWA('directorio')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              seccionPWA === 'directorio' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            📍 Mapa
          </button>
          <button
            onClick={() => setSeccionPWA('billeteras')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              seccionPWA === 'billeteras' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Billeteras
          </button>
          <button
            onClick={() => setSeccionPWA('sellos')}
            className={`py-2 rounded-xl transition-all relative cursor-pointer ${
              seccionPWA === 'sellos' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sellos
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>
          <button
            onClick={() => setSeccionPWA('movimientos')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              seccionPWA === 'movimientos' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Consumos
          </button>
        </div>

        {/* 1. SECCIÓN INICIO */}
        {seccionPWA === 'inicio' && (
          <div className="space-y-4">
            {/* Tarjeta Resumen de Disponible Total */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#135596] via-blue-700 to-indigo-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                <Wallet className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-blue-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    DISPONIBLE TOTAL PREAPROBADO
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      3 Billeteras
                    </span>
                    <button
                      type="button"
                      onClick={() => setSaldoVisible(!saldoVisible)}
                      className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                      title={saldoVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
                    >
                      {saldoVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-300" />}
                    </button>
                  </div>
                </div>
                <div className="text-3xl font-extrabold tracking-tight font-mono">
                  {formatMasked(saldoB1CtaCte + saldoB2ConsumoB2B + saldoB3AyudaLibre)}
                </div>
                <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                  Líneas activas por convenio provincial y planilla de haberes.
                </p>

                {/* Accesos rápidos dentro de la tarjeta */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15">
                  <button
                    onClick={() => setModalScannerCamara(true)}
                    className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pagar con QR</span>
                  </button>

                  <button
                    onClick={() => setSeccionPWA('credencial')}
                    className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Ver Carnet QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen de las 3 Billeteras Estilo Naranja X */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mis 3 Billeteras Virtuales (Naranja X Multi-Wallet)
                </span>
                <button
                  onClick={() => setSeccionPWA('billeteras')}
                  className="text-xs text-blue-400 font-semibold hover:underline"
                >
                  Ver detalles
                </button>
              </div>

              {/* B1 Cuenta Corriente - Gradiente Azul Mutual (#135596) */}
              <div className="p-4 bg-gradient-to-r from-[#135596] to-[#0d3b66] text-white rounded-2xl border border-blue-400/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-extrabold text-xs shadow-inner">
                    B1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Billetera 1: Consumo Diario</h4>
                    <span className="text-[10px] text-blue-200 font-sans block">Farmacias y Ópticas (1-3 cuotas)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-300 font-mono block">
                    {formatMasked(saldoB1CtaCte)}
                  </span>
                  <span className="text-[9px] text-blue-200 font-mono">Tope disponible</span>
                </div>
              </div>

              {/* B2 Consumo B2B - Gradiente Violeta Fintech (#6366f1) */}
              <div className="p-4 bg-gradient-to-r from-[#6366f1] to-[#4338ca] text-white rounded-2xl border border-indigo-400/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-extrabold text-xs shadow-inner">
                    B2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Billetera 2: Consumo B2B</h4>
                    <span className="text-[10px] text-purple-200 font-sans block">Motos, Electro y Turismo (3-24 ctas)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-white font-mono block">
                    {formatMasked(saldoB2ConsumoB2B)}
                  </span>
                  <span className="text-[9px] text-purple-200 font-mono">Preaprobado</span>
                </div>
              </div>

              {/* B3 Ayuda Libre - Gradiente Esmeralda (#059669) */}
              <div className="p-4 bg-gradient-to-r from-[#059669] to-[#047857] text-white rounded-2xl border border-emerald-400/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-extrabold text-xs shadow-inner">
                    B3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Billetera 3: Ayuda Económica CBU</h4>
                    <span className="text-[10px] text-emerald-100 font-sans block">Desembolso inmediato en BERSA</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-200 font-mono block">
                    {formatMasked(saldoB3AyudaLibre)}
                  </span>
                  <span className="text-[9px] text-emerald-100 font-mono">Hasta 48 cuotas</span>
                </div>
              </div>
            </div>

            {/* Club de Fidelidad (10 Sellos Resumen) */}
            <div className="p-4 bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Club Mutual • 10 Sellos</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {sellosActuales}/10 Sellos
                </span>
              </div>

              {/* Barra de Progreso de Sellos */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-500/20 mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${(sellosActuales / 10) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Completá 10 y ganá <strong>$15.000</strong> en vouchers</span>
                <button
                  onClick={() => setSeccionPWA('sellos')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Ver tarjeta
                </button>
              </div>
            </div>

            {/* Banner Acceso a Directorio & Mapa de Comercios Aliados (Leaflet) */}
            <div className="p-4 bg-gradient-to-r from-teal-950/80 via-slate-800 to-slate-900 rounded-3xl border border-teal-500/30 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Directorio & Mapa de Comercios</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-teal-500/30 text-teal-200 rounded font-bold border border-teal-500/40">
                      Leaflet OpenStreetMap
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                    {comercios.length} comercios aliados en Paraná • Descuentos y pagos con QR en vivo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSeccionPWA('directorio')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Ver Mapa
              </button>
            </div>

            {/* Subir Recibo a Drive con IA */}
            <button
              onClick={() => setModalSubirRecibo(true)}
              className="w-full p-3.5 bg-slate-800 hover:bg-slate-750 border border-blue-500/30 hover:border-blue-400/60 rounded-2xl transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Actualizar Recibo de Sueldo</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/30 text-blue-200 rounded font-bold">
                      IA Gemini
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Suba el recibo del mes a su carpeta Google Drive para renovar márgenes.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* 2. SECCIÓN CREDENCIAL DIGITAL QR (CARNET DINÁMICO) */}
        {seccionPWA === 'credencial' && (
          <div className="space-y-4">
            {/* Carnet Digital */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#135596] via-blue-800 to-slate-900 border border-blue-400/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="./logo.jpg"
                    alt="Mutual Modelo"
                    className="w-8 h-8 rounded-lg bg-white p-0.5"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-blue-200 uppercase block">
                      CREDENCIAL OFICIAL DIGITAL
                    </span>
                    <span className="text-xs font-bold text-white">Mutual Modelo Entre Ríos</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                  ACTIVO 🟢
                </span>
              </div>

              {/* Datos del Socio */}
              <div className="space-y-1 mb-4 text-left">
                <span className="text-[10px] text-blue-200 font-mono uppercase tracking-wider block">
                  ASOCIADO TITULAR
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {socio.Apellido_Nombre}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-blue-300 font-mono block">DNI</span>
                    <span className="font-bold text-white font-mono">{socio.DNI}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 font-mono block">N° SOCIO</span>
                    <span className="font-bold text-white font-mono">{socio.Nro_Socio}</span>
                  </div>
                </div>
              </div>

              {/* Generador QR Dinámico Estable con TOTP 30s (Cero Parpadeo) */}
              <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                <QRCodeView
                  value={`QR_SOCIO:${socio.DNI}|NOMBRE:${socio.Apellido_Nombre}|CUOTA:AL_DIA|TOTP:${totpToken}`}
                  size={190}
                  colorDark="#135596"
                />

                {/* Token Dinámico y Medidor de Cuenta Regresiva de 30s */}
                <div className="w-full mt-3 text-center">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      TOKEN ROTATIVO (TOTP):
                    </span>
                    <span className="text-base font-mono font-extrabold text-[#135596] tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                      {totpToken}
                    </span>
                  </div>

                  {/* Barra de progreso fluida de los 30 segundos */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 relative border border-slate-200/60">
                    <div
                      className={`h-full transition-all duration-1000 ease-linear ${
                        segundosRestantes > 10 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(segundosRestantes / 30) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Ciclo: 30 segundos exactos
                    </span>
                    <span className="font-semibold text-slate-600">
                      Expira en <strong className="text-emerald-600 font-bold">{segundosRestantes}s</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-[10px] text-blue-200/80 leading-tight">
                Muestre este código en mostrador de comercios adheridos para autorizar compras.
              </div>
            </div>

            {/* Botón Escanear QR Comercio */}
            <button
              onClick={() => setModalScannerCamara(true)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear QR de Mostrador del Comercio</span>
            </button>
          </div>
        )}

        {/* 2.5 SECCIÓN DIRECTORIO & MAPA INTERACTIVO DE COMERCIOS (LEAFLET) */}
        {seccionPWA === 'directorio' && (
          <DirectorioComerciosMapa
            comercios={comercios}
            promociones={promociones}
            onSeleccionarParaPagoQR={(comercio) => {
              setComercioDetectado(comercio);
              setMontoPago(18500);
              setCuotasPago(3);
              setModalConfirmarPago(true);
            }}
          />
        )}

        {/* 3. SECCIÓN BILLETERAS DETALLADAS */}
        {seccionPWA === 'billeteras' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detalle de Disponibles por Línea
            </h3>

            {/* Tarjeta B1 */}
            <div className="p-4 bg-slate-800 rounded-2xl border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">BILLETERA 1 • CUENTA CORRIENTE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">
                  1 A 3 CUOTAS
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {formatMonedaAR(saldoB1CtaCte)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Destinada a consumos cotidianos en Proveeduría Belgrano, Farmacias asociadas y Ópticas. Débito automático en recibo de sueldo.
              </p>
            </div>

            {/* Tarjeta B2 */}
            <div className="p-4 bg-slate-800 rounded-2xl border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">BILLETERA 2 • CONSUMO B2B COMERCIOS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold">
                  HASTA 24 CUOTAS
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {formatMonedaAR(saldoB2ConsumoB2B)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Financiación en comercios de motovehículos, electrodomésticos, náutica y turismo termal. Liquidación directa al comercio.
              </p>
            </div>

            {/* Tarjeta B3 */}
            <div className="p-4 bg-slate-800 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">BILLETERA 3 • AYUDA LIBRE CBU</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                  TRANSFERENCIA BERSA
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {formatMonedaAR(saldoB3AyudaLibre)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Crédito en efectivo depositado en su cuenta CBU. Disponible para libre destino con tasa subsidiada para asociados.
              </p>
            </div>
          </div>
        )}

        {/* 4. SECCIÓN TARJETA DE 10 SELLOS INTELIGENTE (AUDITADA + TIPS & PROMOS) */}
        {seccionPWA === 'sellos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Cabecera Principal de Fidelidad */}
            <div className="p-5 bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 rounded-3xl border border-purple-500/40 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 pointer-events-none">
                <Award className="w-44 h-44 text-purple-300" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-mono font-bold uppercase mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>CLUB MODELO BENEFICIOS</span>
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Tarjeta Digital de 10 Sellos
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed font-sans">
                  Sumá 1 sello por cada pago puntual de cuota social y consumos mayores a $10.000 en la red de comercios adheridos.
                </p>

                {/* Resumen de Progreso y Puntos */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-purple-500/20 max-w-xs mx-auto">
                  <div className="p-2 bg-purple-900/30 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 font-mono block">Progreso</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {sellosActuales}/10
                    </span>
                  </div>
                  <div className="p-2 bg-purple-900/30 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 font-mono block">Puntos Club</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {puntosTotales}
                    </span>
                  </div>
                  <div className="p-2 bg-purple-900/30 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 font-mono block">Ciclos</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {fidelidad?.Ciclos_Completados ?? 1}
                    </span>
                  </div>
                </div>

                {/* Matriz Interactiva de los 10 Sellos */}
                <div className="my-5 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2 px-1">
                    <span>CASILLEROS (1 AL 10):</span>
                    <span className="text-amber-400 font-bold">Tocá un sello para auditarlo</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {listaDetalleSellos.map((sello) => {
                      const completado = sello.estado === 'Completado';
                      return (
                        <button
                          key={sello.selloNum}
                          type="button"
                          onClick={() => setModalDetalleSello(sello)}
                          className={`h-14 rounded-2xl flex flex-col items-center justify-center border font-bold transition-all cursor-pointer relative group ${
                            completado
                              ? 'bg-gradient-to-tr from-amber-400 to-emerald-400 border-amber-300 text-slate-950 shadow-md hover:scale-105 active:scale-95'
                              : 'bg-slate-800/80 border-slate-700 hover:border-purple-500/50 text-slate-400 hover:text-white hover:scale-102'
                          }`}
                        >
                          <span className="text-[9px] font-mono absolute top-1 left-2 opacity-70">
                            #{sello.selloNum}
                          </span>
                          {completado ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-950 mt-2" />
                          ) : (
                            <span className="text-sm font-mono mt-2 text-slate-500 group-hover:text-purple-300">
                              ⚪
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Banner de Premio Automático al completar los 10 */}
                <div className="p-3.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-2xl border border-purple-400/30 text-xs text-purple-200 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Premio de Ciclo: Voucher $15.000</span>
                      <span className="text-[10px] text-purple-300 leading-tight block">
                        Al completar el 10º sello se acredita automáticamente para canjear.
                      </span>
                    </div>
                  </div>
                  {sellosActuales >= 10 ? (
                    <button
                      type="button"
                      onClick={() => setModalVoucherActivo(true)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-extrabold text-[11px] shadow-sm cursor-pointer shrink-0"
                    >
                      Ver Voucher
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-amber-400/90 shrink-0">
                      Faltan {10 - sellosActuales}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN INTELIGENTE: ¿CÓMO SUMAR TUS PRÓXIMOS SELLOS? (TIPS & PROMOS) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  ¿Cómo sumar tus próximos sellos? (Tips & Promos)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Sugerencias activas
                </span>
              </div>

              {/* Tarjeta Tip 1: Débito Automático */}
              <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-blue-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Débito Automático Cuota Social</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">
                      +1 Sello Mensual
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                    Adherí tu cuota a tu caja de ahorro BERSA o planilla de haberes y asegurá 1 sello el primer día hábil de cada mes sin trámites.
                  </p>
                </div>
              </div>

              {/* Tarjeta Promo 2: Farmacia Modelo (25% Reintegro) */}
              <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Farmacia Modelo • 25% Reintegro</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                      +1 Sello &gt; $10.000
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                    Pagá con QR en mostrador en medicamentos y perfumería. Obtené 25% de ahorro directo y sumá 1 sello al instante.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalScannerCamara(true)}
                    className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pagar con QR en Farmacia</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tarjeta Promo 3: Proveeduría Belgrano */}
              <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-purple-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Proveeduría Belgrano • 3 Cuotas</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold">
                      +1 Sello en Alimentos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                    Canasta básica familiar en hasta 3 cuotas fijas mutuales con tu Billetera 1 Cuenta Corriente.
                  </p>
                </div>
              </div>

              {/* Tarjeta Promo 4: Recibo de Sueldo y Legajo */}
              <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-amber-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Actualizá tu Recibo con IA</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                      +1 Sello Bonificación
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                    Subí tu último recibo de haberes a Google Drive para auditoría con Gemini Vision y renová tus márgenes preaprobados.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalSubirRecibo(true)}
                    className="mt-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Subir Recibo a Drive</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* VOUCHERS DISPONIBLES Y HISTORIAL */}
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  Tus Vouchers Disponibles
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1 activo</span>
              </div>

              <div className="p-3.5 bg-gradient-to-r from-purple-900/40 via-slate-800 to-indigo-900/40 rounded-xl border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                    DISPONIBLE PARA CANJE
                  </span>
                  <h4 className="text-xs font-extrabold text-white mt-1">
                    Voucher $15.000 • Red Mutual Modelo
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Vence: 15/12/2026 • Código: MOD-VOU-8419
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalVoucherActivo(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Canjear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. SECCIÓN CONSUMOS Y MOVIMIENTOS */}
        {seccionPWA === 'movimientos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Historial de Consumos Realizados
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {misTransacciones.length} registros
              </span>
            </div>

            {misTransacciones.length === 0 ? (
              <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                Aún no posee consumos registrados en este período.
              </div>
            ) : (
              <div className="space-y-2">
                {misTransacciones.map((tx) => (
                  <div
                    key={tx.ID_Transaccion}
                    className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{tx.Nombre_Comercio}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {tx.Fecha_Hora} • {tx.Metodo_Autorizacion}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-white block">
                          {formatMonedaAR(tx.Monto_Neto_Financiado)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.Cuotas} cuota(s) de {formatMonedaAR(tx.Monto_Cuota)}
                        </span>
                      </div>
                    </div>

                    {tx.Monto_Reintegro_Aplicado > 0 && (
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Reintegro mutual aplicado: {formatMonedaAR(tx.Monto_Reintegro_Aplicado)}</span>
                      </div>
                    )}

                    {/* Estado de Transacción y Botón Desconocer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md ${
                          tx.Estado_Transaccion === 'Aprobada'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {tx.Estado_Transaccion}
                      </span>

                      {tx.Estado_Transaccion === 'Aprobada' && (
                        <button
                          onClick={() => {
                            setModalDesconocer(tx);
                            setMotivoDesconocimiento('');
                          }}
                          className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Desconocer Consumo</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botón Flotante Permanente: PAGAR CON QR */}
      <div className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
        <button
          onClick={() => setModalScannerCamara(true)}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-2xl shadow-emerald-500/40 pointer-events-auto flex items-center justify-center gap-2 transform active:scale-98 transition-all"
        >
          <Camera className="w-5 h-5 text-slate-950" />
          <span>Pagar con QR en Mostrador</span>
        </button>
      </div>

      {/* MODAL 1: ESCÁNER QR POR CÁMARA */}
      <QRCameraScannerModal
        isOpen={modalScannerCamara}
        title="Escáner QR • Pagar con Billetera"
        subtitle="Apunte la cámara al código QR exhibido por el comercio"
        expectedType="COMERCIO"
        onScanSuccess={handleScanQrComercio}
        onClose={() => setModalScannerCamara(false)}
      />

      {/* MODAL 2: CONFIRMACIÓN DE PAGO CON QR */}
      {modalConfirmarPago && comercioDetectado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setModalConfirmarPago(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {pagoExitoso ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-lg font-extrabold text-white">¡Pago Autorizado con Éxito!</h3>
                <p className="text-xs text-emerald-300 font-mono mt-1">
                  Comprobante generado • Operación informada al comercio
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmarPagoSubmit} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#135596] flex items-center justify-center text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                      COMERCIO DETECTADO
                    </span>
                    <h4 className="text-sm font-bold text-white">{comercioDetectado.Nombre_Fantasia}</h4>
                    <span className="text-[10px] text-slate-400">{comercioDetectado.Rubro}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Monto de la Compra</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={100}
                      value={montoPago}
                      onChange={(e) => setMontoPago(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base font-extrabold font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Seleccionar Billetera</label>
                  <select
                    value={billeteraElegida}
                    onChange={(e: any) => setBilleteraElegida(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Disponible 1 - Cuenta Corriente">B1: Cuenta Corriente (1-3 cuotas)</option>
                    <option value="Disponible 2 - Consumo Específico B2B">B2: Consumo B2B (1-24 cuotas)</option>
                    <option value="Disponible 3 - Ayuda Libre">B3: Ayuda Libre CBU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Cantidad de Cuotas</label>
                  <select
                    value={cuotasPago}
                    onChange={(e) => setCuotasPago(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {[1, 2, 3, 6, 12].map((c) => (
                      <option key={c} value={c}>
                        {c} cuota(s) de {formatMonedaAR(Math.round(montoPago / c))}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Reintegro Mutual Estimado:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatMonedaAR(Math.round(montoPago * 0.25))}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-emerald-500/20">
                    <span>Neto a Financiar:</span>
                    <span className="font-mono text-sm">
                      {formatMonedaAR(montoPago - Math.round(montoPago * 0.25))}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autorizar Pago con Billetera</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: DESCONOCER CONSUMO (ANTIFRAUDE) */}
      {modalDesconocer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold">Desconocer Consumo (Antifraude)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Está por reportar la compra en <strong>{modalDesconocer.Nombre_Comercio}</strong> por <strong>{formatMonedaAR(modalDesconocer.Monto_Neto_Financiado)}</strong>. Se suspenderá temporalmente el cobro para auditoría interna.
            </p>

            <form onSubmit={handleEnviarDesconocimiento} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Motivo del reclamo</label>
                <textarea
                  required
                  rows={3}
                  value={motivoDesconocimiento}
                  onChange={(e) => setMotivoDesconocimiento(e.target.value)}
                  placeholder="Ej: No reconozco el comercio / Clonación de tarjeta / Monto incorrecto..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalDesconocer(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Confirmar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBIR RECIBO CON IA */}
      {modalSubirRecibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-blue-500/40 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Subir Recibo de Sueldo</h3>
            <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
              El motor <strong>Gemini Vision IA</strong> auditará la legibilidad y actualizará automáticamente sus márgenes disponibles en Google Sheets.
            </p>

            {reciboProcesado ? (
              <div className="py-4 space-y-2">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <span className="text-xs font-mono text-blue-200 block">
                  Analizando códigos de haberes y descuentos con IA...
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-300 block">
                    Fotografiar o Seleccionar Archivo
                  </span>
                  <span className="text-[10px] text-slate-500">PDF, JPG o PNG hasta 10MB</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalSubirRecibo(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSimularSubirRecibo}
                    className="flex-1 py-2 bg-[#135596] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Auditar con Gemini
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: DETALLE Y AUDITORÍA DE SELLO (TRAZABILIDAD 10 SELLOS) */}
      {modalDetalleSello && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setModalDetalleSello(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-md ${
                  modalDetalleSello.estado === 'Completado'
                    ? 'bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                #{modalDetalleSello.selloNum}
              </div>
              <div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    modalDetalleSello.estado === 'Completado'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {modalDetalleSello.estado === 'Completado'
                    ? 'ACREDITADO Y AUDITADO 🟢'
                    : 'CASILLERO PENDIENTE ⚪'}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Sello #{modalDetalleSello.selloNum} del Ciclo
                </h3>
              </div>
            </div>

            {modalDetalleSello.estado === 'Completado' ? (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Acción Realizada
                  </span>
                  <p className="font-semibold text-white mt-0.5">{modalDetalleSello.accion}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">
                      Fecha y Hora
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {modalDetalleSello.fechaHora}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">
                      Puntos Ganados
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      +{modalDetalleSello.puntosGanados} pts
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Comercio / Entidad
                  </span>
                  <span className="font-medium text-slate-200">{modalDetalleSello.comercio}</span>
                </div>

                {modalDetalleSello.comprobanteId && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Comprobante: {modalDetalleSello.comprobanteId}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Trazabilidad OK
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-purple-500/30 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Lightbulb className="w-4 h-4" />
                  <span>¿Cómo sumar este sello?</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {modalDetalleSello.tipRecomendado ||
                    'Realizá compras mayores a $10.000 con QR o mantené tus cuotas mutuales al día.'}
                </p>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetalleSello(null);
                      setModalScannerCamara(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pagar con QR para Desbloquear</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setModalDetalleSello(null)}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: VOUCHER DE $15.000 (CANJE EN COMERCIOS) */}
      {modalVoucherActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/40 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setModalVoucherActivo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg font-black text-xl">
              $
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              VOUCHER PREMIO CLUB MODELO
            </span>

            <h3 className="text-xl font-extrabold text-white mt-1">Valor: $15.000</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Válido para compras en Farmacia Modelo, Proveeduría Belgrano y comercios adheridos.
            </p>

            <div className="my-4 p-3 bg-white rounded-2xl shadow-inner inline-block">
              <QRCodeView
                value={`VOUCHER_CANJE:MOD-VOU-8419|MONTO:15000|DNI:${socio.DNI}|SOCIO:${socio.Apellido_Nombre}`}
                size={160}
                colorDark="#135596"
              />
              <div className="text-center mt-2">
                <span className="text-[11px] font-mono font-extrabold text-slate-800 tracking-wider">
                  CÓDIGO: MOD-VOU-8419
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono mb-4">
              Vencimiento: 15/12/2026 • Presentar este código en mostrador
            </div>

            <button
              type="button"
              onClick={() => setModalVoucherActivo(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Listo / Guardar en Billetera
            </button>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR FIJA PWA FINTECH (68px) CON BOTÓN CENTRAL FLOTANTE MODO (-20px) */}
      <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md h-[68px] bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex items-center justify-around z-40 px-3">
        <button
          type="button"
          onClick={() => setSeccionPWA('inicio')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer flex-1 ${
            seccionPWA === 'inicio' ? 'text-[#38bdf8] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionPWA('directorio')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer flex-1 ${
            seccionPWA === 'directorio' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-bold">Comercios</span>
        </button>

        {/* Botón Central Flotante MODO (top -20px, 62x62px) con Pulso */}
        <div className="relative -top-5 flex flex-col items-center px-1">
          <button
            type="button"
            onClick={() => setModalScannerCamara(true)}
            className="w-[62px] h-[62px] rounded-full bg-gradient-to-tr from-[#135596] via-blue-600 to-indigo-600 border-4 border-slate-900 shadow-2xl text-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-blue-500/40 animate-pulse"
            title="Escanear QR MODO"
          >
            <Camera className="w-7 h-7 text-white" />
          </button>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-300 mt-1">
            Pagar QR
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSeccionPWA('sellos')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer flex-1 ${
            seccionPWA === 'sellos' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold">Sellos</span>
        </button>

        <button
          type="button"
          onClick={() => setSeccionPWA('credencial')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer flex-1 ${
            seccionPWA === 'credencial' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Carnet</span>
        </button>
      </nav>
    </div>
  );
};
