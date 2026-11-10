import React, { useState } from 'react';
import {
  ComercioAlianzaB2B,
  SocioPadron,
  PromocionPoolReintegro,
  TransaccionBilletera,
  AdelantoLiquidacionComercio,
  OperadorMutual
} from '../../types/crm';
import { QRCodeView } from '../common/QRCodeView';
import { QRCameraScannerModal } from '../common/QRCameraScannerModal';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  Store,
  QrCode,
  Camera,
  Send,
  Zap,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Building,
  CreditCard,
  DollarSign,
  UserCheck,
  ShieldCheck,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface PortalComercioB2BProps {
  comercio: ComercioAlianzaB2B;
  socios: SocioPadron[];
  promociones: PromocionPoolReintegro[];
  transacciones: TransaccionBilletera[];
  adelantos: AdelantoLiquidacionComercio[];
  operadorActivo: OperadorMutual;
  onNuevaTransaccion: (tx: Partial<TransaccionBilletera>) => void;
  onSolicitarAdelanto: (adelanto: Partial<AdelantoLiquidacionComercio>) => void;
  onCerrarSesion: () => void;
  onCambiarPortal: (portal: any) => void;
}

export const PortalComercioB2B: React.FC<PortalComercioB2BProps> = ({
  comercio,
  socios,
  promociones,
  transacciones,
  adelantos,
  operadorActivo,
  onNuevaTransaccion,
  onSolicitarAdelanto,
  onCerrarSesion,
  onCambiarPortal
}) => {
  const [tabComercio, setTabComercio] = useState<'cobros' | 'adelantos' | 'promos' | 'ventas'>('cobros');

  // Modos de Cobro: A (Generar QR), B (Escanear Socio), C (Cobro Asistido DNI)
  const [modoCobro, setModoCobro] = useState<'MODO_A_GENERAR_QR' | 'MODO_B_ESCANEAR_SOCIO' | 'MODO_C_DNI_WHATSAPP'>('MODO_A_GENERAR_QR');

  // Estado Modo A: Generar QR de Cobro
  const [montoModoA, setMontoModoA] = useState<number>(24500);
  const [cuotasModoA, setCuotasModoA] = useState<number>(3);
  const [qrCobroActivo, setQrCobroActivo] = useState<string | null>(null);
  const [cobroModoAExitoso, setCobroModoAExitoso] = useState(false);

  // Estado Modo B: Escanear Socio con Cámara
  const [modalScannerSocio, setModalScannerSocio] = useState(false);
  const [socioEscaneado, setSocioEscaneado] = useState<SocioPadron | null>(null);
  const [montoModoB, setMontoModoB] = useState<number>(15000);
  const [cuotasModoB, setCuotasModoB] = useState<number>(1);
  const [cobroModoBExitoso, setCobroModoBExitoso] = useState(false);

  // Estado Modo C: Cobro Asistido por DNI
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [socioEncontradoDni, setSocioEncontradoDni] = useState<SocioPadron | null>(null);
  const [montoModoC, setMontoModoC] = useState<number>(18000);
  const [cuotasModoC, setCuotasModoC] = useState<number>(3);
  const [linkWhatsappEnviado, setLinkWhatsappEnviado] = useState(false);

  // Modal Adelanto de Liquidación
  const [modalAdelanto, setModalAdelanto] = useState(false);
  const [montoAdelantoSolicitar, setMontoAdelantoSolicitar] = useState<number>(Math.min(comercio.Saldo_Ventas_Pendientes || 500000, 350000));
  const [adelantoExitoso, setAdelantoExitoso] = useState(false);

  // Modal QR Vidriera "El QR que no vence"
  const [modalQrVidriera, setModalQrVidriera] = useState(false);

  // Filtrar transacciones y adelantos de este comercio
  const misVentas = transacciones.filter((t) => t.ID_Comercio === comercio.ID_Comercio);
  const misAdelantos = adelantos.filter((a) => a.ID_Comercio === comercio.ID_Comercio);
  const promoActiva = promociones.find((p) => p.ID_Comercio === comercio.ID_Comercio || p.Rubro === comercio.Rubro);

  // Manejador Generar QR de Cobro (Modo A)
  const handleGenerarQrCobro = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const payload = `QR_COBRO_COMERCIO:${comercio.ID_Comercio}|COM:${comercio.Nombre_Fantasia}|MONTO:${montoModoA}|CUOTAS:${cuotasModoA}|TOKEN:${token}`;
    setQrCobroActivo(payload);
    setCobroModoAExitoso(false);
  };

  // Simular lectura y aprobación del QR en Modo A por el socio
  const handleSimularAprobacionSocioModoA = () => {
    const socioDemo = socios[0];
    const nuevaTx: Partial<TransaccionBilletera> = {
      ID_Transaccion: `TX-B2B-${Date.now().toString().slice(-5)}`,
      Fecha_Hora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI_Socio: socioDemo.DNI,
      Apellido_Nombre_Socio: socioDemo.Apellido_Nombre,
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Rubro: comercio.Rubro,
      Billetera_Utilizada: 'Disponible 1 - Cuenta Corriente',
      Monto_Total_Compra: montoModoA,
      Monto_Reintegro_Aplicado: Math.round(montoModoA * 0.25),
      Monto_Neto_Financiado: montoModoA - Math.round(montoModoA * 0.25),
      Cuotas: cuotasModoA,
      Monto_Cuota: Math.round((montoModoA - Math.round(montoModoA * 0.25)) / cuotasModoA),
      Metodo_Autorizacion: 'QR Dinámico Billetera',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: 'AUTH-QR-OK',
      Liquidado_Al_Comercio: 'NO',
      ID_Promo_Aplicada: promoActiva?.ID_Promo
    };

    onNuevaTransaccion(nuevaTx);
    setCobroModoAExitoso(true);
  };

  // Manejador Escaneo de Socio con Cámara (Modo B)
  const handleScanSocioCamara = (decodedText: string) => {
    // Buscar si contiene DNI
    let dniEncontrado = '28456123';
    if (decodedText.includes('31920445')) {
      dniEncontrado = '31920445';
    }

    const matchDni = decodedText.match(/QR_SOCIO:(\d+)/);
    if (matchDni && matchDni[1]) {
      dniEncontrado = matchDni[1];
    }

    const s = socios.find((soc) => soc.DNI === dniEncontrado) || socios[0];
    setSocioEscaneado(s);
  };

  const handleConfirmarCobroModoB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socioEscaneado) return;

    const nuevaTx: Partial<TransaccionBilletera> = {
      ID_Transaccion: `TX-SCAN-${Date.now().toString().slice(-5)}`,
      Fecha_Hora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI_Socio: socioEscaneado.DNI,
      Apellido_Nombre_Socio: socioEscaneado.Apellido_Nombre,
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Rubro: comercio.Rubro,
      Billetera_Utilizada: 'Disponible 2 - Consumo Específico B2B',
      Monto_Total_Compra: montoModoB,
      Monto_Reintegro_Aplicado: Math.round(montoModoB * 0.15),
      Monto_Neto_Financiado: montoModoB - Math.round(montoModoB * 0.15),
      Cuotas: cuotasModoB,
      Monto_Cuota: Math.round((montoModoB - Math.round(montoModoB * 0.15)) / cuotasModoB),
      Metodo_Autorizacion: 'Token PIN',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: 'SCAN-AUTH',
      Liquidado_Al_Comercio: 'NO',
      ID_Promo_Aplicada: promoActiva?.ID_Promo
    };

    onNuevaTransaccion(nuevaTx);
    setCobroModoBExitoso(true);
    setTimeout(() => {
      setCobroModoBExitoso(false);
      setSocioEscaneado(null);
    }, 2500);
  };

  // Manejador Búsqueda DNI (Modo C)
  const handleBuscarDni = (e: React.FormEvent) => {
    e.preventDefault();
    const s = socios.find((soc) => soc.DNI.includes(dniBusqueda.trim()));
    if (s) {
      setSocioEncontradoDni(s);
    } else {
      alert(`No se encontró ningún asociado registrado con el DNI ${dniBusqueda}.`);
    }
  };

  const handleEnviarWhatsappCobro = () => {
    if (!socioEncontradoDni) return;
    setLinkWhatsappEnviado(true);
    setTimeout(() => {
      setLinkWhatsappEnviado(false);
      setSocioEncontradoDni(null);
      setDniBusqueda('');
    }, 2500);
  };

  // Solicitar Adelanto
  const handleConfirmarAdelantoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasa = comercio.Tasa_Descuento_Adelanto_Pct || 3.0;
    const descuento = Math.round(montoAdelantoSolicitar * (tasa / 100));
    const neto = montoAdelantoSolicitar - descuento;

    onSolicitarAdelanto({
      ID_Adelanto: `ADL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      Fecha_Solicitud: new Date().toISOString().slice(0, 10),
      ID_Comercio: comercio.ID_Comercio,
      Nombre_Comercio: comercio.Nombre_Fantasia,
      Monto_Ventas_Adelantadas: montoAdelantoSolicitar,
      Tasa_Descuento_Pct: tasa,
      Monto_Descuento_Financiero: descuento,
      Neto_Transferido: neto,
      CBU_Destino: '0860002101800019284102',
      Estado: 'Liquidado',
      Operador: operadorActivo
    });

    setAdelantoExitoso(true);
    setTimeout(() => {
      setAdelantoExitoso(false);
      setModalAdelanto(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Cabecera del Comercio Aliado B2B */}
      <header className="bg-slate-900 border-b border-purple-900/40 p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-purple-300">
                <Store className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  {comercio.Nombre_Fantasia}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                  {comercio.Rubro}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>CUIT: {comercio.CUIT_Responsable}</span>
                <span>•</span>
                <span>Terminal Paraná Central</span>
              </div>
            </div>
          </div>

          {/* Saldo a Liquidar & Botón Adelanto */}
          <div className="flex items-center gap-3">
            <div className="text-right bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-mono block">Ventas a Liquidar:</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                {formatMonedaAR(comercio.Saldo_Ventas_Pendientes || 640000)}
              </span>
            </div>

            <button
              onClick={() => setModalAdelanto(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Adelanto 24hs</span>
            </button>

            <button
              onClick={onCerrarSesion}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Cerrar sesión B2B"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Portal B2B */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => setTabComercio('cobros')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tabComercio === 'cobros' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Centro de Cobros en Mostrador</span>
          </button>

          <button
            onClick={() => setTabComercio('adelantos')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tabComercio === 'adelantos' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Adelanto de Liquidaciones</span>
          </button>

          <button
            onClick={() => setTabComercio('promos')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tabComercio === 'promos' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promociones & QR Vidriera</span>
          </button>

          <button
            onClick={() => setTabComercio('ventas')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tabComercio === 'ventas' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Libro de Ventas ({misVentas.length})</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* PESTAÑA 1: CENTRO DE COBROS EN MOSTRADOR */}
        {tabComercio === 'cobros' && (
          <div className="space-y-6">
            {/* Selector de los 3 Modos de Cobro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setModoCobro('MODO_A_GENERAR_QR')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  modoCobro === 'MODO_A_GENERAR_QR'
                    ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-400/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2 font-bold text-xs">
                  A
                </div>
                <h4 className="text-sm font-bold text-white">Modo A: Generar QR de Cobro</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Ingrese monto y cuotas. El cliente escanea el QR desde su App.
                </p>
              </button>

              <button
                onClick={() => setModoCobro('MODO_B_ESCANEAR_SOCIO')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  modoCobro === 'MODO_B_ESCANEAR_SOCIO'
                    ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-400/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2 font-bold text-xs">
                  B
                </div>
                <h4 className="text-sm font-bold text-white">Modo B: Escanear Carnet del Socio</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Active la cámara para leer el QR de la credencial del cliente.
                </p>
              </button>

              <button
                onClick={() => setModoCobro('MODO_C_DNI_WHATSAPP')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  modoCobro === 'MODO_C_DNI_WHATSAPP'
                    ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-400/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2 font-bold text-xs">
                  C
                </div>
                <h4 className="text-sm font-bold text-white">Modo C: Cobro Asistido por DNI</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Búsqueda por DNI con envío de autorización remota por WhatsApp.
                </p>
              </button>
            </div>

            {/* CONTENIDO MODO A: GENERAR QR EN PANTALLA */}
            {modoCobro === 'MODO_A_GENERAR_QR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <form onSubmit={handleGenerarQrCobro} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Datos del Cobro en Mostrador
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Monto a Cobrar ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                      <input
                        type="number"
                        required
                        min={100}
                        value={montoModoA}
                        onChange={(e) => setMontoModoA(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-extrabold font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Plan de Cuotas</label>
                    <select
                      value={cuotasModoA}
                      onChange={(e) => setCuotasModoA(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                    >
                      {[1, 2, 3, 6, 12, 18].map((c) => (
                        <option key={c} value={c}>
                          {c} cuota(s) de {formatMonedaAR(Math.round(montoModoA / c))} (TNA Bonificada)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generar Código QR en Pantalla</span>
                  </button>
                </form>

                {/* Visor del QR Generado para el Cliente */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
                  {qrCobroActivo ? (
                    <>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-2">
                        PIDA AL CLIENTE QUE ESCANEE ESTE CÓDIGO
                      </span>

                      <div className="p-3 bg-white rounded-2xl shadow-xl">
                        <QRCodeView
                          value={qrCobroActivo}
                          size={190}
                          title={comercio.Nombre_Fantasia}
                          subtext={`Cobro de ${formatMonedaAR(montoModoA)} en ${cuotasModoA} cta(s)`}
                          colorDark="#581c87"
                        />
                      </div>

                      {cobroModoAExitoso ? (
                        <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>¡Cobro autorizado por el asociado con éxito!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSimularAprobacionSocioModoA}
                          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simular Escaneo y Pago por Socio (Demo)</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500 py-8 space-y-2">
                      <QrCode className="w-12 h-12 mx-auto opacity-30" />
                      <p className="text-xs">
                        Haga clic en <strong>"Generar Código QR"</strong> para proyectar el cobro en mostrador.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTENIDO MODO B: ESCANEAR CREDENCIAL DEL SOCIO */}
            {modoCobro === 'MODO_B_ESCANEAR_SOCIO' && (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lectura de Credencial QR de Asociado por Cámara
                    </h3>
                  </div>
                  <button
                    onClick={() => setModalScannerSocio(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Activar Cámara</span>
                  </button>
                </div>

                {socioEscaneado ? (
                  <form onSubmit={handleConfirmarCobroModoB} className="space-y-4 max-w-lg mx-auto bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
                          SOCIO VALIDADO
                        </span>
                        <h4 className="text-sm font-bold text-white">{socioEscaneado.Apellido_Nombre}</h4>
                        <span className="text-xs text-slate-400 font-mono">DNI {socioEscaneado.DNI} • {socioEscaneado.Organismo}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                        CUOTA AL DÍA 🟢
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Monto a Facturar ($)</label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={montoModoB}
                        onChange={(e) => setMontoModoB(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base font-extrabold font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Cuotas</label>
                      <select
                        value={cuotasModoB}
                        onChange={(e) => setCuotasModoB(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      >
                        {[1, 2, 3, 6].map((c) => (
                          <option key={c} value={c}>
                            {c} cuota(s)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Cobro al Socio</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-10 space-y-3">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Haga clic en <strong>"Activar Cámara"</strong> para escanear el carnet digital del socio o seleccione un socio de prueba.
                    </p>
                    <button
                      onClick={() => setModalScannerSocio(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Abrir Escáner de Cámara
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO MODO C: COBRO ASISTIDO POR DNI */}
            {modoCobro === 'MODO_C_DNI_WHATSAPP' && (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Send className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Cobro Asistido por DNI y WhatsApp Institucional
                  </h3>
                </div>

                <form onSubmit={handleBuscarDni} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                    placeholder="Ingrese DNI del asociado..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    Buscar
                  </button>
                </form>

                {socioEncontradoDni && (
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-500/30 max-w-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{socioEncontradoDni.Apellido_Nombre}</h4>
                        <span className="text-xs text-slate-400 font-mono">DNI {socioEncontradoDni.DNI}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Margen: {formatMonedaAR(socioEncontradoDni.Margen_Cuota_Disponible)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Monto ($)</label>
                        <input
                          type="number"
                          value={montoModoC}
                          onChange={(e) => setMontoModoC(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Cuotas</label>
                        <select
                          value={cuotasModoC}
                          onChange={(e) => setCuotasModoC(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                        >
                          <option value={1}>1 cuota</option>
                          <option value={3}>3 cuotas</option>
                          <option value={6}>6 cuotas</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnviarWhatsappCobro}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{linkWhatsappEnviado ? '¡Enlace Enviado por WhatsApp!' : 'Enviar Link de Confirmación'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: ADELANTO DE LIQUIDACIONES EN 24HS */}
        {tabComercio === 'adelantos' && (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Línea de Adelanto de Liquidaciones en 24 Horas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cobre hoy mismo sus ventas financiadas con tasa preferencial mutual.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalAdelanto(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Solicitar Adelanto
              </button>
            </div>

            {/* Historial de Adelantos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Liquidaciones y Transferencias Recientes
              </h4>
              {misAdelantos.length === 0 ? (
                <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                  No posee adelantos solicitados recientemente.
                </div>
              ) : (
                <div className="space-y-2">
                  {misAdelantos.map((ad) => (
                    <div
                      key={ad.ID_Adelanto}
                      className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white font-mono">{ad.ID_Adelanto}</span>
                        <span className="text-slate-400 text-[10px] block font-mono">{ad.Fecha_Solicitud}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 font-mono block">
                          {formatMonedaAR(ad.Neto_Transferido)}
                        </span>
                        <span className="text-[10px] text-slate-400">Tasa: {ad.Tasa_Descuento_Pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: PROMOCIONES & QR VIDRIERA */}
        {tabComercio === 'promos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-800">
            {promoActiva ? (
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                  CAMPAÑA DE REINTEGRO VIGENTE
                </span>
                <h3 className="text-base font-extrabold text-white">{promoActiva.Titulo}</h3>
                <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-500/30 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Reintegro al Asociado:</span>
                    <span className="font-bold text-purple-300">{promoActiva.Pct_Descuento}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Tope Mensual por Socio:</span>
                    <span className="font-mono font-bold text-white">{formatMonedaAR(promoActiva.Tope_Mensual_Socio)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Sin campaña activa para este comercio.</div>
            )}

            {/* Cartel "El QR que no vence" */}
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
              <span className="text-xs font-bold text-white mb-2">Cartel Oficial de Mostrador</span>
              <div className="p-2 bg-white rounded-xl">
                <QRCodeView
                  value={`QR_VIDRIERA:${comercio.ID_Comercio}|MUTUAL_MODELO|RUBRO:${comercio.Rubro}`}
                  size={160}
                  colorDark="#135596"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                "El QR que no vence" para exhibición física en caja.
              </span>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: LIBRO DE VENTAS */}
        {tabComercio === 'ventas' && (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Historial de Transacciones Registradas
            </h3>
            {misVentas.length === 0 ? (
              <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                Aún no hay transacciones registradas en este período.
              </div>
            ) : (
              <div className="space-y-2">
                {misVentas.map((v) => (
                  <div
                    key={v.ID_Transaccion}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{v.Apellido_Nombre_Socio}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        DNI {v.DNI_Socio} • {v.Fecha_Hora}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white font-mono block">
                        {formatMonedaAR(v.Monto_Neto_Financiado)}
                      </span>
                      <span className="text-[10px] text-slate-400">{v.Cuotas} cta(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL ESCÁNER DE CÁMARA (MODO B) */}
      <QRCameraScannerModal
        isOpen={modalScannerSocio}
        title="Escáner QR • Credencial del Socio"
        subtitle="Apunte la cámara a la credencial digital exhibida por el cliente"
        expectedType="SOCIO"
        onScanSuccess={handleScanSocioCamara}
        onClose={() => setModalScannerSocio(false)}
      />

      {/* MODAL ADELANTO DE LIQUIDACIONES */}
      {modalAdelanto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setModalAdelanto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {adelantoExitoso ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-white">¡Adelanto Aprobado con Éxito!</h4>
                <p className="text-xs text-emerald-300 font-mono mt-1">
                  Transferencia cursada a su CBU en Banco de Entre Ríos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmarAdelantoSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Solicitud de Adelanto en 24hs</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Monto a Adelantar ($)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    max={comercio.Saldo_Ventas_Pendientes || 1000000}
                    value={montoAdelantoSolicitar}
                    onChange={(e) => setMontoAdelantoSolicitar(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base font-mono font-extrabold text-white"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Saldo disponible para adelantar: {formatMonedaAR(comercio.Saldo_Ventas_Pendientes || 640000)}
                  </span>
                </div>

                <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/20 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Tasa de Descuento:</span>
                    <span className="font-bold text-purple-300">{comercio.Tasa_Descuento_Adelanto_Pct || 3.0}%</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-purple-500/20">
                    <span>Neto a Acreditar en CBU:</span>
                    <span className="font-mono text-emerald-400">
                      {formatMonedaAR(montoAdelantoSolicitar - Math.round(montoAdelantoSolicitar * ((comercio.Tasa_Descuento_Adelanto_Pct || 3.0) / 100)))}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md"
                >
                  Confirmar Transferencia Inmediata
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
