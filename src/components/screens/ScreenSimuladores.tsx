import React from 'react';
import { SocioPadron, OperadorMutual } from '../../types/crm';
import {
  simularFEDEM,
  simularMunicipales,
  simularSidecreer,
  formatMonedaAR,
  formatNumero
} from '../../utils/financialCalculations';
import { INITIAL_RECIBOS_CODIGOS } from '../../data/seedData';
import {
  Copy,
  Send,
  Eye,
  Shield,
  FileSearch,
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ScreenSimuladoresProps {
  operadorActivo: OperadorMutual;
  socioPreseleccionado?: SocioPadron | null;
  onCrearAyudaConPlan: (linea: string, monto: number, cuotas: number, valorCuota: number) => void;
}

export const ScreenSimuladores: React.FC<ScreenSimuladoresProps> = ({
  operadorActivo,
  socioPreseleccionado,
  onCrearAyudaConPlan
}) => {
  // Estado de Vista: COMERCIAL vs ADMINISTRATIVA
  const [vistaAdmin, setVistaAdmin] = React.useState(false);
  const [subherramienta, setSubherramienta] = React.useState<'calculadoras' | 'recibos'>('calculadoras');

  // Parámetros de simulación
  const [modoCalculo, setModoCalculo] = React.useState<'NETO' | 'CUOTA' | 'LINK_SIDECREER'>('NETO');
  const [montoPrincipal, setMontoPrincipal] = React.useState<number>(1000000);
  const [nombreCliente, setNombreCliente] = React.useState(socioPreseleccionado?.Apellido_Nombre || '');
  const [telefonoCliente, setTelefonoCliente] = React.useState(socioPreseleccionado?.Telefono_WhatsApp || '');
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

  // Analizador de recibos
  const [reglaAfectacion, setReglaAfectacion] = React.useState<'35% Neto Ley' | '40% Neto Ley' | '40% Sueldo Bruto'>('35% Neto Ley');
  const [analizandoRecibo, setAnalizandoRecibo] = React.useState(false);
  const [reciboItems, setReciboItems] = React.useState([
    { codigo: '101', concepto: 'Sueldo Básico Categoría', monto: 850000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '150', concepto: 'Antigüedad 15 Años (CGE)', monto: 340000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '160', concepto: 'Adicional Código 029 Función', monto: 180000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '201', concepto: 'Aporte Jubilatorio Ley 8732 (16%)', monto: 219200, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '205', concepto: 'IOSPER Obra Social (3%)', monto: 41100, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '310', concepto: 'Mutual Modelo Cuota Social', monto: 27400, clasificacion: 'DESCUENTO_PARTICULAR' },
    { codigo: '401', concepto: 'Seguro Colectivo Provincial', monto: 18000, clasificacion: 'DESCUENTO_PARTICULAR' }
  ]);

  // Si cambia el socio preseleccionado, sincronizar
  React.useEffect(() => {
    if (socioPreseleccionado) {
      setNombreCliente(socioPreseleccionado.Apellido_Nombre);
      setTelefonoCliente(socioPreseleccionado.Telefono_WhatsApp);
      if (socioPreseleccionado.Margen_Cuota_Disponible > 0) {
        setMontoPrincipal(socioPreseleccionado.Margen_Cuota_Disponible);
        setModoCalculo('CUOTA');
      }
    }
  }, [socioPreseleccionado]);

  // Cálculos en vivo (0ms de latencia)
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

    const plantilla = `${nombre} a continuación le detallamos los planes oficiales aprobados de Mutual Modelo 🙌🏻\n\n📢 *TENEMOS LA TASA MÁS BAJA DE LA PROVINCIA*\n\n${planesTexto.trimEnd()}\n\nRequisitos para liquidación inmediata:\n✅ Foto DNI frente y dorso\n✅ Último recibo de sueldo oficial\n✅ Constancia de CBU emitida por cajero o Home Banking\n✅ Factura de servicio a su nombre\n\nEl descuento de cuota social y de la ayuda económica se realiza directamente de su recibo de sueldo, siendo el primer pago en ${mesPrimerPago} con haberes de ${mesHaberes}.\n\nCualquier consulta estoy a su entera disposición.\nAtte. ${operadorActivo} — Asociación Mutual Modelo de Entre Ríos.`;

    setTextoWAEditado(plantilla);
  }, [
    nombreCliente,
    tipoPlantillaWA,
    planesFEDEM,
    planesMunicipales,
    planesSidecreer,
    mesPrimerPago,
    mesHaberes,
    operadorActivo
  ]);

  // Totales del analizador de recibos
  const resumenRecibo = React.useMemo(() => {
    let haberes = 0;
    let ley = 0;
    let part = 0;

    reciboItems.forEach((it) => {
      if (it.clasificacion === 'HABER_COMPUTABLE') haberes += it.monto;
      else if (it.clasificacion === 'DESCUENTO_LEY') ley += it.monto;
      else if (it.clasificacion === 'DESCUENTO_PARTICULAR') part += it.monto;
    });

    let margen = 0;
    if (reglaAfectacion === '35% Neto Ley') {
      margen = Math.max(0, Math.round((haberes - ley) * 0.35 - part));
    } else if (reglaAfectacion === '40% Neto Ley') {
      margen = Math.max(0, Math.round((haberes - ley) * 0.40 - part));
    } else {
      margen = Math.max(0, Math.round(haberes * 0.40 - (ley + part)));
    }

    return { haberes, ley, part, margen };
  }, [reciboItems, reglaAfectacion]);

  const copiarWhatsApp = () => {
    navigator.clipboard.writeText(textoWAEditado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const enviarWhatsApp = () => {
    const tel = telefonoCliente.replace(/[^0-9]/g, '');
    let url = '';
    if (tel) {
      const fullTel = tel.length === 10 && !tel.startsWith('54') ? `549${tel}` : tel;
      url = `https://api.whatsapp.com/send?phone=${fullTel}&text=${encodeURIComponent(textoWAEditado)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoWAEditado)}`;
    }
    window.open(url, '_blank');
  };

  const handleAnalizarReciboSimulado = () => {
    setAnalizandoRecibo(true);
    setTimeout(() => {
      setAnalizandoRecibo(false);
      setReciboItems([
        { codigo: '101', concepto: 'Sueldo Básico Nivel Directivo', monto: 920000, clasificacion: 'HABER_COMPUTABLE' },
        { codigo: '150', concepto: 'Antigüedad 20 Años', monto: 460000, clasificacion: 'HABER_COMPUTABLE' },
        { codigo: '160', concepto: 'Presentismo Docente', monto: 190000, clasificacion: 'HABER_COMPUTABLE' },
        { codigo: '201', concepto: 'Aporte Jubilatorio Ley 8732 (16%)', monto: 251200, clasificacion: 'DESCUENTO_LEY' },
        { codigo: '205', concepto: 'IOSPER Obra Social (3%)', monto: 47100, clasificacion: 'DESCUENTO_LEY' },
        { codigo: '310', concepto: 'Mutual Modelo Cuota Social', monto: 31400, clasificacion: 'DESCUENTO_PARTICULAR' },
        { codigo: '405', concepto: 'Préstamo Banco BERSA (Código 14)', monto: 120000, clasificacion: 'DESCUENTO_PARTICULAR' }
      ]);
    }, 1200);
  };

  const transferirMargenAlSimulador = () => {
    setMontoPrincipal(resumenRecibo.margen);
    setModoCalculo('CUOTA');
    setSubherramienta('calculadoras');
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE CONTROL DEL SIMULADOR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Sub-herramientas switcher */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSubherramienta('calculadoras')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              subherramienta === 'calculadoras'
                ? 'bg-white text-[#135596] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧮 Simuladores de Planes Multilínea
          </button>
          <button
            onClick={() => setSubherramienta('recibos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              subherramienta === 'recibos'
                ? 'bg-white text-[#135596] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📄 Analizador de Recibos de Sueldo
          </button>
        </div>

        {/* SWITCH MAESTRO DE VISTA: COMERCIAL VS ADMINISTRATIVA */}
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Modo de Visualización:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setVistaAdmin(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                !vistaAdmin
                  ? 'bg-[#135596] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>🟢 Vista Comercial (Simple)</span>
            </button>
            <button
              onClick={() => setVistaAdmin(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                vistaAdmin
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>🛡️ Vista Administrativa (Completa)</span>
            </button>
          </div>
        </div>

      </div>

      {subherramienta === 'calculadoras' ? (
        <>
          {/* PANEL DE PARÁMETROS DE ENTRADA */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Modo de Cálculo */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Modo de Entrada:
                </label>
                <select
                  value={modoCalculo}
                  onChange={(e) => setModoCalculo(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#135596] focus:outline-none"
                >
                  <option value="NETO">💰 Por Monto Neto a Entregar ($)</option>
                  <option value="CUOTA">🎯 Por Cuota Objetivo / Margen ($)</option>
                  <option value="LINK_SIDECREER">🔗 Por Monto Link Sidecreer ($)</option>
                </select>
              </div>

              {/* Valor Principal ($) */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {modoCalculo === 'NETO'
                      ? 'Neto a Entregar en Mano ($):'
                      : modoCalculo === 'CUOTA'
                      ? 'Cuota Mensual Objetivo ($):'
                      : 'Importe Total Link ($):'}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Pesos AR</span>
                </div>
                <input
                  type="number"
                  value={montoPrincipal}
                  onChange={(e) => setMontoPrincipal(Number(e.target.value) || 0)}
                  className="w-full font-mono text-base font-bold text-[#135596] bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-[#135596] focus:outline-none"
                />
              </div>

              {/* Nombre del Socio */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Socio:
                </label>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Ej: Laura Benítez"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#135596] focus:outline-none"
                />
              </div>

              {/* Teléfono WhatsApp */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  WhatsApp (Cód. Área + N°):
                </label>
                <input
                  type="text"
                  value={telefonoCliente}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                  placeholder="Ej: 3434551290"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#135596] focus:outline-none"
                />
              </div>

            </div>

            {/* Accesos Rápidos de Monto & Checkboxes de Líneas */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold mr-1">Preajustes rápidos:</span>
                {[50000, 100000, 250000, 500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMontoPrincipal(amt)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md border transition ${
                      montoPrincipal === amt
                        ? 'bg-[#135596] text-white border-[#135596]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ${(amt / 1000).toLocaleString('es-AR')}k
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span>Líneas visibles:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verFedem}
                    onChange={(e) => setVerFedem(e.target.checked)}
                    className="rounded text-[#135596]"
                  />
                  <span>FEDEM</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verMunicipales}
                    onChange={(e) => setVerMunicipales(e.target.checked)}
                    className="rounded text-[#135596]"
                  />
                  <span>Municipales</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verSidecreer}
                    onChange={(e) => setVerSidecreer(e.target.checked)}
                    className="rounded text-[#135596]"
                  />
                  <span>Sidecreer</span>
                </label>
              </div>
            </div>
          </div>

          {/* TABLA 1: FEDEM PROVINCIAL */}
          {verFedem && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    Línea 1: FEDEM Provincial (6 a 48 Cuotas Mensuales)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Gastos: 25% (6 y 12 cuotas) / 34% (18 a 48 cuotas) • Seguro: 0.50%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Plazo</th>
                      <th className="py-2.5 px-3 text-right text-emerald-800">Valor Cuota Fija</th>
                      <th className="py-2.5 px-3 text-right">Neto a Entregar</th>
                      <th className="py-2.5 px-3 text-right text-purple-800">Total a Devolver</th>
                      {vistaAdmin && (
                        <>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Capital Bruto</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Gastos Admin</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Seguro Total</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Intereses Fin.</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">TNA</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">TEM</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">TEA</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {planesFEDEM.map((p) => (
                      <tr key={p.plazo} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                          {p.plazo} meses
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 text-sm">
                          {formatMonedaAR(p.valorCuota)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {formatMonedaAR(p.netoEntregar)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                          {formatMonedaAR(p.montoFinalDevolver)}
                        </td>
                        {vistaAdmin && (
                          <>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.capitalBruto)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.gastosAdmin)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.seguroTotal)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.interesesFinancieros)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {(p.tna * 100).toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {(p.tem * 100).toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {(p.tea * 100).toFixed(2)}%
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            onClick={() =>
                              onCrearAyudaConPlan('FEDEM Provincial', p.netoEntregar, p.plazo, p.valorCuota)
                            }
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#135596] hover:bg-[#0d3b68] rounded transition"
                          >
                            + Crear Ayuda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLA 2: MUNICIPALES (CONVENIO VIKINGO / QUAD) */}
          {verMunicipales && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    Línea 2: Municipales — Convenio VIKINGO / QUAD (12 y 24 Cuotas)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Factor VIKINGO: 85% • TNA QUAD: 39.60% (TEM 3.30%)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Plazo</th>
                      <th className="py-2.5 px-3 text-right text-emerald-800">Valor Cuota Fija</th>
                      <th className="py-2.5 px-3 text-right">Neto a Entregar</th>
                      <th className="py-2.5 px-3 text-right text-purple-800">Total a Devolver</th>
                      {vistaAdmin && (
                        <>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Capital Vikingo</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Gastos Otorg.</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Capital QUAD</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Intereses Fin.</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">CFT TEA</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {planesMunicipales.map((p) => (
                      <tr key={p.plazo} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                          {p.plazo} meses
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 text-sm">
                          {formatMonedaAR(p.valorCuota)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {formatMonedaAR(p.netoEntregar)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                          {formatMonedaAR(p.montoFinalDevolver)}
                        </td>
                        {vistaAdmin && (
                          <>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.capitalVikingo || 0)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.gastosAdmin)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.capitalQuad || 0)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.interesesFinancieros)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {(p.tea * 100).toFixed(0)}%
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            onClick={() =>
                              onCrearAyudaConPlan('Municipalidad (VIKINGO)', p.netoEntregar, p.plazo, p.valorCuota)
                            }
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition"
                          >
                            + Crear Ayuda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLA 3: TARJETA SIDECREER */}
          {verSidecreer && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    Línea 3: Tarjeta Sidecreer (6 a 48 Cuotas Mensuales)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Gastos: 25% (6 y 12 cuotas) / 34% (18 a 48 cuotas) • Sin Seguro
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Plazo</th>
                      <th className="py-2.5 px-3 text-right text-emerald-800">Valor Cuota Fija</th>
                      <th className="py-2.5 px-3 text-right">Neto a Entregar</th>
                      <th className="py-2.5 px-3 text-right text-purple-800">Monto Link Sidecreer</th>
                      {vistaAdmin && (
                        <>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Capital Bruto</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Gastos Admin</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">Intereses Fin.</th>
                          <th className="py-2.5 px-3 text-right bg-purple-50/40">TNA</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {planesSidecreer.map((p) => (
                      <tr key={p.plazo} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                          {p.plazo} meses
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 text-sm">
                          {formatMonedaAR(p.valorCuota)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {formatMonedaAR(p.netoEntregar)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                          {formatMonedaAR(p.montoFinalDevolver)}
                        </td>
                        {vistaAdmin && (
                          <>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.capitalBruto)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.gastosAdmin)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {formatMonedaAR(p.interesesFinancieros)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 bg-purple-50/20">
                              {(p.tna * 100).toFixed(2)}%
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            onClick={() =>
                              onCrearAyudaConPlan('Tarjeta Sidecreer', p.netoEntregar, p.plazo, p.valorCuota)
                            }
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded transition"
                          >
                            + Crear Ayuda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERADOR Y EDITOR DE PLANTILLAS PARA WHATSAPP */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  📲 Redactor & Generador Institucional para WhatsApp
                </h3>
                <p className="text-xs text-slate-500">
                  Mensaje listo para enviar con detalle exacto de cuotas, requisitos y meses de cobro.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={tipoPlantillaWA}
                  onChange={(e) => setTipoPlantillaWA(e.target.value as any)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md p-1.5 focus:outline-none"
                >
                  <option value="MULTILINEA">Oferta Multilínea Completa</option>
                  <option value="FEDEM">Solo FEDEM (12 y 24 cuotas)</option>
                  <option value="MUNI">Solo Municipales (12 y 24 cuotas)</option>
                  <option value="SIDECREER">Solo Tarjeta Sidecreer</option>
                </select>
              </div>
            </div>

            <textarea
              value={textoWAEditado}
              onChange={(e) => setTextoWAEditado(e.target.value)}
              rows={8}
              className="w-full font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <span className="text-[11px] text-slate-400">
                Se enviará firmado por el operador activo: <strong>{operadorActivo}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={copiarWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? '¡Copiado al Portapapeles!' : 'Copiar Texto'}
                </button>
                <button
                  onClick={enviarWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Abrir WhatsApp Directo
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* SUB-HERRAMIENTA: ANALIZADOR DE RECIBOS DE SUELDO */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#135596]" />
                Analizador de Recibos de Sueldo & Verificación de Margen
              </h3>
              <p className="text-xs text-slate-500">
                Clasificación automática de haberes computables, aportes de ley y afectaciones de cuota disponible.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Regla de Afectación:</label>
              <select
                value={reglaAfectacion}
                onChange={(e) => setReglaAfectacion(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md p-1.5 focus:outline-none"
              >
                <option value="35% Neto Ley">35% de Haberes Netos de Ley</option>
                <option value="40% Neto Ley">40% de Haberes Netos de Ley</option>
                <option value="40% Sueldo Bruto">40% de Sueldo Bruto Total</option>
              </select>
            </div>
          </div>

          {/* Subida y Botón de Escaneo IA */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <input type="file" accept=".pdf,image/*" className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-100" />
            <button
              onClick={handleAnalizarReciboSimulado}
              disabled={analizandoRecibo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-md transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {analizandoRecibo ? 'Analizando con Gemini OCR...' : 'Escanear con Agente IA (OCR)'}
            </button>
          </div>

          {/* 4 KPIs de la Liquidación del Recibo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Haberes Computables
              </span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {formatMonedaAR(resumenRecibo.haberes)}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Descuentos de Ley (Jub + IOSPER)
              </span>
              <span className="font-mono text-lg font-bold text-rose-700">
                {formatMonedaAR(resumenRecibo.ley)}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Descuentos Particulares / Embargos
              </span>
              <span className="font-mono text-lg font-bold text-amber-700">
                {formatMonedaAR(resumenRecibo.part)}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Margen de Cuota Disponible
              </span>
              <span className="font-mono text-xl font-extrabold text-emerald-700">
                {formatMonedaAR(resumenRecibo.margen)}
              </span>
            </div>
          </div>

          {/* Tabla de Conceptos Desglosados */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Concepto Liquidado</th>
                  <th className="py-2 px-3">Clasificación Mutual</th>
                  <th className="py-2 px-3 text-right">Monto ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reciboItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.codigo}</td>
                    <td className="py-2 px-3 text-slate-800 font-medium">{item.concepto}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.clasificacion === 'HABER_COMPUTABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.clasificacion === 'DESCUENTO_LEY'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.clasificacion}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatMonedaAR(item.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={transferirMargenAlSimulador}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              <span>Transferir Margen ({formatMonedaAR(resumenRecibo.margen)}) al Simulador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
