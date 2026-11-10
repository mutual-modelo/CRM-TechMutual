import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Send,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import {
  simularFEDEM,
  simularMunicipales,
  simularSidecreer,
  formatMonedaAR,
  formatNumero
} from '../../utils/financialCalculations';
import { SimulationResultRow } from '../../types/crm';

export const CrmSimuladorCombinado: React.FC = () => {
  const [modoEntrada, setModoEntrada] = useState<'NETO' | 'CUOTA'>('NETO');
  const [lineaSeleccionada, setLineaSeleccionada] = useState<'FEDEM' | 'MUNICIPAL' | 'SIDECREER' | 'COMBINADA'>('FEDEM');
  const [valorIngresado, setValorIngresado] = useState<number>(500000);

  // Estados para simulación combinada
  const [combinadaLinea1, setCombinadaLinea1] = useState<'FEDEM' | 'MUNICIPAL'>('FEDEM');
  const [combinadaLinea2, setCombinadaLinea2] = useState<'SIDECREER'>('SIDECREER');
  const [porcentajeLinea1, setPorcentajeLinea1] = useState<number>(60); // 60% Línea 1, 40% Línea 2
  const [plazoCombinado, setPlazoCombinado] = useState<number>(12);

  // Bottom drawer propuesta WhatsApp
  const [drawerWhatsAppAbierto, setDrawerWhatsAppAbierto] = useState<boolean>(true);
  const [copiadoExito, setCopiadoExito] = useState<boolean>(false);
  const [nombreCliente, setNombreCliente] = useState<string>('Estimado Asociado');

  // Cálculos reactivos
  const resultadosFEDEM = useMemo(() => simularFEDEM(modoEntrada, valorIngresado), [modoEntrada, valorIngresado]);
  const resultadosMunicipal = useMemo(() => simularMunicipales(modoEntrada, valorIngresado), [modoEntrada, valorIngresado]);
  const resultadosSidecreer = useMemo(() => simularSidecreer(modoEntrada, valorIngresado), [modoEntrada, valorIngresado]);

  // Cálculo de Línea Combinada
  const resultadoCombinado = useMemo(() => {
    const monto1 = valorIngresado * (porcentajeLinea1 / 100);
    const monto2 = valorIngresado * ((100 - porcentajeLinea1) / 100);

    const res1 = combinadaLinea1 === 'FEDEM'
      ? simularFEDEM('NETO', monto1).find((r) => r.plazo === plazoCombinado)
      : simularMunicipales('NETO', monto1).find((r) => r.plazo === plazoCombinado);

    const res2 = simularSidecreer('NETO', monto2).find((r) => r.plazo === plazoCombinado);

    const cuotaTotal = (res1?.valorCuota || 0) + (res2?.valorCuota || 0);
    const netoTotal = monto1 + monto2;

    return {
      monto1,
      monto2,
      res1,
      res2,
      cuotaTotal,
      netoTotal,
      plazo: plazoCombinado
    };
  }, [valorIngresado, porcentajeLinea1, combinadaLinea1, plazoCombinado]);

  // Generador de Texto Institucional para WhatsApp
  const textoPropuestaWhatsApp = useMemo(() => {
    let lineasCuotas = '';

    if (lineaSeleccionada === 'FEDEM') {
      lineasCuotas = resultadosFEDEM
        .map((r) => `🔹 *${r.plazo} cuotas fijas* de *$ ${formatNumero(Math.round(r.valorCuota))}*`)
        .join('\n');
    } else if (lineaSeleccionada === 'MUNICIPAL') {
      lineasCuotas = resultadosMunicipal
        .map((r) => `🔹 *${r.plazo} cuotas fijas* de *$ ${formatNumero(Math.round(r.valorCuota))}*`)
        .join('\n');
    } else if (lineaSeleccionada === 'SIDECREER') {
      lineasCuotas = resultadosSidecreer
        .map((r) => `🔹 *${r.plazo} cuotas fijas* de *$ ${formatNumero(Math.round(r.valorCuota))}*`)
        .join('\n');
    } else {
      lineasCuotas = `🔹 *Plan Compuesto ${resultadoCombinado.plazo} cuotas:*
   • ${combinadaLinea1}: $ ${formatNumero(Math.round(resultadoCombinado.res1?.valorCuota || 0))}
   • ${combinadaLinea2}: $ ${formatNumero(Math.round(resultadoCombinado.res2?.valorCuota || 0))}
   ⭐ *CUOTA UNIFICADA:* *$ ${formatNumero(Math.round(resultadoCombinado.cuotaTotal))}*`;
    }

    return `🏛️ *ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS*
Hola *${nombreCliente}*, te enviamos la cotización oficial de tu Ayuda Económica:

💰 *Monto a Liquidar en Mano:* *$ ${formatNumero(Math.round(valorIngresado))}*
📋 *Línea Oficial:* ${lineaSeleccionada === 'COMBINADA' ? 'Plan Combinado Refinanciación' : lineaSeleccionada}

*Opciones Disponibles:*
${lineasCuotas}

✅ *Sin gastos ocultos* • Cuotas debitadas por recibo de haberes.
📲 Responde a este mensaje para confirmar y acreditar en tu cuenta bancaria.`;
  }, [
    nombreCliente,
    valorIngresado,
    lineaSeleccionada,
    resultadosFEDEM,
    resultadosMunicipal,
    resultadosSidecreer,
    resultadoCombinado,
    combinadaLinea1,
    combinadaLinea2
  ]);

  const handleCopiarWhatsApp = () => {
    navigator.clipboard.writeText(textoPropuestaWhatsApp);
    setCopiadoExito(true);
    setTimeout(() => setCopiadoExito(false), 2500);
  };

  const handleAbrirWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(textoPropuestaWhatsApp)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* HEADER DEL MÓDULO */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
          Módulo 2 • Motor Financiero
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Simulador de Ayudas Económicas y Combinadas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cotización multilínea oficial (FEDEM, Municipales QUAD, Sidecreer y Planes Compuestos).
        </p>
      </div>

      {/* SELECTOR DE MODALIDAD Y VALOR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Selector Modo Entrada */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Calcular por:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setModoEntrada('NETO')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  modoEntrada === 'NETO'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monto Neto a Entregar ($)
              </button>
              <button
                type="button"
                onClick={() => setModoEntrada('CUOTA')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  modoEntrada === 'CUOTA'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cuota Mensual Objetivo / Margen
              </button>
            </div>
          </div>

          {/* Selector de Línea */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { id: 'FEDEM', label: 'FEDEM Provincial' },
              { id: 'MUNICIPAL', label: 'Municipales QUAD' },
              { id: 'SIDECREER', label: 'Tarjeta Sidecreer' },
              { id: 'COMBINADA', label: 'Plan Combinado ⭐' }
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLineaSeleccionada(l.id as any)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  lineaSeleccionada === l.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Principal con Rango Deslizante */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-xs font-bold text-slate-700">
              {modoEntrada === 'NETO' ? 'Monto Neto Solicitado en Mano:' : 'Cuota Máxima Disponible por Recibo:'}
            </label>
            <span className="text-lg font-extrabold text-blue-600 font-mono">
              {formatMonedaAR(valorIngresado)}
            </span>
          </div>

          <input
            type="range"
            min={modoEntrada === 'NETO' ? 50000 : 10000}
            max={modoEntrada === 'NETO' ? 3000000 : 350000}
            step={modoEntrada === 'NETO' ? 25000 : 5000}
            value={valorIngresado}
            onChange={(e) => setValorIngresado(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* =========================================================================
          RESULTADOS SEGÚN LÍNEA SELECCIONADA
          ========================================================================= */}

      {lineaSeleccionada === 'COMBINADA' ? (
        /* PLANES COMBINADOS */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Configurador de Ayuda Combinada (FEDEM / Municipales + Sidecreer)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Línea Primaria</label>
              <select
                value={combinadaLinea1}
                onChange={(e) => setCombinadaLinea1(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
              >
                <option value="FEDEM">FEDEM Provincial</option>
                <option value="MUNICIPAL">Municipales QUAD</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Distribución del Monto</label>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={porcentajeLinea1}
                onChange={(e) => setPorcentajeLinea1(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>{porcentajeLinea1}% {combinadaLinea1}</span>
                <span>{100 - porcentajeLinea1}% Sidecreer</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Plazo Combinado</label>
              <select
                value={plazoCombinado}
                onChange={(e) => setPlazoCombinado(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
              >
                <option value={12}>12 Cuotas Fijas</option>
                <option value={24}>24 Cuotas Fijas</option>
              </select>
            </div>
          </div>

          {/* Tarjeta de Resumen Combinado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
            <div>
              <p className="text-xs text-indigo-900 font-semibold">{combinadaLinea1} ({porcentajeLinea1}%)</p>
              <p className="text-sm font-extrabold text-indigo-950 font-mono">
                {formatMonedaAR(resultadoCombinado.monto1)}
              </p>
              <p className="text-[11px] text-indigo-700">
                Cuota: {formatMonedaAR(resultadoCombinado.res1?.valorCuota || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-indigo-900 font-semibold">Sidecreer ({100 - porcentajeLinea1}%)</p>
              <p className="text-sm font-extrabold text-indigo-950 font-mono">
                {formatMonedaAR(resultadoCombinado.monto2)}
              </p>
              <p className="text-[11px] text-indigo-700">
                Cuota: {formatMonedaAR(resultadoCombinado.res2?.valorCuota || 0)}
              </p>
            </div>
            <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-xs">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Cuota Global Unificada</p>
              <p className="text-xl font-extrabold font-mono mt-0.5">
                {formatMonedaAR(resultadoCombinado.cuotaTotal)}
              </p>
              <p className="text-[10px] text-indigo-200">En {plazoCombinado} meses fijos</p>
            </div>
          </div>
        </div>
      ) : (
        /* TABLA DE CUOTAS PARA LÍNEA INDIVIDUAL */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Plazo</th>
                  <th className="py-3 px-3">Neto a Entregar</th>
                  <th className="py-3 px-3">Cuota Mensual</th>
                  <th className="py-3 px-3">Total a Devolver</th>
                  <th className="py-3 px-3">Gastos Otorg.</th>
                  <th className="py-3 px-3">TNA / CFT TEA</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(lineaSeleccionada === 'FEDEM'
                  ? resultadosFEDEM
                  : lineaSeleccionada === 'MUNICIPAL'
                  ? resultadosMunicipal
                  : resultadosSidecreer
                ).map((row) => (
                  <tr key={row.plazo} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono">
                        {row.plazo} cuotas
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatMonedaAR(row.netoEntregar)}
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-blue-700 text-sm">
                      {formatMonedaAR(row.valorCuota)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {formatMonedaAR(row.montoFinalDevolver)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {formatMonedaAR(row.gastosAdmin)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {(row.tna * 100).toFixed(1)}% / {(row.tea * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={handleCopiarWhatsApp}
                        className="py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[11px] transition-colors"
                      >
                        Enviar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PANEL DESPLEGABLE INFERIOR (BOTTOM DRAWER) DE PROPUESTA WHATSAPP
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <div
          onClick={() => setDrawerWhatsAppAbierto(!drawerWhatsAppAbierto)}
          className="p-4 bg-slate-900 text-white flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              Plantilla de Propuesta Formal para WhatsApp
            </h3>
          </div>
          {drawerWhatsAppAbierto ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>

        {drawerWhatsAppAbierto && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Nombre del Asociado:</label>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                className="p-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-white flex-1 max-w-xs"
              />
            </div>

            <textarea
              readOnly
              rows={8}
              value={textoPropuestaWhatsApp}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono bg-white text-slate-800 leading-relaxed shadow-inner"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopiarWhatsApp}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {copiadoExito ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiadoExito ? '¡Copiado al Portapapeles!' : 'Copiar Texto al Portapapeles'}
              </button>
              <button
                type="button"
                onClick={handleAbrirWhatsApp}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
