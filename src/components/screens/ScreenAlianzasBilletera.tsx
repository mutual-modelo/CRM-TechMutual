import React from 'react';
import {
  ComercioAlianzaB2B,
  PromocionPoolReintegro,
  FidelidadSellosSocio,
  TransaccionBilletera,
  AdelantoLiquidacionComercio,
  SocioPadron,
  OperadorMutual,
  RubroComercioB2B
} from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  Store,
  Wallet,
  Tag,
  Award,
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Send,
  ArrowRight,
  TrendingUp,
  Percent,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Users,
  CreditCard,
  Building,
  Check,
  RefreshCw,
  Gift,
  Coins,
  ChevronRight,
  Calendar,
  XCircle,
  FileText,
  DollarSign,
  Smartphone,
  Copy
} from 'lucide-react';

interface ScreenAlianzasBilleteraProps {
  comercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  fidelidadSellos: FidelidadSellosSocio[];
  transacciones: TransaccionBilletera[];
  adelantos: AdelantoLiquidacionComercio[];
  socios: SocioPadron[];
  socioActivo: SocioPadron | null;
  operadorActivo: OperadorMutual;
  onGuardarComercio: (comercio: Partial<ComercioAlianzaB2B>) => void;
  onEditarComercio: (comercio: ComercioAlianzaB2B) => void;
  onCrearPromo: (promo: Partial<PromocionPoolReintegro>) => void;
  onNuevaTransaccion: (tx: Partial<TransaccionBilletera>) => void;
  onDesconocerTransaccion: (idTx: string, motivo: string) => void;
  onSolicitarAdelanto: (adelanto: Partial<AdelantoLiquidacionComercio>) => void;
  onActualizarSellos: (dni: string, sellosSumar: number, motivo: string) => void;
  onSeleccionarSocio: (socio: SocioPadron) => void;
}

