import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AyudaEconomica, CesionCartera } from '../../types/crm';
import { formatMonedaAR, calcularVPN } from '../../utils/financialCalculations';

interface CrmCesionCarterasVPNProps {
  ayudas: AyudaEconomica[];
  onEjecutarCesion?: (cesion: Partial<CesionCartera>) => void;
}

export const CrmCesionCarterasVPN: React.FC<CrmCesionCarterasVPNProps> = ({
  ayudas,
  onEjecutarCesion
}) => {
  const [tasaCorteMensual, setTasaCorteMensual] = useState<number>(3.5);
  const [filtroLinea, setFiltroLinea] = useState<string>('TODOS');
  const [filtroCobranza, setFiltroCobranza] = useState<string>('AL_DIA');
  const [minCuotasRestantes, setMinCuotasRestantes] = useState<number>(6);
  const [loteGeneradoExito, setLoteGeneradoExito] = useState<boolean>(false);

  // Filtrado de la cartera
  const carteraFiltrada = useMemo(() => {
    return ayudas.filter((a) => {
      const matchLinea = filtroLinea === 'TODOS' || a.Linea_Ayuda.includes(filtroLinea);
      const cuotasRest = (a.Cantidad_Cuotas || 12) - (a.Cuotas_Pagadas || 0);
      const matchCuotas = cuotasRest >= minCuotasRestantes;
      const matchCobranza =
        filtroCobranza === 'TODOS' ||
        (filtroCobranza === 'AL_DIA' && a.Estado_Cobranza === 'Al Día') ||
        (filtroCobranza === 'MORA' && a.Estado_Cobranza !== 'Al Día');

      return matchLinea && matchCuotas && matchCobranza;
    });
  }, [ayudas, filtroLinea, filtroCobranza, minCuotasRestantes]);

  // Cálculos de saldo nominal y VPN
  const { totalNominal, totalVPN } = useMemo(() => {
    let nominal = 0;
    let vpn = 0;
    const tasaDecimal = tasaCorteMensual / 100;

    carteraFiltrada.forEach((a) => {
      const cuotasRest = Math.max(1, (a.Cantidad_Cuotas || 12) - (a.Cuotas_Pagadas || 0));
      const saldoCredito = cuotasRest * a.Valor_Cuota;
      nominal += saldoCredito;
      vpn += calcularVPN(a.Valor_Cuota, cuotasRest, tasaDecimal);
    });

    return { totalNominal: nominal, totalVPN: vpn };
  }, [carteraFiltrada, tasaCorteMensual]);

  const handleGenerarLoteCesion = () => {
    if (onEjecutarCesion) {
      onEjecutarCesion({
        ID_Lote_Cesion: `LOTE-CESION-${Date.now().toString().slice(-4)}`,
        Cesionario_Entidad_Destino: 'Fideicomiso Financiero BERSA I',
        Fecha_Cesion: new Date().toISOString().slice(0, 10),
        Cantidad_Creditos_Cedidos: carteraFiltrada.length,
        Saldo_Nominal_Cedido: totalNominal,
        Precio_Venta_Cartera: totalVPN,
        Tasa_Descuento_Aplicada_Pct: tasaCorteMensual,
        Estado_Cesion: 'Vigente'
      });
    }
    setLoteGeneradoExito(true);
    setTimeout(() => setLoteGeneradoExito(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
          Módulo 5 • Mercado de Capitales
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Carteras y Cesión con VPN
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Valuación descontada por flujo de fondos futuros para cesión a fideicomisos o bancos.
        </p>
      </div>

      {loteGeneradoExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Lote de cesión generado exitosamente! Anexo legal listo para firma y transferencia.</span>
        </div>
      )}

      {/* FILTROS Y TASA DE CORTE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Parámetros de Selección y Valuación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tasa de Corte TEM: <strong className="text-blue-600 font-mono">{tasaCorteMensual}%</strong>
            </label>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.25"
              value={tasaCorteMensual}
              onChange={(e) => setTasaCorteMensual(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>1.0% TEM</span>
              <span>8.0% TEM</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Línea de Ayuda</label>
            <select
              value={filtroLinea}
              onChange={(e) => setFiltroLinea(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
            >
              <option value="TODOS">Todas las Líneas</option>
              <option value="FEDEM">FEDEM Provincial</option>
              <option value="Municipalidad">Municipales QUAD</option>
              <option value="Sidecreer">Sidecreer</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Scoring / Cobranza</label>
            <select
              value={filtroCobranza}
              onChange={(e) => setFiltroCobranza(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
            >
              <option value="AL_DIA">Solo Cartera Al Día 🟢</option>
              <option value="TODOS">Toda la Cartera</option>
              <option value="MORA">En Mora</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mínimo Cuotas Restantes: <strong className="text-blue-600">{minCuotasRestantes} m</strong>
            </label>
            <input
              type="range"
              min="1"
              max="36"
              value={minCuotasRestantes}
              onChange={(e) => setMinCuotasRestantes(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs text-slate-500">Créditos Calificados en Lote</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {carteraFiltrada.length} contratos
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cumplen condiciones de cesión</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs text-slate-500">Saldo Nominal Futuro Cedido</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {formatMonedaAR(totalNominal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Suma total de cuotas por cobrar</p>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <p className="text-xs text-blue-200">Valor Presente Neto (VPN Descontado)</p>
            <p className="text-2xl font-extrabold font-mono mt-1">
              {formatMonedaAR(totalVPN)}
            </p>
          </div>
          <p className="text-[11px] text-blue-100/90 mt-2">
            Descuento financiero: {formatMonedaAR(totalNominal - totalVPN)} ({(100 - (totalVPN / (totalNominal || 1)) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerarLoteCesion}
          className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ejecutar Lote de Cesión y Descargar Anexo
        </button>
      </div>
    </div>
  );
};
