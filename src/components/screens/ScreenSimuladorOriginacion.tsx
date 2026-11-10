import React from 'react';
import { SocioPadron, AyudaEconomica, OperadorMutual } from '../../types/crm';
import {
  simularFEDEM,
  simularMunicipales,
  simularSidecreer,
  formatMonedaAR,
  formatNumero
} from '../../utils/financialCalculations';
import {
  Copy,
  Send,
  Eye,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  FileCheck,
  Percent,
  PlusCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ScreenSimuladorOriginacionProps {
  operadorActivo: OperadorMutual;
  socioPreseleccionado?: SocioPadron | null;
  socios: SocioPadron[];
  ayudas: AyudaEconomica[];
  onSeleccionarSocio?: (socio: SocioPadron) => void;
  onCrearAyudaConPlan: (
    linea: string,
    monto: number,
    cuotas: number,
    valorCuota: number,
    esRefi?: boolean,
    idsCancelados?: string[],
    montoRetenido?: number
  ) => void;
}

export const ScreenSimuladorOriginacion: React.FC<ScreenSimuladorOriginacionProps> = ({
  operadorActivo,
  socioPreseleccionado,
  socios,
  ayudas,
  onSeleccionarSocio,
  onCrearAyudaConPlan
}) => {
  // Estado de Vista: COMERCIAL vs ADMINISTRATIVA
  const [vistaAdmin, setVistaAdmin] = React.useState(false);

  // Parámetros de simulación
  const [modoCalculo, setModoCalculo] = React.useState<'NETO' | 'CUOTA' | 'LINK_SIDECREER'>('NETO');
  const [montoPrincipal, setMontoPrincipal] = React.useState<number>(1000000);
  const [nombreCliente, setNombreCliente] = React.useState(socioPreseleccionado?.Apellido_Nombre || '');
  const [telefonoCliente, setTelefonoCliente] = React.useState(socioPreseleccionado?.Telefono_WhatsApp || '');
  const [dniCliente, setDniCliente] = React.useState(socioPreseleccionado?.DNI || '');
  const [mesPrimerPago, setMesPrimerPago] = React.useState('Diciembre');
  const [mesHaberes, setMesHaberes] = React.useState('Noviembre');

  // Checkboxes de líneas visibles
  const [verFedem, setVerFedem] = React.useState(true);
  const [verMunicipales, setVerMunicipales] = React.useState(true);
  const [verSidecreer, setVerSidecreer] = React.useState(true);

  // Plantilla de WhatsApp
  const [tipoPlantillaWA, setTipoPlantillaWA] = React.useState<'MULTILINEA' | 'FEDEM' | 'MUNI' | 'SIDECREER'>('MULTILINEA');
  const [textoWAEditado, setTextoWAEditado] = React.useState('');
  const [copiado, setCopiado] = React.useState(false);

  // --- REFINANCIACIÓN & CONSOLIDACIÓN DE DEUDAS PREVIAS ---
  const [activarRefinanciacion, setActivarRefinanciacion] = React.useState(false);
  const [ayudasSeleccionadasParaCancelar, setAyudasSeleccionadasParaCancelar] = React.useState<string[]>([]);
  const [deudaExternaManual, setDeudaExternaManual] = React.useState<number>(0);
  const [entidadDeudaExterna, setEntidadDeudaExterna] = React.useState('');

  // Sincronizar cuando cambia el socio preseleccionado
  React.useEffect(() => {
    if (socioPreseleccionado) {
      setNombreCliente(socioPreseleccionado.Apellido_Nombre);
      setTelefonoCliente(socioPreseleccionado.Telefono_WhatsApp);
      setDniCliente(socioPreseleccionado.DNI);
      if (socioPreseleccionado.Margen_Cuota_Disponible > 0) {
        setMontoPrincipal(socioPreseleccionado.Margen_Cuota_Disponible);
        setModoCalculo('CUOTA');
      }
    }
  }, [socioPreseleccionado]);

  // Ayudas activas del socio para refinanciar
  const ayudasVigentesSocio = React.useMemo(() => {
    if (!dniCliente) return [];
    return ayudas.filter(
      (a) => a.DNI === dniCliente && a.Estado_Tramite === 'Liquidado' && a.Saldo_Total_Restante > 0
    );
  }, [ayudas, dniCliente]);

  // Total retenido por deudas a consolidar
  const totalRetencionDeuda = React.useMemo(() => {
    if (!activarRefinanciacion) return 0;
    let suma = 0;
    ayudasVigentesSocio.forEach((ay) => {
      if (ayudasSeleccionadasParaCancelar.includes(ay.ID_Ayuda)) {
        suma += Number(ay.Saldo_Total_Restante) || 0;
      }
    });
    suma += Number(deudaExternaManual) || 0;
    return suma;
  }, [activarRefinanciacion, ayudasVigentesSocio, ayudasSeleccionadasParaCancelar, deudaExternaManual]);

  // Cálculos de planes en vivo (0ms)
  const planesFEDEM = React.useMemo(() => {
    return simularFEDEM(modoCalculo, montoPrincipal);
  }, [modoCalculo, montoPrincipal]);

  const planesMunicipales = React.useMemo(() => {
    return simularMunicipales(modoCalculo, montoPrincipal);
  }, [modoCalculo, montoPrincipal]);

  const planesSidecreer = React.useMemo(() => {
    return simularSidecreer(modoCalculo, montoPrincipal);
  }, [modoCalculo, montoPrincipal]);

  // Generador dinámico de texto para WhatsApp
  React.useEffect(() => {
    const nombre = nombreCliente.trim() || 'Estimado/a socio/a';
    let planesTexto = '';

    if (tipoPlantillaWA === 'MULTILINEA' || tipoPlantillaWA === 'FEDEM') {
      const p12 = planesFEDEM.find((p) => p.plazo === 12);
      const p24 = planesFEDEM.find((p) => p.plazo === 24);
      if (p12 && p24) {
        planesTexto += `🏛️ *FEDEM Provincial:*\n${p12.textoWhatsApp}\n${p24.textoWhatsApp}\n\n`;
      }
    }

    if (tipoPlantillaWA === 'MULTILINEA' || tipoPlantillaWA === 'MUNI') {
      const m12 = planesMunicipales.find((p) => p.plazo === 12);
      const m24 = planesMunicipales.find((p) => p.plazo === 24);
      if (m12 && m24) {
        planesTexto += `🏢 *Convenio Municipal VIKINGO:*\n${m12.textoWhatsApp}\n${m24.textoWhatsApp}\n\n`;
      }
    }

    if (tipoPlantillaWA === 'MULTILINEA' || tipoPlantillaWA === 'SIDECREER') {
      const s12 = planesSidecreer.find((p) => p.plazo === 12);
      const s24 = planesSidecreer.find((p) => p.plazo === 24);
      if (s12 && s24) {
        planesTexto += `💳 *Tarjeta Sidecreer:*\n${s12.textoWhatsApp}\n${s24.textoWhatsApp}\n\n`;
      }
    }

    let detalleRefiTexto = '';
    if (activarRefinanciacion && totalRetencionDeuda > 0) {
      detalleRefiTexto = `🔄 *PLAN DE CONSOLIDACIÓN DE DEUDAS INCLUIDO:*\nSe descuenta cancelación de préstamos anteriores por ${formatMonedaAR(
        totalRetencionDeuda
      )}, entregando el neto remanente directamente en su cuenta bancaria BERSA.\n\n`;
    }

    const plantilla = `${nombre} a continuación le detallamos los planes oficiales aprobados de Mutual Modelo 🙌🏻\n\n📢 *TENEMOS LA TASA MÁS BAJA DE LA PROVINCIA*\n\n${planesTexto.trimEnd()}\n\n${detalleRefiTexto}Requisitos para liquidación inmediata:\n✅ Foto DNI frente y dorso\n✅ Último recibo de sueldo oficial\n✅ Constancia de CBU emitida por cajero o Home Banking\n✅ Factura de servicio a su nombre\n\nEl descuento de cuota social y de la ayuda económica se realiza directamente de su recibo de sueldo, siendo el primer pago en ${mesPrimerPago} con haberes de ${mesHaberes}.\n\nCualquier consulta estoy a su entera disposición.\nAtte. ${operadorActivo} — Asociación Mutual Modelo de Entre Ríos.`;

    setTextoWAEditado(plantilla);
  }, [
    nombreCliente,
    tipoPlantillaWA,
    planesFEDEM,
    planesMunicipales,
    planesSidecreer,
    mesPrimerPago,
    mesHaberes,
    operadorActivo,
    activarRefinanciacion,
    totalRetencionDeuda
  ]);

  const copiarPortapapeles = () => {
    navigator.clipboard.writeText(textoWAEditado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const abrirEnWhatsAppWeb = () => {
    const telLimpio = telefonoCliente.replace(/\D/g, '');
    const telFinal = telLimpio.startsWith('54') ? telLimpio : `549${telLimpio}`;
    const url = `https://wa.me/${telFinal}?text=${encodeURIComponent(textoWAEditado)}`;
    window.open(url, '_blank');
  };

  const handleOriginarPlan = (linea: string, plan: any) => {
    const esRefi = activarRefinanciacion && totalRetencionDeuda > 0;
    onCrearAyudaConPlan(
      linea,
      plan.netoEntregar,
      plan.plazo,
      plan.valorCuota,
      esRefi,
      ayudasSeleccionadasParaCancelar,
      totalRetencionDeuda
    );
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del Módulo */}
      <div className="bg-gradient-to-r from-slate-900 via-[#135596] to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
              Módulo 2
            </span>
            <span className="text-xs text-blue-200 font-mono">
              FEDEM • VIKINGO / QUAD • Sidecreer
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            Simulador Financiero & Originación de Ayudas
          </h1>
          <p className="text-xs text-blue-100/80 mt-0.5">
            Cálculo matemático al centavo, consolidación de deudas previas y generación automática para WhatsApp.
          </p>
        </div>

        {/* Toggle Vista Comercial vs Administrativa */}
        <div className="flex items-center bg-slate-950/70 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setVistaAdmin(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              !vistaAdmin
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Comercial (Socio)</span>
          </button>
          <button
            onClick={() => setVistaAdmin(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              vistaAdmin
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Vista Admin / Auditoría</span>
          </button>
        </div>
      </div>

      {/* Selector de Socio Rápido si no hay uno activo */}
      {!socioPreseleccionado && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>¿Desea precargar datos y margen de afectación de un socio registrado?</span>
          </div>
          <select
            onChange={(e) => {
              const socio = socios.find((s) => s.DNI === e.target.value);
              if (socio && onSeleccionarSocio) onSeleccionarSocio(socio);
            }}
            defaultValue=""
            className="bg-white border border-blue-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" disabled>
              Seleccionar Socio del Padrón...
            </option>
            {socios.map((s) => (
              <option key={s.DNI} value={s.DNI}>
                {s.Apellido_Nombre} (DNI {s.DNI}) — Margen: {formatMonedaAR(s.Margen_Cuota_Disponible)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grid Superior: Parámetros del Préstamo y Refinanciación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna 1 y 2: Parámetros de Simulación */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-blue-600" />
            Parámetros de Cálculo Financiero
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Modo de Entrada:
              </label>
              <select
                value={modoCalculo}
                onChange={(e) => setModoCalculo(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135596] font-semibold"
              >
                <option value="NETO">Por Monto Neto en Mano ($)</option>
                <option value="CUOTA">Por Cuota Afectable ($)</option>
                <option value="LINK_SIDECREER">Por Coeficiente Sidecreer ($)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                <span>
                  {modoCalculo === 'NETO'
                    ? 'Monto Neto Solicitado en Mano ($):'
                    : modoCalculo === 'CUOTA'
                    ? 'Valor de Cuota Afectable Deseada ($):'
                    : 'Capital Bruto Sidecreer ($):'}
                </span>
                {socioPreseleccionado && socioPreseleccionado.Margen_Cuota_Disponible > 0 && (
                  <button
                    onClick={() => {
                      setModoCalculo('CUOTA');
                      setMontoPrincipal(socioPreseleccionado.Margen_Cuota_Disponible);
                    }}
                    className="text-[10px] text-blue-700 hover:underline font-bold"
                  >
                    Usar Margen 35% ({formatMonedaAR(socioPreseleccionado.Margen_Cuota_Disponible)})
                  </button>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="5000"
                  value={montoPrincipal}
                  onChange={(e) => setMontoPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 pl-7 pr-3 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135596]"
                />
              </div>
            </div>
          </div>

          {/* Datos del Asociado para la Simulación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nombre del Socio:
              </label>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ej. Laura Benítez"
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                WhatsApp:
              </label>
              <input
                type="text"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                placeholder="Ej. 3434551290"
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Líneas a Comparar:
              </label>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-700">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verFedem}
                    onChange={(e) => setVerFedem(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>FEDEM</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verMunicipales}
                    onChange={(e) => setVerMunicipales(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>VIKINGO</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verSidecreer}
                    onChange={(e) => setVerSidecreer(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Sidecreer</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3: Panel de Consolidación de Deudas & Refinanciación */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-700" />
              Consolidación & Refinanciación
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activarRefinanciacion}
                onChange={(e) => setActivarRefinanciacion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <p className="text-[11px] text-amber-800 leading-relaxed">
            Permite cancelar préstamos anteriores de la Mutual o retener pasivos externos con débito directo del desembolso.
          </p>

          {activarRefinanciacion ? (
            <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
              {ayudasVigentesSocio.length > 0 ? (
                <div>
                  <label className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                    Préstamos Anteriores del Socio:
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {ayudasVigentesSocio.map((ay) => {
                      const seleccionada = ayudasSeleccionadasParaCancelar.includes(ay.ID_Ayuda);
                      return (
                        <div
                          key={ay.ID_Ayuda}
                          onClick={() => {
                            setAyudasSeleccionadasParaCancelar((prev) =>
                              seleccionada ? prev.filter((id) => id !== ay.ID_Ayuda) : [...prev, ay.ID_Ayuda]
                            );
                          }}
                          className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                            seleccionada
                              ? 'bg-amber-100 border-amber-400 font-semibold'
                              : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-bold text-amber-900">{ay.Nro_Mutuo}</div>
                            <div className="text-[10px] text-slate-500">{ay.Linea_Ayuda}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-rose-700">
                              {formatMonedaAR(ay.Saldo_Total_Restante)}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {ay.Cuotas_Restantes} ctas rest.
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 italic bg-amber-100/50 p-2 rounded">
                  {dniCliente
                    ? 'El socio no tiene deudas activas registradas en la Mutual.'
                    : 'Seleccione un socio para ver sus deudas vigentes.'}
                </div>
              )}

              {/* Deuda Externa Manual */}
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                  Deuda Externa / Otras Entidades ($):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="1000"
                    placeholder="Monto a cancelar"
                    value={deudaExternaManual || ''}
                    onChange={(e) => setDeudaExternaManual(Number(e.target.value) || 0)}
                    className="w-full py-1 px-2 text-xs bg-white border border-amber-300 rounded font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Entidad (ej. Banco BERSA)"
                    value={entidadDeudaExterna}
                    onChange={(e) => setEntidadDeudaExterna(e.target.value)}
                    className="w-full py-1 px-2 text-xs bg-white border border-amber-300 rounded"
                  />
                </div>
              </div>

              {/* Total Retención y Neto Efectivo Estimado */}
              <div className="bg-white p-2.5 rounded-lg border border-amber-300 space-y-1 text-xs">
                <div className="flex justify-between text-amber-900">
                  <span>Total Deudas a Cancelar:</span>
                  <span className="font-mono font-bold text-rose-700">
                    -{formatMonedaAR(totalRetencionDeuda)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-100">
                  <span className="font-bold">Neto Efectivo en Mano:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {formatMonedaAR(Math.max(0, montoPrincipal - totalRetencionDeuda))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-100/40 rounded-lg border border-amber-200/60 text-[11px] text-amber-800">
              Active el switch si esta operación cancelará saldos de créditos anteriores o pasivos con otras mutuales/bancos.
            </div>
          )}
        </div>
      </div>

      {/* Grid de Tablas Comparativas de Plazos (6 a 48 Cuotas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LÍNEA 1: FEDEM PROVINCIAL */}
        {verFedem && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-blue-50/80 border-b border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Línea Provincial
                </span>
                <h3 className="text-sm font-black text-blue-900">FEDEM Provincial</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">
                Gastos 25%/34%
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-100 space-y-2 flex-1">
              {planesFEDEM.map((plan) => (
                <div key={plan.plazo} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {plan.plazo} cuotas de:
                    </span>
                    <span className="text-sm font-black text-blue-900 font-mono">
                      {formatMonedaAR(plan.valorCuota)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Neto entregado:</span>
                    <span className="font-semibold text-slate-700">
                      {formatMonedaAR(plan.netoEntregar)}
                    </span>
                  </div>

                  {activarRefinanciacion && totalRetencionDeuda > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                      <span>En mano tras refi:</span>
                      <span className="font-bold text-emerald-700">
                        {formatMonedaAR(Math.max(0, plan.netoEntregar - totalRetencionDeuda))}
                      </span>
                    </div>
                  )}

                  {vistaAdmin && (
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span>Capital Bruto:</span>
                        <span>{formatMonedaAR(plan.capitalBruto)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gastos Admin:</span>
                        <span>{formatMonedaAR(plan.gastosAdmin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seguro Vida:</span>
                        <span>{formatMonedaAR(plan.seguroTotal)}</span>
                      </div>
                      <div className="flex justify-between text-blue-700 font-bold">
                        <span>TNA: {Number(plan.tna).toFixed(2)}% | TEM: {Number(plan.tem).toFixed(2)}%</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleOriginarPlan('FEDEM Provincial', plan)}
                    className="w-full mt-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded transition flex items-center justify-center gap-1"
                  >
                    <span>Originar {plan.plazo} ctas</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LÍNEA 2: MUNICIPALES (VIKINGO / QUAD) */}
        {verMunicipales && (
          <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Línea Convenio
                </span>
                <h3 className="text-sm font-black text-emerald-900">Municipales (VIKINGO)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                12 y 24 Ctas
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-100 space-y-2 flex-1">
              {planesMunicipales.map((plan) => (
                <div key={plan.plazo} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {plan.plazo} cuotas de:
                    </span>
                    <span className="text-sm font-black text-emerald-900 font-mono">
                      {formatMonedaAR(plan.valorCuota)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Neto entregado:</span>
                    <span className="font-semibold text-slate-700">
                      {formatMonedaAR(plan.netoEntregar)}
                    </span>
                  </div>

                  {activarRefinanciacion && totalRetencionDeuda > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                      <span>En mano tras refi:</span>
                      <span className="font-bold text-emerald-700">
                        {formatMonedaAR(Math.max(0, plan.netoEntregar - totalRetencionDeuda))}
                      </span>
                    </div>
                  )}

                  {vistaAdmin && (
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span>Cap. Vikingo (85%):</span>
                        <span>{formatMonedaAR(plan.capitalVikingo || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cap. Quad (15%):</span>
                        <span>{formatMonedaAR(plan.capitalQuad || 0)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>TNA: 39.60% | TEM: 3.30% (Coef: {plan.coeficiente})</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleOriginarPlan('Municipalidad (VIKINGO)', plan)}
                    className="w-full mt-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded transition flex items-center justify-center gap-1"
                  >
                    <span>Originar {plan.plazo} ctas</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LÍNEA 3: TARJETA SIDECREER */}
        {verSidecreer && (
          <div className="bg-white rounded-xl border border-purple-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-purple-50/80 border-b border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Línea Tarjeta
                </span>
                <h3 className="text-sm font-black text-purple-900">Tarjeta Sidecreer</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
                6 a 48 Ctas
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-100 space-y-2 flex-1">
              {planesSidecreer.map((plan) => (
                <div key={plan.plazo} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {plan.plazo} cuotas de:
                    </span>
                    <span className="text-sm font-black text-purple-900 font-mono">
                      {formatMonedaAR(plan.valorCuota)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Neto entregado:</span>
                    <span className="font-semibold text-slate-700">
                      {formatMonedaAR(plan.netoEntregar)}
                    </span>
                  </div>

                  {activarRefinanciacion && totalRetencionDeuda > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                      <span>En mano tras refi:</span>
                      <span className="font-bold text-emerald-700">
                        {formatMonedaAR(Math.max(0, plan.netoEntregar - totalRetencionDeuda))}
                      </span>
                    </div>
                  )}

                  {vistaAdmin && (
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span>Capital Bruto:</span>
                        <span>{formatMonedaAR(plan.capitalBruto)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retención Arancel (25%):</span>
                        <span>{formatMonedaAR(plan.gastosAdmin)}</span>
                      </div>
                      <div className="flex justify-between text-purple-700 font-bold">
                        <span>TNA: 48.00% | TEM: 4.00% (Coef. Link: {plan.coeficiente})</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleOriginarPlan('Tarjeta Sidecreer', plan)}
                    className="w-full mt-1 py-1 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold rounded transition flex items-center justify-center gap-1"
                  >
                    <span>Originar {plan.plazo} ctas</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generador de Ofertas para WhatsApp */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Send className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Generador de Oferta Oficial para WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Mensaje pre-formateado con requisitos, desglose de cuotas y datos del operador en turno.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tipoPlantillaWA}
              onChange={(e) => setTipoPlantillaWA(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="MULTILINEA">Oferta Comparativa Multilínea</option>
              <option value="FEDEM">Solo FEDEM Provincial</option>
              <option value="MUNI">Solo Convenio Municipal VIKINGO</option>
              <option value="SIDECREER">Solo Tarjeta Sidecreer</option>
            </select>
            <button
              onClick={copiarPortapapeles}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={abrirEnWhatsAppWeb}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={textoWAEditado}
          onChange={(e) => setTextoWAEditado(e.target.value)}
          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#135596]"
        />
      </div>
    </div>
  );
};