export const ScreenAlianzasBilletera: React.FC<ScreenAlianzasBilleteraProps> = ({
  comercios,
  promociones,
  fidelidadSellos,
  transacciones,
  adelantos,
  socios,
  socioActivo,
  operadorActivo,
  onGuardarComercio,
  onEditarComercio,
  onCrearPromo,
  onNuevaTransaccion,
  onDesconocerTransaccion,
  onSolicitarAdelanto,
  onActualizarSellos,
  onSeleccionarSocio
}) => {
  const [tabSub, setTabSub] = React.useState<'comercios' | 'billeteras' | 'promociones' | 'fidelidad' | 'transacciones'>('comercios');

  // Estado para filtros de comercio
  const [rubroFiltro, setRubroFiltro] = React.useState<string>('TODOS');
  const [busquedaComercio, setBusquedaComercio] = React.useState<string>('');

  // Modales
  const [modalNuevoComercio, setModalNuevoComercio] = React.useState(false);
  const [comercioEditando, setComercioEditando] = React.useState<ComercioAlianzaB2B | null>(null);

  const [modalCobroAsistido, setModalCobroAsistido] = React.useState(false);
  const [comercioSeleccionadoCobro, setComercioSeleccionadoCobro] = React.useState<ComercioAlianzaB2B | null>(null);

  const [modalAdelanto, setModalAdelanto] = React.useState(false);
  const [comercioParaAdelanto, setComercioParaAdelanto] = React.useState<ComercioAlianzaB2B | null>(null);

  const [modalNuevaPromo, setModalNuevaPromo] = React.useState(false);

  const [modalDesconocerTx, setModalDesconocerTx] = React.useState<TransaccionBilletera | null>(null);
  const [motivoDesconocimiento, setMotivoDesconocimiento] = React.useState('');

  const [modalQrVidriera, setModalQrVidriera] = React.useState<PromocionPoolReintegro | null>(null);

  // Formulario Nuevo Comercio
  const [formComercio, setFormComercio] = React.useState<{
    nombre: string;
    razonSocial: string;
    rubro: RubroComercioB2B;
    cuit: string;
    direccion: string;
    localidad: string;
    telefono: string;
    email: string;
    arancel: number;
    planesCuotas: number[];
    aceptaCtaCte: 'SI' | 'NO';
    permiteAdelanto: 'SI' | 'NO';
    tasaAdelanto: number;
    pin: string;
  }>({
    nombre: '',
    razonSocial: '',
    rubro: 'Farmacia',
    cuit: '',
    direccion: '',
    localidad: 'Paraná',
    telefono: '',
    email: '',
    arancel: 3.0,
    planesCuotas: [1, 3, 6],
    aceptaCtaCte: 'SI',
    permiteAdelanto: 'SI',
    tasaAdelanto: 3.0,
    pin: '1234'
  });

  // Formulario Cobro Asistido en Mostrador
  const [cobroDniSocio, setCobroDniSocio] = React.useState('');
  const [cobroMonto, setCobroMonto] = React.useState<number>(15000);
  const [cobroCuotas, setCobroCuotas] = React.useState<number>(1);
  const [cobroBilletera, setCobroBilletera] = React.useState<'Disponible 1 - Cuenta Corriente' | 'Disponible 2 - Consumo Específico B2B' | 'Disponible 3 - Ayuda Libre'>('Disponible 1 - Cuenta Corriente');
  const [cobroMensajeEnviado, setCobroMensajeEnviado] = React.useState(false);

  // Formulario Adelanto Liquidación
  const [adelantoMonto, setAdelantoMonto] = React.useState<number>(100000);
  const [adelantoCbu, setAdelantoCbu] = React.useState('');

  // Formulario Nueva Promo
  const [formPromo, setFormPromo] = React.useState<{
    idComercio: string;
    titulo: string;
    pctDescuento: number;
    topeMensual: number;
    presupuestoTotal: number;
    diasSemana: string[];
    fechaFin: string;
    cupos: number;
  }>({
    idComercio: comercios[0]?.ID_Comercio || '',
    titulo: '',
    pctDescuento: 20,
    topeMensual: 15000,
    presupuestoTotal: 1000000,
    diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
    fechaFin: '2026-12-31',
    cupos: 200
  });

  // Selector de socio activo para la consola de billeteras
  const socio = socioActivo || socios[0] || null;

  // Fidelidad del socio actual
  const fidelidadSocioActual = React.useMemo(() => {
    if (!socio) return null;
    return fidelidadSellos.find((f) => f.DNI_Socio === socio.DNI) || {
      ID_Registro: `FID-${socio.DNI.slice(-4)}`,
      DNI_Socio: socio.DNI,
      Apellido_Nombre: socio.Apellido_Nombre,
      Sellos_Acumulados: 0,
      Ciclos_Completados: 0,
      Puntos_Totales: 0,
      Vouchers_Emitidos_JSON: '[]',
      Ultima_Actualizacion: new Date().toISOString().slice(0, 10),
      Historial_Sellos_JSON: '[]'
    };
  }, [socio, fidelidadSellos]);

  // Vouchers del socio
  const vouchersSocio: any[] = React.useMemo(() => {
    if (!fidelidadSocioActual?.Vouchers_Emitidos_JSON) return [];
    try {
      return JSON.parse(fidelidadSocioActual.Vouchers_Emitidos_JSON);
    } catch {
      return [];
    }
  }, [fidelidadSocioActual]);

  // QR rotativo dinámico simulado con expiración de 60 segundos
  const [tokenRotativo, setTokenRotativo] = React.useState<{ token: string; segundos: number }>({
    token: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
    segundos: 60
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTokenRotativo((prev) => {
        if (prev.segundos <= 1) {
          return {
            token: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
            segundos: 60
          };
        }
        return { ...prev, segundos: prev.segundos - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Comercios filtrados
  const comerciosFiltrados = React.useMemo(() => {
    return comercios.filter((c) => {
      if (rubroFiltro !== 'TODOS' && c.Rubro !== rubroFiltro) return false;
      if (busquedaComercio.trim()) {
        const q = busquedaComercio.toLowerCase();
        return (
          c.Nombre_Fantasia.toLowerCase().includes(q) ||
          c.Razon_Social.toLowerCase().includes(q) ||
          c.Localidad.toLowerCase().includes(q) ||
          c.CUIT_Responsable.includes(q)
        );
      }
      return true;
    });
  }, [comercios, rubroFiltro, busquedaComercio]);

  // Manejador apertura nuevo comercio
  const handleAbrirNuevoComercio = () => {
    setComercioEditando(null);
    setFormComercio({
      nombre: '',
      razonSocial: '',
      rubro: 'Farmacia',
      cuit: '',
      direccion: '',
      localidad: 'Paraná',
      telefono: '',
      email: '',
      arancel: 3.0,
      planesCuotas: [1, 3, 6],
      aceptaCtaCte: 'SI',
      permiteAdelanto: 'SI',
      tasaAdelanto: 3.0,
      pin: String(Math.floor(1000 + Math.random() * 9000))
    });
    setModalNuevoComercio(true);
  };

  const handleGuardarComercioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComercio.nombre.trim() || !formComercio.cuit.trim()) {
      alert('Por favor complete Nombre de Fantasía y CUIT.');
      return;
    }

    if (comercioEditando) {
      onEditarComercio({
        ...comercioEditando,
        Nombre_Fantasia: formComercio.nombre,
        Razon_Social: formComercio.razonSocial || formComercio.nombre,
        Rubro: formComercio.rubro,
        CUIT_Responsable: formComercio.cuit,
        Direccion: formComercio.direccion,
        Localidad: formComercio.localidad,
        Telefono_WhatsApp: formComercio.telefono,
        Email: formComercio.email,
        Arancel_Mutual_Pct: Number(formComercio.arancel),
        Planes_Cuotas_JSON: JSON.stringify(formComercio.planesCuotas),
        Acepta_Cuenta_Corriente: formComercio.aceptaCtaCte,
        Permite_Adelanto_Liquidacion: formComercio.permiteAdelanto,
        Tasa_Descuento_Adelanto_Pct: Number(formComercio.tasaAdelanto),
        PIN_Token_Acceso: formComercio.pin
      });
    } else {
      const nuevo: Partial<ComercioAlianzaB2B> = {
        ID_Comercio: `COM-B2B-${Math.floor(100 + Math.random() * 900)}`,
        Nombre_Fantasia: formComercio.nombre,
        Razon_Social: formComercio.razonSocial || formComercio.nombre,
        Rubro: formComercio.rubro,
        CUIT_Responsable: formComercio.cuit,
        Direccion: formComercio.direccion,
        Localidad: formComercio.localidad,
        Telefono_WhatsApp: formComercio.telefono,
        Email: formComercio.email,
        Arancel_Mutual_Pct: Number(formComercio.arancel),
        Planes_Cuotas_JSON: JSON.stringify(formComercio.planesCuotas),
        Acepta_Cuenta_Corriente: formComercio.aceptaCtaCte,
        Permite_Adelanto_Liquidacion: formComercio.permiteAdelanto,
        Tasa_Descuento_Adelanto_Pct: Number(formComercio.tasaAdelanto),
        PIN_Token_Acceso: formComercio.pin,
        Estado: 'Activo',
        Saldo_Ventas_Pendientes: 0,
        Total_Facturado_Historico: 0,
        Fecha_Alta: new Date().toISOString().slice(0, 10),
        Observaciones: 'Comercio adherido al Ecosistema Alianzas B2B'
      };
      onGuardarComercio(nuevo);
    }
    setModalNuevoComercio(false);
  };

  // Ejecutar Cobro Asistido
  const handleConfirmarCobroAsistido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioSeleccionadoCobro) return;

    const socioEncontrado = socios.find((s) => s.DNI === cobroDniSocio.trim());
    if (!socioEncontrado) {
      alert(`No se encontró ningún socio activo con DNI ${cobroDniSocio}. Verifique el padrón.`);
      return;
    }

    const tokenGen = `WSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const promoAplicable = promociones.find(
      (p) => p.ID_Comercio === comercioSeleccionadoCobro.ID_Comercio && p.Estado === 'Vigente'
    );

    let reintegro = 0;
    if (promoAplicable) {
      const calculo = Math.round(cobroMonto * (promoAplicable.Pct_Descuento / 100));
      reintegro = Math.min(calculo, promoAplicable.Tope_Mensual_Socio);
    }
    const netoFinanciado = cobroMonto - reintegro;
    const valorCuota = Math.round(netoFinanciado / (cobroCuotas || 1));

    const nuevaTx: Partial<TransaccionBilletera> = {
      ID_Transaccion: `TX-BIL-${Date.now().toString().slice(-5)}`,
      Fecha_Hora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI_Socio: socioEncontrado.DNI,
      Apellido_Nombre_Socio: socioEncontrado.Apellido_Nombre,
      ID_Comercio: comercioSeleccionadoCobro.ID_Comercio,
      Nombre_Comercio: comercioSeleccionadoCobro.Nombre_Fantasia,
      Rubro: comercioSeleccionadoCobro.Rubro,
      Billetera_Utilizada: cobroBilletera,
      Monto_Total_Compra: Number(cobroMonto),
      Monto_Reintegro_Aplicado: reintegro,
      Monto_Neto_Financiado: netoFinanciado,
      Cuotas: Number(cobroCuotas) || 1,
      Monto_Cuota: valorCuota,
      Metodo_Autorizacion: 'Cobro Asistido Mostrador (WhatsApp)',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: tokenGen,
      Liquidado_Al_Comercio: 'NO',
      ID_Promo_Aplicada: promoAplicable ? promoAplicable.ID_Promo : undefined
    };

    onNuevaTransaccion(nuevaTx);

    // Sumar 1 sello si la compra fue mayor a $10.000
    if (cobroMonto >= 10000) {
      onActualizarSellos(socioEncontrado.DNI, 1, `Compra asistida en ${comercioSeleccionadoCobro.Nombre_Fantasia}`);
    }

    setCobroMensajeEnviado(true);
    setTimeout(() => {
      setCobroMensajeEnviado(false);
      setModalCobroAsistido(false);
      setCobroDniSocio('');
    }, 2500);
  };

  // Ejecutar Adelanto Liquidación
  const handleConfirmarAdelanto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioParaAdelanto) return;

    const tasa = comercioParaAdelanto.Tasa_Descuento_Adelanto_Pct || 3.0;
    const descuento = Math.round(adelantoMonto * (tasa / 100));
    const neto = adelantoMonto - descuento;

    onSolicitarAdelanto({
      ID_Adelanto: `ADL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      Fecha_Solicitud: new Date().toISOString().slice(0, 10),
      ID_Comercio: comercioParaAdelanto.ID_Comercio,
      Nombre_Comercio: comercioParaAdelanto.Nombre_Fantasia,
      Monto_Ventas_Adelantadas: Number(adelantoMonto),
      Tasa_Descuento_Pct: tasa,
      Monto_Descuento_Financiero: descuento,
      Neto_Transferido: neto,
      CBU_Destino: adelantoCbu || '0860002101800019284102',
      Estado: 'Liquidado',
      Operador: operadorActivo
    });

    setModalAdelanto(false);
  };

  // Guardar Nueva Promo
  const handleGuardarPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const com = comercios.find((c) => c.ID_Comercio === formPromo.idComercio);
    if (!com || !formPromo.titulo.trim()) {
      alert('Seleccione un comercio e indique el título de la promoción.');
      return;
    }

    onCrearPromo({
      ID_Promo: `PRM-${Math.floor(100 + Math.random() * 900)}`,
      ID_Comercio: com.ID_Comercio,
      Nombre_Comercio: com.Nombre_Fantasia,
      Rubro: com.Rubro,
      Titulo: formPromo.titulo,
      Pct_Descuento: Number(formPromo.pctDescuento),
      Tope_Mensual_Socio: Number(formPromo.topeMensual),
      Presupuesto_Pool_Total: Number(formPromo.presupuestoTotal),
      Presupuesto_Consumido: 0,
      Dias_Semana_JSON: JSON.stringify(formPromo.diasSemana),
      Fecha_Inicio: new Date().toISOString().slice(0, 10),
      Fecha_Fin: formPromo.fechaFin,
      Estado: 'Vigente',
      Codigo_QR_Vidriera: `QR-PROMO-${com.Rubro.toUpperCase().slice(0, 4)}-${Math.floor(10 + Math.random() * 90)}`,
      Cupos_Totales: Number(formPromo.cupos) || 100,
      Cupos_Utilizados: 0
    });

    setModalNuevaPromo(false);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado y Navegación de Sub-Módulo Alianzas & Billetera */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#135596] to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  MÓDULO 07 • ENTERPRISE V3.0
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Red de Comercios Adheridos Activa
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Ecosistema Alianzas B2B & Billetera Virtual Mutual
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAbrirNuevoComercio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Comercio Aliado</span>
            </button>
            <button
              onClick={() => setModalNuevaPromo(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>+ Crear Promo Pool</span>
            </button>
          </div>
        </div>

        {/* 5 Pestañas de Control Operativo */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pt-1">
          <button
            onClick={() => setTabSub('comercios')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
              tabSub === 'comercios'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Store className="w-4 h-4 text-blue-600" />
            <span>01. Padrón Comercios & Alianzas ({comercios.length})</span>
          </button>

          <button
            onClick={() => setTabSub('billeteras')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
              tabSub === 'billeteras'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>02. Consola Billeteras del Socio</span>
          </button>

          <button
            onClick={() => setTabSub('promociones')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
              tabSub === 'promociones'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>03. Promociones & Pool Reintegros ({promociones.length})</span>
          </button>

          <button
            onClick={() => setTabSub('fidelidad')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
              tabSub === 'fidelidad'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>04. Club Fidelidad (10 Sellos)</span>
          </button>

          <button
            onClick={() => setTabSub('transacciones')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
              tabSub === 'transacciones'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4 text-purple-600" />
            <span>05. Transacciones & Conciliación ({transacciones.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA 1: PADRÓN DE COMERCIOS ADHERIDOS & ALIANZAS B2B */}
      {/* ============================================================== */}
      {tabSub === 'comercios' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busquedaComercio}
                onChange={(e) => setBusquedaComercio(e.target.value)}
                placeholder="Buscar por comercio, CUIT, rubro o localidad de Entre Ríos..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filtrar Rubro:</span>
              <select
                value={rubroFiltro}
                onChange={(e) => setRubroFiltro(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              >
                <option value="TODOS">Todos los Rubros ({comercios.length})</option>
                <option value="Farmacia">Farmacia</option>
                <option value="Proveeduría">Proveeduría</option>
                <option value="Motos & Movilidad">Motos & Movilidad</option>
                <option value="Náutica & Pesca">Náutica & Pesca</option>
                <option value="Turismo & Hotelería">Turismo & Hotelería</option>
                <option value="Óptica">Óptica</option>
                <option value="Odontología">Odontología</option>
                <option value="Electro & Hogar">Electro & Hogar</option>
              </select>
            </div>
          </div>

          {/* Grilla de Comercios Adheridos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {comerciosFiltrados.map((com) => {
              let planesArray: number[] = [];
              try {
                planesArray = JSON.parse(com.Planes_Cuotas_JSON);
              } catch {
                planesArray = [1, 3];
              }

              return (
                <div
                  key={com.ID_Comercio}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                          {com.ID_Comercio} • PIN: {com.PIN_Token_Acceso}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 mt-0.5 leading-snug">
                          {com.Nombre_Fantasia}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                        {com.Rubro}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5 font-medium">
                      <div>CUIT: <strong className="text-slate-700 font-mono">{com.CUIT_Responsable}</strong></div>
                      <div>{com.Direccion}, {com.Localidad}</div>
                      <div>WhatsApp: {com.Telefono_WhatsApp}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Arancel Mutual:</span>
                        <strong className="text-slate-800">{com.Arancel_Mutual_Pct}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cuotas Habilitadas:</span>
                        <strong className="text-slate-800">{planesArray.join(', ')} cuotas</strong>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between">
                        <span className="text-slate-500">Ventas Pendientes Liq:</span>
                        <strong className="text-emerald-700 font-bold">{formatMonedaAR(com.Saldo_Ventas_Pendientes)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Mostrador y Adelanto */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setComercioSeleccionadoCobro(com);
                        setModalCobroAsistido(true);
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Cobro Mostrador</span>
                    </button>

                    <button
                      onClick={() => {
                        setComercioParaAdelanto(com);
                        setAdelantoMonto(com.Saldo_Ventas_Pendientes || 100000);
                        setModalAdelanto(true);
                      }}
                      className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Solicitar adelanto financiero de liquidación"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                      <span>Adelanto</span>
                    </button>

                    <button
                      onClick={() => {
                        setComercioEditando(com);
                        setFormComercio({
                          nombre: com.Nombre_Fantasia,
                          razonSocial: com.Razon_Social,
                          rubro: com.Rubro,
                          cuit: com.CUIT_Responsable,
                          direccion: com.Direccion,
                          localidad: com.Localidad,
                          telefono: com.Telefono_WhatsApp,
                          email: com.Email,
                          arancel: com.Arancel_Mutual_Pct,
                          planesCuotas: planesArray,
                          aceptaCtaCte: com.Acepta_Cuenta_Corriente,
                          permiteAdelanto: com.Permite_Adelanto_Liquidacion,
                          tasaAdelanto: com.Tasa_Descuento_Adelanto_Pct,
                          pin: com.PIN_Token_Acceso
                        });
                        setModalNuevoComercio(true);
                      }}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Modificar configuración de comercio"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: CONSOLA DE DISPONIBLES Y BILLETERAS DEL SOCIO */}
      {/* ============================================================== */}
      {tabSub === 'billeteras' && socio && (
        <div className="space-y-4">
          {/* Selector de Socio para Visualizar sus 3 Billeteras */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm">
                {socio.Apellido_Nombre.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Socio Activo Seleccionado
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {socio.Apellido_Nombre} (DNI {socio.DNI} • {socio.Nro_Socio})
                </h3>
                <span className="text-xs text-slate-500">
                  {socio.Organismo} • Sueldo Neto: {formatMonedaAR(socio.Sueldo_Neto)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={socio.DNI}
                onChange={(e) => {
                  const s = socios.find((x) => x.DNI === e.target.value);
                  if (s) onSeleccionarSocio(s);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800"
              >
                {socios.map((s) => (
                  <option key={s.DNI} value={s.DNI}>
                    {s.Apellido_Nombre} (DNI {s.DNI})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Las 3 Billeteras Parametrizadas del Socio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Billetera 1 */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase block">
                    Billetera 1 • Consumo Diario
                  </span>
                  <h4 className="font-extrabold text-sm text-white mt-0.5">
                    Cuenta Corriente Farmacia / Óptica
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-800/80 text-emerald-100 border border-emerald-600">
                  1 a 3 Cuotas
                </span>
              </div>

              <div>
                <span className="text-[11px] text-emerald-200 block">Disponible Preaprobado:</span>
                <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {formatMonedaAR(socio.Margen_Cuota_Disponible * 1.5)}
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span>Tope por Compra:</span>
                  <strong className="text-white">{formatMonedaAR(socio.Margen_Cuota_Disponible)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Descuento por Planilla:</span>
                  <strong className="text-emerald-300">Automático</strong>
                </div>
              </div>
            </div>

            {/* Billetera 2 */}
            <div className="bg-gradient-to-br from-[#0e3b68] to-slate-950 text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-blue-300 uppercase block">
                    Billetera 2 • Consumo B2B
                  </span>
                  <h4 className="font-extrabold text-sm text-white mt-0.5">
                    Financiación Motos / Electro / Hogar
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-800/80 text-blue-100 border border-blue-600">
                  6 a 24 Cuotas
                </span>
              </div>

              <div>
                <span className="text-[11px] text-blue-200 block">Disponible Preaprobado:</span>
                <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {formatMonedaAR(socio.Monto_Preaprobado * 1.2)}
                </div>
              </div>

              <div className="pt-2 border-t border-blue-800/60 text-[11px] text-blue-200 space-y-1">
                <div className="flex justify-between">
                  <span>Tasa Bonificada B2B:</span>
                  <strong className="text-white">TNA 48.0%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Autorización:</span>
                  <strong className="text-blue-300">QR / Token Mostrador</strong>
                </div>
              </div>
            </div>

            {/* Billetera 3 */}
            <div className="bg-gradient-to-br from-purple-900 to-slate-950 text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-purple-300 uppercase block">
                    Billetera 3 • Ayuda Libre
                  </span>
                  <h4 className="font-extrabold text-sm text-white mt-0.5">
                    Depósito Directo en CBU Bancario
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-800/80 text-purple-100 border border-purple-600">
                  Transferencia
                </span>
              </div>

              <div>
                <span className="text-[11px] text-purple-200 block">Disponible Preaprobado:</span>
                <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {formatMonedaAR(socio.Monto_Preaprobado)}
                </div>
              </div>

              <div className="pt-2 border-t border-purple-800/60 text-[11px] text-purple-200 space-y-1">
                <div className="flex justify-between">
                  <span>CBU Registrado:</span>
                  <strong className="text-white truncate max-w-[130px]">{socio.CBU_Alias || 'BERSA'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Acreditación:</span>
                  <strong className="text-purple-300">Inmediata 24hs</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Credencial Digital Dinámica con QR Rotativo & Botón Desconocer Consumo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  Credencial Digital Dinámica
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  Expira en {tokenRotativo.segundos}s
                </span>
              </div>

              {/* QR Rotativo Visual */}
              <div className="p-3 bg-white border-2 border-dashed border-purple-300 rounded-2xl shadow-inner my-1">
                <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white space-y-1">
                  <QrCode className="w-16 h-16 text-purple-300" />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold">
                    {tokenRotativo.token}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-snug">
                El socio presenta este código rotativo en el mostrador del comercio para validar identidad y debitar sin tarjeta plástica.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Consumos Recientes de la Billetera & Protección Antifraude
                </h4>
                <span className="text-[10px] text-slate-400">Trazabilidad en tiempo real</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5">ID / Fecha</th>
                      <th className="py-2 px-2.5">Comercio</th>
                      <th className="py-2 px-2.5">Billetera</th>
                      <th className="py-2 px-2.5 text-right">Monto</th>
                      <th className="py-2 px-2.5 text-center">Estado</th>
                      <th className="py-2 px-2.5 text-center">Seguridad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transacciones
                      .filter((t) => t.DNI_Socio === socio.DNI)
                      .map((tx) => (
                        <tr key={tx.ID_Transaccion} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-mono text-[11px]">
                            <div className="font-bold text-slate-800">{tx.ID_Transaccion}</div>
                            <div className="text-[10px] text-slate-400">{tx.Fecha_Hora}</div>
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="font-semibold text-slate-900">{tx.Nombre_Comercio}</div>
                            <span className="text-[10px] text-slate-500">{tx.Rubro}</span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                            {tx.Billetera_Utilizada.replace('Disponible ', 'B')}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            {formatMonedaAR(tx.Monto_Total_Compra)}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.Estado_Transaccion === 'Aprobada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.Estado_Transaccion === 'Desconocida por Socio'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {tx.Estado_Transaccion}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            {tx.Estado_Transaccion === 'Aprobada' ? (
                              <button
                                onClick={() => {
                                  setModalDesconocerTx(tx);
                                  setMotivoDesconocimiento('No reconozco la compra / Posible clonación de token');
                                }}
                                className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition cursor-pointer"
                              >
                                Desconocer
                              </button>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-semibold italic">En investigación</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: MOTOR PARAMÉTRICO DE PROMOCIONES & REINTEGROS */}
      {/* ============================================================== */}
      {tabSub === 'promociones' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider text-purple-300 uppercase">
                MOTOR PARAMÉTRICO CON REGLA TRIPLE TOPE
              </span>
              <h3 className="text-base font-extrabold mt-0.5">
                Pool Global de Reintegros y Campañas Financiadas
              </h3>
              <p className="text-xs text-purple-200 max-w-2xl leading-relaxed mt-1">
                Fórmula de protección financiera: <strong>% Reintegro × Tope Mensual por Socio × Presupuesto del Pool</strong>.
                Evita desfasajes de tesorería y distribuye automáticamente el beneficio entre los asociados.
              </p>
            </div>
            <button
              onClick={() => setModalNuevaPromo(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Campaña</span>
            </button>
          </div>

          {/* Listado de Campañas Activas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {promociones.map((p) => {
              let dias: string[] = [];
              try {
                dias = JSON.parse(p.Dias_Semana_JSON);
              } catch {
                dias = ['Todos los días'];
              }

              const porcentajeConsumo = Math.round((p.Presupuesto_Consumido / p.Presupuesto_Pool_Total) * 100);

              return (
                <div
                  key={p.ID_Promo}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.Pct_Descuento}% REINTEGRO
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Hasta: {p.Fecha_Fin}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {p.Titulo}
                    </h4>

                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>{p.Nombre_Comercio} ({p.Rubro})</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tope Mensual / Socio:</span>
                        <strong className="text-slate-800">{formatMonedaAR(p.Tope_Mensual_Socio)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Días Habilitados:</span>
                        <strong className="text-purple-700 font-sans font-bold">{dias.join(', ')}</strong>
                      </div>
                    </div>

                    {/* Barra de progreso de Pool */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Pool Consumido: {porcentajeConsumo}%</span>
                        <span className="font-bold text-slate-800">
                          {formatMonedaAR(p.Presupuesto_Consumido)} / {formatMonedaAR(p.Presupuesto_Pool_Total)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            porcentajeConsumo > 85 ? 'bg-rose-500' : porcentajeConsumo > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, porcentajeConsumo)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setModalQrVidriera(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition border border-indigo-200 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Mostrador Vidriera</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">
                      Cupos: {p.Cupos_Utilizados}/{p.Cupos_Totales}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 4: CLUB DE FIDELIDAD & GAMIFICACIÓN (10 SELLOS) */}
      {/* ============================================================== */}
      {tabSub === 'fidelidad' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Tarjeta Virtual de 10 Sellos & Fidelización
                  </h3>
                  <p className="text-xs text-slate-500">
                    Socio Activo: <strong>{socio?.Apellido_Nombre}</strong> (DNI {socio?.DNI}) • Ciclos Completados: <strong>{fidelidadSocioActual?.Ciclos_Completados || 0}</strong>
                  </p>
                </div>
              </div>

              {/* Botones de Otorgamiento Inmediato de Sellos */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (socio) onActualizarSellos(socio.DNI, 1, 'Cuota Social abonada en término');
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+1 Sello Cuota al Día</span>
                </button>
                <button
                  onClick={() => {
                    if (socio) onActualizarSellos(socio.DNI, 1, 'Compra en Farmacia/Proveeduría');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+1 Sello Compra Comercio</span>
                </button>
              </div>
            </div>

            {/* TABLERO DE LOS 10 SELLOS VIRTUALES */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 rounded-2xl text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Programa "Socio Modelo Cumplidor"
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Puntos Acumulados: <strong className="text-amber-400 text-sm">{fidelidadSocioActual?.Puntos_Totales || 0} pts</strong>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 my-2">
                {Array.from({ length: 10 }).map((_, index) => {
                  const numSello = index + 1;
                  const sellosActuales = fidelidadSocioActual?.Sellos_Acumulados || 0;
                  const sellado = numSello <= sellosActuales;

                  return (
                    <div
                      key={numSello}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                        sellado
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md scale-105'
                          : 'bg-slate-800/40 border-slate-700 text-slate-600'
                      }`}
                    >
                      {sellado ? (
                        <>
                          <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                          <span className="text-[10px] font-black font-mono mt-1 text-white">#{numSello}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-black font-mono text-slate-500">#{numSello}</span>
                          <span className="text-[8px] font-bold uppercase text-slate-600 mt-1">Pendiente</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
                <span>
                  Progreso actual: <strong>{fidelidadSocioActual?.Sellos_Acumulados || 0} de 10 sellos</strong>
                </span>
                <span className="text-amber-300 font-semibold">
                  Al completar los 10 sellos se emite automáticamente un <strong>Voucher de $15.000</strong>
                </span>
              </div>
            </div>

            {/* Vouchers Emitidos y Catálogo de Recompensas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  Vouchers Emitidos para el Socio ({vouchersSocio.length})
                </h4>

                {vouchersSocio.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 text-center">
                    Aún no tiene vouchers emitidos. Complete la tarjeta de 10 sellos para liberar su primer premio.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vouchersSocio.map((v) => (
                      <div
                        key={v.id}
                        className="bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-purple-950">{v.titulo}</div>
                          <span className="text-[10px] text-purple-700 font-mono">Vence: {v.vencimiento}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-sm font-mono text-purple-900">{formatMonedaAR(v.monto)}</strong>
                          <div className="text-[9px] font-bold text-emerald-700 uppercase">{v.estado}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  Triggers Automáticos de Fidelización
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">🎁 Premio de Cumpleaños</div>
                      <span className="text-[11px] text-slate-500">Voucher 20% en Óptica / Farmacia</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Activo</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">🚀 Bono Bienvenida / Onboarding</div>
                      <span className="text-[11px] text-slate-500">+2 Sellos iniciales de cortesía</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Activo</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">🤝 Programa Referidos (Colegas)</div>
                      <span className="text-[11px] text-slate-500">$5.000 en Billetera por cada nuevo socio</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 5: TRANSACCIONES & CONCILIACIÓN DE COMERCIOS */}
      {/* ============================================================== */}
      {tabSub === 'transacciones' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Historial de Operaciones Billetera & Conciliación B2B
                </h3>
                <p className="text-xs text-slate-500">
                  Registro auditado de ventas con QR dinámico, cobro asistido y liquidación a comercios.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Total Transacciones:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                  {transacciones.length} ops
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">ID / Fecha</th>
                    <th className="py-2.5 px-3">Socio (DNI)</th>
                    <th className="py-2.5 px-3">Comercio</th>
                    <th className="py-2.5 px-3">Método / Token</th>
                    <th className="py-2.5 px-3 text-right">Monto Bruto</th>
                    <th className="py-2.5 px-3 text-right">Reintegro</th>
                    <th className="py-2.5 px-3 text-right">Neto Financiado</th>
                    <th className="py-2.5 px-3 text-center">Plan</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transacciones.map((tx) => (
                    <tr key={tx.ID_Transaccion} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{tx.ID_Transaccion}</div>
                        <div className="text-[10px] text-slate-400">{tx.Fecha_Hora}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{tx.Apellido_Nombre_Socio}</div>
                        <span className="text-[10px] text-slate-500 font-mono">DNI {tx.DNI_Socio}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{tx.Nombre_Comercio}</div>
                        <span className="text-[10px] text-slate-500">{tx.Rubro}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <div>{tx.Metodo_Autorizacion}</div>
                        <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1 rounded">
                          {tx.Token_Autorizacion}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatMonedaAR(tx.Monto_Total_Compra)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        -{formatMonedaAR(tx.Monto_Reintegro_Aplicado)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        {formatMonedaAR(tx.Monto_Neto_Financiado)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                        {tx.Cuotas} cuota{tx.Cuotas > 1 ? 's' : ''}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.Estado_Transaccion === 'Aprobada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.Estado_Transaccion === 'Desconocida por Socio'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.Estado_Transaccion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ALTA Y EDICIÓN DE COMERCIO ALIADO B2B */}
      {/* ============================================================== */}
      {modalNuevoComercio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {comercioEditando ? 'Modificar Comercio Aliado' : 'Registrar Nuevo Comercio Aliado B2B'}
              </h3>
              <button
                onClick={() => setModalNuevoComercio(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarComercioSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre de Fantasía:</label>
                  <input
                    type="text"
                    required
                    value={formComercio.nombre}
                    onChange={(e) => setFormComercio({ ...formComercio, nombre: e.target.value })}
                    placeholder="ej. Farmacia Modelo Central"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rubro Comercial:</label>
                  <select
                    value={formComercio.rubro}
                    onChange={(e) => setFormComercio({ ...formComercio, rubro: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Farmacia">Farmacia</option>
                    <option value="Proveeduría">Proveeduría</option>
                    <option value="Motos & Movilidad">Motos & Movilidad</option>
                    <option value="Náutica & Pesca">Náutica & Pesca</option>
                    <option value="Turismo & Hotelería">Turismo & Hotelería</option>
                    <option value="Óptica">Óptica</option>
                    <option value="Odontología">Odontología</option>
                    <option value="Electro & Hogar">Electro & Hogar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CUIT Comercial:</label>
                  <input
                    type="text"
                    required
                    value={formComercio.cuit}
                    onChange={(e) => setFormComercio({ ...formComercio, cuit: e.target.value })}
                    placeholder="30-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Localidad (Entre Ríos):</label>
                  <input
                    type="text"
                    value={formComercio.localidad}
                    onChange={(e) => setFormComercio({ ...formComercio, localidad: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dirección:</label>
                  <input
                    type="text"
                    value={formComercio.direccion}
                    onChange={(e) => setFormComercio({ ...formComercio, direccion: e.target.value })}
                    placeholder="Calle y N°"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp de Ventas:</label>
                  <input
                    type="text"
                    value={formComercio.telefono}
                    onChange={(e) => setFormComercio({ ...formComercio, telefono: e.target.value })}
                    placeholder="343..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arancel Mutual (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formComercio.arancel}
                    onChange={(e) => setFormComercio({ ...formComercio, arancel: Number(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Desc. Adelanto (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formComercio.tasaAdelanto}
                    onChange={(e) => setFormComercio({ ...formComercio, tasaAdelanto: Number(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PIN Acceso Mostrador:</label>
                  <input
                    type="text"
                    value={formComercio.pin}
                    onChange={(e) => setFormComercio({ ...formComercio, pin: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold text-purple-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoComercio(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {comercioEditando ? 'Guardar Cambios' : 'Registrar Comercio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: COBRO ASISTIDO EN MOSTRADOR (WHATSAPP LINK / QR) */}
      {/* ============================================================== */}
      {modalCobroAsistido && comercioSeleccionadoCobro && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  CONSOLA MOSTRADOR • {comercioSeleccionadoCobro.Nombre_Fantasia}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Cobro Asistido en Mostrador
                </h3>
              </div>
              <button
                onClick={() => setModalCobroAsistido(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cobroMensajeEnviado ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-950 text-sm">¡Operación Asistida Autorizada!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Se envió notificación por WhatsApp al socio con link para confirmación biométrica y firma del cupón digital.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmarCobroAsistido} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DNI del Socio:</label>
                  <input
                    type="text"
                    required
                    value={cobroDniSocio}
                    onChange={(e) => setCobroDniSocio(e.target.value)}
                    placeholder="ej. 24891024"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-base text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    El sistema valida instantáneamente el margen disponible del socio.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Monto de la Venta ($):</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={cobroMonto}
                      onChange={(e) => setCobroMonto(Number(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cantidad de Cuotas:</label>
                    <select
                      value={cobroCuotas}
                      onChange={(e) => setCobroCuotas(Number(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                    >
                      <option value={1}>1 Pago (Débito Planilla)</option>
                      <option value={2}>2 Cuotas</option>
                      <option value={3}>3 Cuotas</option>
                      <option value={6}>6 Cuotas</option>
                      <option value={12}>12 Cuotas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billetera de Afectación:</label>
                  <select
                    value={cobroBilletera}
                    onChange={(e) => setCobroBilletera(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Disponible 1 - Cuenta Corriente">Billetera 1 — Cuenta Corriente Diario</option>
                    <option value="Disponible 2 - Consumo Específico B2B">Billetera 2 — Consumo Específico B2B</option>
                    <option value="Disponible 3 - Ayuda Libre">Billetera 3 — Ayuda Económica Libre</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalCobroAsistido(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Autorización WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADELANTO DE LIQUIDACIÓN A COMERCIO */}
      {/* ============================================================== */}
      {modalAdelanto && comercioParaAdelanto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  LIQUIDACIÓN ANTICIPADA
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Adelanto Financiero de Ventas
                </h3>
                <p className="text-xs text-slate-500">{comercioParaAdelanto.Nombre_Fantasia}</p>
              </div>
              <button
                onClick={() => setModalAdelanto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarAdelanto} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-900">Ventas Acumuladas Pendientes:</span>
                  <strong className="text-slate-900 font-mono">{formatMonedaAR(comercioParaAdelanto.Saldo_Ventas_Pendientes)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-900">Tasa de Descuento Financiero:</span>
                  <strong className="text-amber-900 font-mono">{comercioParaAdelanto.Tasa_Descuento_Adelanto_Pct || 3.0}%</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto a Adelantar ($):</label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={comercioParaAdelanto.Saldo_Ventas_Pendientes * 1.5}
                  value={adelantoMonto}
                  onChange={(e) => setAdelantoMonto(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-base"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Descuento Financiero Mutual:</span>
                  <strong className="text-rose-700">
                    -{formatMonedaAR(Math.round(adelantoMonto * ((comercioParaAdelanto.Tasa_Descuento_Adelanto_Pct || 3.0) / 100)))}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-800 text-xs pt-1 border-t border-slate-200">
                  <span>Neto a Transferir al Comercio:</span>
                  <strong className="text-emerald-700 text-sm">
                    {formatMonedaAR(
                      adelantoMonto - Math.round(adelantoMonto * ((comercioParaAdelanto.Tasa_Descuento_Adelanto_Pct || 3.0) / 100))
                    )}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">CBU de Destino:</label>
                <input
                  type="text"
                  value={adelantoCbu}
                  onChange={(e) => setAdelantoCbu(e.target.value)}
                  placeholder="0860002101800019284102"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAdelanto(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirmar Adelanto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREAR PROMO POOL REINTEGROS */}
      {/* ============================================================== */}
      {modalNuevaPromo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Crear Campaña con Pool de Reintegro Global
              </h3>
              <button
                onClick={() => setModalNuevaPromo(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarPromoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Comercio Adherido:</label>
                <select
                  value={formPromo.idComercio}
                  onChange={(e) => setFormPromo({ ...formPromo, idComercio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {comercios.map((c) => (
                    <option key={c.ID_Comercio} value={c.ID_Comercio}>
                      {c.Nombre_Fantasia} ({c.Rubro})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título de la Promoción:</label>
                <input
                  type="text"
                  required
                  value={formPromo.titulo}
                  onChange={(e) => setFormPromo({ ...formPromo, titulo: e.target.value })}
                  placeholder="ej. 25% Reintegro en Farmacia Lunes y Miércoles"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">% de Reintegro / Descuento:</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="60"
                    value={formPromo.pctDescuento}
                    onChange={(e) => setFormPromo({ ...formPromo, pctDescuento: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tope Mensual por Socio ($):</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formPromo.topeMensual}
                    onChange={(e) => setFormPromo({ ...formPromo, topeMensual: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Presupuesto Pool Total ($):</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={formPromo.presupuestoTotal}
                    onChange={(e) => setFormPromo({ ...formPromo, presupuestoTotal: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha de Finalización:</label>
                  <input
                    type="date"
                    required
                    value={formPromo.fechaFin}
                    onChange={(e) => setFormPromo({ ...formPromo, fechaFin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevaPromo(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Publicar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DESCONOCER CONSUMO (AUDITORÍA ANTIFRAUDE) */}
      {/* ============================================================== */}
      {modalDesconocerTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Desconocer Operación Antifraude
                </h3>
              </div>
              <button
                onClick={() => setModalDesconocerTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-950">
                Operación {modalDesconocerTx.ID_Transaccion} en {modalDesconocerTx.Nombre_Comercio}
              </div>
              <div className="text-rose-800 font-mono">
                Monto: <strong>{formatMonedaAR(modalDesconocerTx.Monto_Total_Compra)}</strong> • Fecha: {modalDesconocerTx.Fecha_Hora}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Motivo del Desconocimiento / Denuncia:
              </label>
              <textarea
                value={motivoDesconocimiento}
                onChange={(e) => setMotivoDesconocimiento(e.target.value)}
                placeholder="Indique los motivos del socio para anular la transacción..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalDesconocerTx(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDesconocerTransaccion(modalDesconocerTx.ID_Transaccion, motivoDesconocimiento);
                  setModalDesconocerTx(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Bloquear y Abrir Sumario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: QR DE VIDRIERA QUE NO VENCE */}
      {/* ============================================================== */}
      {modalQrVidriera && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                VIDRIERA DIGITAL • {modalQrVidriera.Nombre_Comercio}
              </span>
              <button
                onClick={() => setModalQrVidriera(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 flex flex-col items-center">
              <QrCode className="w-32 h-32 text-purple-300" />
              <div className="font-mono text-xs font-bold text-emerald-400">
                {modalQrVidriera.Codigo_QR_Vidriera}
              </div>
              <span className="text-[10px] text-slate-400">
                "QR QUE NO VENCE" • Filtra automáticamente promociones del día
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-snug">
              Imprima este afiche para el mostrador. Al escanearlo, el socio visualiza en su celular el descuento del {modalQrVidriera.Pct_Descuento}% y su tope disponible.
            </p>

            <button
              onClick={() => {
                alert('🖨️ Enviando afiche con QR a la impresora...');
                setModalQrVidriera(null);
              }}
              className="w-full py-2 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Imprimir Afiche Mostrador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
