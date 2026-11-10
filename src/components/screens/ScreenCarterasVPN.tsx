import React from 'react';
import { AyudaEconomica, CesionCartera, AuditoriaIALegajo } from '../../types/crm';
import { formatMonedaAR, calcularVPN } from '../../utils/financialCalculations';
import { exportarA_CSV } from '../../utils/exportUtils';
import {
  PieChart,
  Layers,
  RotateCcw,
  Download,
  CheckSquare,
  Square,
  TrendingDown,
  DollarSign,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  ArrowRight,
  Eye,
  Bot
} from 'lucide-react';

interface ScreenCarterasVPNProps {
  ayudas: AyudaEconomica[];
  cesiones: CesionCartera[];
  auditoriasIALegajos?: AuditoriaIALegajo[];
  onAbrirModalCesion: (idsSeleccionados: string[], resumenValuacion: any) => void;
  onRevertirCesion: (idLote: string) => void;
}

export const ScreenCarterasVPN: React.FC<ScreenCarterasVPNProps> = ({
  ayudas,
  cesiones,
  auditoriasIALegajos = [],
  onAbrirModalCesion,
  onRevertirCesion
}) => {
  // Estado para Modal de Detalle de Lote
  const [loteParaDetalle, setLoteParaDetalle] = React.useState<CesionCartera | null>(null);

  // Filtros de Cartera
  const [tasaDescuentoMensual, setTasaDescuentoMensual] = React.useState<number>(4.5);
  const [titularidadFiltro, setTitularidadFiltro] = React.useState<'PROPIA' | 'CEDIDA' | 'TODAS'>('PROPIA');
  const [estadoCobranzaFiltro, setEstadoCobranzaFiltro] = React.useState('TODAS');
  const [lineaFiltro, setLineaFiltro] = React.useState('TODAS');
  const [scoringMinimoIA, setScoringMinimoIA] = React.useState<number>(0);
  const [cuotasRestMin, setCuotasRestMin] = React.useState<number>(0);
  const [saldoRestMin, setSaldoRestMin] = React.useState<number>(0);
  const [seleccionados, setSeleccionados] = React.useState<Set<string>>(new Set());

  // Mapa de scoring IA por DNI
  const scoringPorDNI = React.useMemo(() => {
    const mapa: Record<string, number> = {};
    auditoriasIALegajos.forEach((aud) => {
      if (!mapa[aud.DNI] || aud.Score_Riesgo > mapa[aud.DNI]) {
        mapa[aud.DNI] = aud.Score_Riesgo;
      }
    });
    return mapa;
  }, [auditoriasIALegajos]);

  // Filtrado de ayudas para cartera
  const creditosFiltrados = React.useMemo(() => {
    return ayudas.filter((ay) => {
      if (ay.Estado_Tramite !== 'Liquidado') return false;
      if (titularidadFiltro === 'PROPIA' && ay.Cartera_Titular !== 'Cartera Propia Mutual') return false;
      if (titularidadFiltro === 'CEDIDA' && ay.Cartera_Titular === 'Cartera Propia Mutual') return false;
      if (estadoCobranzaFiltro !== 'TODAS' && ay.Estado_Cobranza !== estadoCobranzaFiltro) return false;
      if (lineaFiltro !== 'TODAS' && ay.Linea_Ayuda !== lineaFiltro) return false;
      if (ay.Cuotas_Restantes < cuotasRestMin) return false;
      if (ay.Saldo_Total_Restante < saldoRestMin) return false;

      // Filtro de Scoring IA del Legajo
      if (scoringMinimoIA > 0) {
        const score = scoringPorDNI[ay.DNI] ?? 85;
        if (score < scoringMinimoIA) return false;
      }
      return true;
    });
  }, [ayudas, titularidadFiltro, estadoCobranzaFiltro, lineaFiltro, cuotasRestMin, saldoRestMin, scoringMinimoIA, scoringPorDNI]);

  // Valuación de créditos seleccionados o filtrados
  const valuacion = React.useMemo(() => {
    const tasaDecimal = (Number(tasaDescuentoMensual) || 4.5) / 100;
    const activos = creditosFiltrados.filter((a) => seleccionados.has(a.ID_Ayuda));
    const conjunto = activos.length > 0 ? activos : creditosFiltrados;

    let capitalOriginal = 0;
    let flujoNominal = 0;
    let vpnTotal = 0;

    conjunto.forEach((ay) => {
      capitalOriginal += Number(ay.Monto_Depositado) || 0;
      const vCuota = Number(ay.Valor_Cuota) || 0;
      const nRest = Number(ay.Cuotas_Restantes) || 0;
      const saldoNom = Number(ay.Saldo_Total_Restante) || vCuota * nRest;
      const vpn = calcularVPN(vCuota, nRest, tasaDecimal);

      flujoNominal += saldoNom;
      vpnTotal += vpn;
    });

    const quitaEstimada = Math.max(0, flujoNominal - vpnTotal);

    return {
      cantidad: conjunto.length,
      capitalOriginal,
      flujoNominal,
      vpnTotal: Math.round(vpnTotal),
      quitaEstimada: Math.round(quitaEstimada),
      tasaDescuentoMensual
    };
  }, [creditosFiltrados, seleccionados, tasaDescuentoMensual]);

  const toggleSeleccion = (id: string) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const seleccionarTodos = () => {
    if (seleccionados.size === creditosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(creditosFiltrados.map((a) => a.ID_Ayuda)));
    }
  };

  const handleExportCSV = () => {
    const data = creditosFiltrados.map((c) => ({
      ID_Ayuda: c.ID_Ayuda,
      Nro_Mutuo: c.Nro_Mutuo,
      Socio: c.Apellido_Nombre,
      DNI: c.DNI,
      Linea: c.Linea_Ayuda,
      Monto_Original: c.Monto_Depositado,
      Cuota: c.Valor_Cuota,
      Cuotas_Restantes: c.Cuotas_Restantes,
      Saldo_Nominal: c.Saldo_Total_Restante,
      VPN_Estimado: Math.round(calcularVPN(c.Valor_Cuota, c.Cuotas_Restantes, tasaDescuentoMensual / 100)),
      Estado_Cobranza: c.Estado_Cobranza,
      Titularidad: c.Cartera_Titular,
      Lote_Cesion: c.ID_Lote_Cesion || 'Sin Lote'
    }));
    exportarA_CSV(data, `Cartera_Valuacion_VPN_${tasaDescuentoMensual}pct`);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del Módulo */}
      <div className="bg-gradient-to-r from-slate-900 via-[#135596] to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
              Módulo 5
            </span>
            <span className="text-xs text-blue-200 font-mono">
              Fórmula NPV / VPN con Tasa Mensual Descontada
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            Consola de Cesión y Gestión de Carteras (VPN)
          </h1>
          <p className="text-xs text-blue-100/80 mt-0.5">
            Segmentación multicriterio, valuación de flujos futuros al valor presente neto y emisión de lotes de cesión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => {
              const ids = seleccionados.size > 0 ? Array.from(seleccionados) : creditosFiltrados.map((c) => c.ID_Ayuda);
              if (ids.length === 0) {
                alert('No hay créditos seleccionados o filtrados para armar lote.');
                return;
              }
              onAbrirModalCesion(ids, valuacion);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5" />
            <span>Ejecutar Cesión de Cartera ({valuacion.cantidad})</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs de Valuación Financiera VPN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
            Créditos en Muestra / Lote
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {valuacion.cantidad}
          </div>
          <span className="text-[10px] text-slate-400">
            {seleccionados.size > 0 ? 'Seleccionados a mano' : 'Según filtros activos'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight block">
            Flujo Nominal a Cobrar
          </span>
          <div className="text-xl font-black text-blue-800 font-mono mt-1 truncate">
            {formatMonedaAR(valuacion.flujoNominal)}
          </div>
          <span className="text-[10px] text-blue-600">Suma total de cuotas futuras</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-xs bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-tight">
              Precio Venta VPN ({tasaDescuentoMensual}% TEM)
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1 truncate">
            {formatMonedaAR(valuacion.vpnTotal)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Valor Presente Neto</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-tight">
              Quita Financiera / Descuento
            </span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 font-mono mt-1 truncate">
            {formatMonedaAR(valuacion.quitaEstimada)}
          </div>
          <span className="text-[10px] text-amber-600">
            Margen de ganancia cesionario
          </span>
        </div>
      </div>

      {/* Barra de Multifiltros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Tasa Descuento Mensual (%):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={tasaDescuentoMensual}
                onChange={(e) => setTasaDescuentoMensual(Number(e.target.value) || 0)}
                className="w-full py-1.5 pl-3 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:ring-1 focus:ring-[#135596]"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Titularidad de Cartera:
            </label>
            <select
              value={titularidadFiltro}
              onChange={(e) => setTitularidadFiltro(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="PROPIA">Cartera Propia Mutual</option>
              <option value="CEDIDA">Ya Cedidas a Terceros</option>
              <option value="TODAS">Todas las Carteras</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Línea de Ayuda:
            </label>
            <select
              value={lineaFiltro}
              onChange={(e) => setLineaFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="TODAS">Todas las Líneas</option>
              <option value="FEDEM Provincial">FEDEM Provincial</option>
              <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
              <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Estado Cobranza:
            </label>
            <select
              value={estadoCobranzaFiltro}
              onChange={(e) => setEstadoCobranzaFiltro(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="TODAS">Todos los Estados</option>
              <option value="Al Día">Al Día (Sin mora)</option>
              <option value="Mora Temprana">Mora Temprana</option>
              <option value="Mora Tardía">Mora Tardía</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Mínimo Cuotas Restantes:
            </label>
            <input
              type="number"
              min="0"
              value={cuotasRestMin}
              onChange={(e) => setCuotasRestMin(Math.max(0, Number(e.target.value)))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Mínimo Saldo Nominal ($):
            </label>
            <input
              type="number"
              step="50000"
              min="0"
              value={saldoRestMin}
              onChange={(e) => setSaldoRestMin(Math.max(0, Number(e.target.value)))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-purple-700 block mb-1 flex items-center gap-1">
              <Bot className="w-3 h-3" /> Scoring IA Legajo:
            </label>
            <select
              value={scoringMinimoIA}
              onChange={(e) => setScoringMinimoIA(Number(e.target.value))}
              className="w-full py-1.5 px-2.5 text-xs bg-purple-50/50 border border-purple-200 rounded-lg text-purple-900 font-semibold"
            >
              <option value="0">Todos los Scorings</option>
              <option value="90">Solo Alta Calidad (&gt;= 90)</option>
              <option value="75">Calidad Media/Alta (&gt;= 75)</option>
              <option value="60">Aprobados (&gt;= 60)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Créditos Disponibles para Cesión */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={seleccionarTodos}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
              title="Seleccionar / Deseleccionar todos"
            >
              {seleccionados.size === creditosFiltrados.length && creditosFiltrados.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span>
              Créditos Elegibles ({creditosFiltrados.length} encontrados • {seleccionados.size} marcados)
            </span>
          </div>
          <span className="text-slate-400 font-normal">
            Haga clic en las casillas para armar un lote específico
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Mutuo</th>
                <th className="py-2.5 px-3">Socio & DNI</th>
                <th className="py-2.5 px-3">Línea</th>
                <th className="py-2.5 px-3 text-right">Cuota Mensual</th>
                <th className="py-2.5 px-3 text-center">Ctas Rest.</th>
                <th className="py-2.5 px-3 text-right">Saldo Nominal</th>
                <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">Valuación VPN</th>
                <th className="py-2.5 px-3 text-center">Cobranza</th>
                <th className="py-2.5 px-3">Titularidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron créditos que cumplan los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                creditosFiltrados.map((ay) => {
                  const esMarcado = seleccionados.has(ay.ID_Ayuda);
                  const vpn = calcularVPN(ay.Valor_Cuota, ay.Cuotas_Restantes, tasaDescuentoMensual / 100);

                  return (
                    <tr
                      key={ay.ID_Ayuda}
                      onClick={() => toggleSeleccion(ay.ID_Ayuda)}
                      className={`hover:bg-blue-50/50 transition cursor-pointer ${
                        esMarcado ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={esMarcado}
                          onChange={() => toggleSeleccion(ay.ID_Ayuda)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                        {ay.Nro_Mutuo}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-[170px]">
                          {ay.Apellido_Nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">DNI {ay.DNI}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ay.Linea_Ayuda}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {formatMonedaAR(ay.Valor_Cuota)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        {ay.Cuotas_Restantes}/{ay.Cantidad_Cuotas}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {formatMonedaAR(ay.Saldo_Total_Restante)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                        {formatMonedaAR(vpn)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ay.Estado_Cobranza === 'Al Día'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ay.Estado_Cobranza}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[120px]">
                        {ay.Cartera_Titular}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Lotes de Cesión Emitidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Historial de Lotes Cedidos ({cesiones.length})</span>
          <span className="text-slate-400 font-normal">Contratos formalizados y reversiones</span>
        </div>

        <div className="divide-y divide-slate-100">
          {cesiones.map((ces) => (
            <div key={ces.ID_Lote_Cesion} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ces.ID_Lote_Cesion}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ces.Estado_Cesion === 'Vigente'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ces.Estado_Cesion}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Cesionario: {ces.Cesionario_Entidad_Destino}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    (CUIT {ces.CUIT_Cesionario})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-mono">
                  <span>📅 Fecha: {ces.Fecha_Cesion}</span>
                  <span>📊 Créditos: {ces.Cantidad_Creditos_Cedidos}</span>
                  <span>Saldo Nominal: {formatMonedaAR(ces.Saldo_Nominal_Cedido)}</span>
                  <span className="font-bold text-emerald-700">
                    Precio Venta VPN: {formatMonedaAR(ces.Precio_Venta_Cartera)} ({ces.Tasa_Descuento_Aplicada_Pct}% TEM)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setLoteParaDetalle(ces)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                  title="Ver detalle individual de cada mutuo cedido"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalle de Lote</span>
                </button>

                {ces.Estado_Cesion === 'Vigente' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Revertir la cesión ${ces.ID_Lote_Cesion}? Los créditos volverán a la Cartera Propia de la Mutual.`)) {
                        onRevertirCesion(ces.ID_Lote_Cesion);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revertir Cesión</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL DETALLE DE LOTE DE CESIÓN (ITEMIZADO CRÉDITO POR CRÉDITO) */}
      {/* ============================================================== */}
      {loteParaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {loteParaDetalle.ID_Lote_Cesion}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Detalle de Créditos Cedidos en Lote
                </h3>
                <p className="text-xs text-slate-500">
                  Cesionario: <strong>{loteParaDetalle.Cesionario_Entidad_Destino}</strong> • Fecha: {loteParaDetalle.Fecha_Cesion} • Tasa VPN: {loteParaDetalle.Tasa_Descuento_Aplicada_Pct}% TEM
                </p>
              </div>
              <button
                onClick={() => setLoteParaDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Listado de Créditos Itemizados en el Lote */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Mutuo</th>
                    <th className="py-2.5 px-3">Socio / DNI</th>
                    <th className="py-2.5 px-3">Línea</th>
                    <th className="py-2.5 px-3 text-right">Valor Cuota</th>
                    <th className="py-2.5 px-3 text-center">Cuotas Rest.</th>
                    <th className="py-2.5 px-3 text-right">Saldo Cedido</th>
                    <th className="py-2.5 px-3 text-right">VPN Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    let ids: string[] = [];
                    try {
                      ids = JSON.parse(loteParaDetalle.IDs_Ayudas_Cedidas_JSON);
                    } catch {
                      ids = [];
                    }
                    const ayudasEnLote = ayudas.filter((a) => ids.includes(a.ID_Ayuda));

                    if (ayudasEnLote.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            No se pudieron cargar los créditos individuales de este lote.
                          </td>
                        </tr>
                      );
                    }

                    return ayudasEnLote.map((ay) => {
                      const vpnInd = calcularVPN(
                        ay.Valor_Cuota,
                        ay.Cuotas_Restantes,
                        loteParaDetalle.Tasa_Descuento_Aplicada_Pct
                      );
                      return (
                        <tr key={ay.ID_Ayuda} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-800">{ay.Nro_Mutuo}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{ay.Apellido_Nombre}</div>
                            <div className="text-[10px] text-slate-500 font-mono">DNI {ay.DNI}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {ay.Linea_Ayuda}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">
                            {formatMonedaAR(ay.Valor_Cuota)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                            {ay.Cuotas_Restantes}/{ay.Cantidad_Cuotas}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                            {formatMonedaAR(ay.Saldo_Total_Restante)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                            {formatMonedaAR(vpnInd)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Resumen del Lote */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono">
              <div>
                <span>Total Créditos: <strong>{loteParaDetalle.Cantidad_Creditos_Cedidos}</strong></span>
                <span className="ml-4">Saldo Nominal: <strong>{formatMonedaAR(loteParaDetalle.Saldo_Nominal_Cedido)}</strong></span>
              </div>
              <div className="text-right">
                <span>Precio de Venta Total (VPN): <strong className="text-emerald-700 text-sm">{formatMonedaAR(loteParaDetalle.Precio_Venta_Cartera)}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setLoteParaDetalle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
