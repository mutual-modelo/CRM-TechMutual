import React from 'react';
import { AyudaEconomica, SocioPadron, OperadorMutual, LineaAyuda } from '../../types/crm';
import {
  simularFEDEM,
  simularMunicipales,
  simularSidecreer,
  formatMonedaAR
} from '../../utils/financialCalculations';
import { X, RefreshCw, AlertCircle } from 'lucide-react';

interface ModalAyudaProps {
  socios: SocioPadron[];
  ayudasExistentes: AyudaEconomica[];
  socioPreseleccionado?: SocioPadron | null;
  planPreseleccionado?: {
    linea: string;
    monto: number;
    cuotas: number;
    valorCuota: number;
    esRefi?: boolean;
    idsCancelados?: string[];
    montoRetenido?: number;
  } | null;
  operadorActivo: OperadorMutual;
  onGuardar: (ayuda: Partial<AyudaEconomica>) => void;
  onCerrar: () => void;
}

export const ModalAyuda: React.FC<ModalAyudaProps> = ({
  socios,
  ayudasExistentes,
  socioPreseleccionado,
  planPreseleccionado,
  operadorActivo,
  onGuardar,
  onCerrar
}) => {
  const [dni, setDni] = React.useState(socioPreseleccionado?.DNI || '');
  const [linea, setLinea] = React.useState<LineaAyuda>(
    (planPreseleccionado?.linea as LineaAyuda) || 'FEDEM Provincial'
  );
  const [montoSolicitado, setMontoSolicitado] = React.useState<number>(
    planPreseleccionado?.monto || 1000000
  );
  const [cantidadCuotas, setCantidadCuotas] = React.useState<number>(
    planPreseleccionado?.cuotas || 12
  );
  const [esRefinanciacion, setEsRefinanciacion] = React.useState<'SI' | 'NO'>(
    planPreseleccionado?.esRefi ? 'SI' : 'NO'
  );
  const [ayudasACancelar, setAyudasACancelar] = React.useState<Set<string>>(
    new Set(planPreseleccionado?.idsCancelados || [])
  );
  const [observaciones, setObservaciones] = React.useState('');

  const socioEncontrado = React.useMemo(() => {
    return socios.find((s) => s.DNI.trim() === dni.trim());
  }, [socios, dni]);

  // Ayudas activas previas del socio con saldo restante > 0
  const ayudasPreviasSocio = React.useMemo(() => {
    if (!dni.trim()) return [];
    return ayudasExistentes.filter(
      (a) =>
        a.DNI === dni.trim() &&
        a.Estado_Tramite === 'Liquidado' &&
        a.Saldo_Total_Restante > 0
    );
  }, [ayudasExistentes, dni]);

  // Cálculo de retención por refinanciación
  const retenidoRefi = React.useMemo(() => {
    if (esRefinanciacion !== 'SI') return 0;
    let sum = 0;
    ayudasPreviasSocio.forEach((a) => {
      if (ayudasACancelar.has(a.ID_Ayuda)) {
        sum += a.Saldo_Total_Restante;
      }
    });
    return sum;
  }, [esRefinanciacion, ayudasPreviasSocio, ayudasACancelar]);

  const netoEnMano = Math.max(0, montoSolicitado - retenidoRefi);

  // Simulación oficial del plan elegido
  const simulacionActual = React.useMemo(() => {
    let list;
    if (linea === 'FEDEM Provincial') {
      list = simularFEDEM('NETO', montoSolicitado);
    } else if (linea === 'Municipalidad (VIKINGO)') {
      list = simularMunicipales('NETO', montoSolicitado);
    } else {
      list = simularSidecreer('NETO', montoSolicitado);
    }
    return list.find((p) => p.plazo === cantidadCuotas) || list[0];
  }, [linea, montoSolicitado, cantidadCuotas]);

  const toggleAyudaCancelada = (id: string) => {
    const next = new Set(ayudasACancelar);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAyudasACancelar(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !socioEncontrado) {
      alert('Por favor ingrese un DNI de socio válido registrado en el padrón.');
      return;
    }

    if (esRefinanciacion === 'SI' && retenidoRefi >= montoSolicitado) {
      alert('El monto solicitado debe ser superior a las deudas que se están refinanciando.');
      return;
    }

    const nuevaAyuda: Partial<AyudaEconomica> = {
      ID_Ayuda: `AYU-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      Fecha_Solicitud: new Date().toISOString().slice(0, 10),
      Periodo_Mes: new Date().toISOString().slice(0, 7),
      DNI: socioEncontrado.DNI,
      Apellido_Nombre: socioEncontrado.Apellido_Nombre,
      Linea_Ayuda: linea,
      Organismo: socioEncontrado.Organismo,
      Originacion: socioEncontrado.Originacion,
      Monto_Solicitado: montoSolicitado,
      Monto_Depositado: montoSolicitado,
      Es_Refinanciacion: esRefinanciacion,
      IDs_Ayudas_Canceladas: Array.from(ayudasACancelar).join(','),
      Monto_Retenido_Refi: retenidoRefi,
      Neto_Efectivo_Entregado: netoEnMano,
      Capital_Bruto: Math.round(simulacionActual.capitalBruto),
      Gastos_Admin: Math.round(simulacionActual.gastosAdmin),
      Seguro_Total: Math.round(simulacionActual.seguroTotal),
      Intereses_Financieros: Math.round(simulacionActual.interesesFinancieros),
      Total_A_Devolver: Math.round(simulacionActual.montoFinalDevolver),
      Cantidad_Cuotas: simulacionActual.plazo,
      Valor_Cuota: Math.round(simulacionActual.valorCuota),
      Cuotas_Pagadas: 0,
      Cuotas_Restantes: simulacionActual.plazo,
      Saldo_Capital_Restante: Math.round(simulacionActual.capitalBruto),
      Saldo_Total_Restante: Math.round(simulacionActual.montoFinalDevolver),
      Estado_Tramite: 'Solicitado',
      Estado_Cobranza: 'Al Día',
      Estado_Documentacion: 'Incompleto',
      Checklist_Doc_JSON: JSON.stringify({
        DNI: true,
        RECIBO: true,
        CBU: true,
        MUTUO: false,
        PAGARE: false,
        LIBRE_DEUDA: false,
        SERVICIO: false
      }),
      Carpeta_Legajo_URL: socioEncontrado.Carpeta_Drive_URL,
      Cartera_Titular: 'Cartera Propia Mutual',
      Observaciones: observaciones,
      Operador: operadorActivo
    };

    onGuardar(nuevaAyuda);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Nueva Solicitud de Ayuda Económica & Refinanciación
          </h3>
          <button onClick={onCerrar} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Identificación del Socio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DNI del Socio (*):</label>
              <input
                type="text"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingrese DNI..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono font-bold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Socio Encontrado:</label>
              <div className="p-2 bg-slate-100 rounded-md font-semibold text-slate-800 truncate">
                {socioEncontrado
                  ? `${socioEncontrado.Apellido_Nombre} (${socioEncontrado.Organismo})`
                  : 'Ingrese un DNI registrado en el padrón'}
              </div>
            </div>
          </div>

          {/* Línea, Monto y Plazo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Línea de Ayuda:</label>
              <select
                value={linea}
                onChange={(e) => {
                  const newLine = e.target.value as LineaAyuda;
                  setLinea(newLine);
                  if (newLine === 'Municipalidad (VIKINGO)' && cantidadCuotas !== 12 && cantidadCuotas !== 24) {
                    setCantidadCuotas(12);
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              >
                <option value="FEDEM Provincial">FEDEM Provincial</option>
                <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
                <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Monto Solicitado ($):</label>
              <input
                type="number"
                value={montoSolicitado}
                onChange={(e) => setMontoSolicitado(Number(e.target.value) || 0)}
                step="50000"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono font-bold text-[#135596]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cantidad de Cuotas:</label>
              <select
                value={cantidadCuotas}
                onChange={(e) => setCantidadCuotas(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-bold focus:outline-none"
              >
                {linea === 'Municipalidad (VIKINGO)' ? (
                  <>
                    <option value="12">12 meses</option>
                    <option value="24">24 meses</option>
                  </>
                ) : (
                  <>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                    <option value="18">18 meses</option>
                    <option value="24">24 meses</option>
                    <option value="36">36 meses</option>
                    <option value="48">48 meses</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Cuadro Resumen del Plan Simulado */}
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Cuota Mensual</span>
              <span className="text-base font-extrabold text-emerald-700">
                {formatMonedaAR(simulacionActual?.valorCuota || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Devolver</span>
              <span className="text-base font-bold text-purple-700">
                {formatMonedaAR(simulacionActual?.montoFinalDevolver || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Capital Bruto</span>
              <span className="text-base font-bold text-slate-700">
                {formatMonedaAR(simulacionActual?.capitalBruto || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Gastos + Seguro</span>
              <span className="text-base font-bold text-slate-700">
                {formatMonedaAR((simulacionActual?.gastosAdmin || 0) + (simulacionActual?.seguroTotal || 0))}
              </span>
            </div>
          </div>

          {/* SECCIÓN DE REFINANCIACIÓN CON CANCELACIÓN AUTOMÁTICA */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>¿Es una Refinanciación de Préstamos Vigentes?</span>
              </label>
              <select
                value={esRefinanciacion}
                onChange={(e) => setEsRefinanciacion(e.target.value as any)}
                className="p-1 px-2 text-xs font-bold bg-slate-100 border border-slate-300 rounded"
              >
                <option value="NO">NO</option>
                <option value="SI">SI</option>
              </select>
            </div>

            {esRefinanciacion === 'SI' && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2">
                <span className="text-xs font-semibold text-amber-900 block">
                  Seleccione las ayudas vigentes del socio que se cancelarán con este nuevo mutuo:
                </span>
                {ayudasPreviasSocio.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">El socio no tiene otros créditos activos con saldo.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {ayudasPreviasSocio.map((a) => (
                      <label
                        key={a.ID_Ayuda}
                        className="flex items-center justify-between p-2 bg-white rounded border border-amber-200 text-xs cursor-pointer hover:bg-amber-50"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={ayudasACancelar.has(a.ID_Ayuda)}
                            onChange={() => toggleAyudaCancelada(a.ID_Ayuda)}
                            className="rounded text-amber-600"
                          />
                          <div>
                            <span className="font-bold text-slate-800">{a.ID_Ayuda}</span>
                            <span className="text-slate-500 text-[11px] ml-2">({a.Linea_Ayuda})</span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-rose-700">
                          Saldo: {formatMonedaAR(a.Saldo_Total_Restante)}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Cálculo de Efectivo en Mano */}
                <div className="pt-2 border-t border-amber-200 flex flex-wrap justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-600">Total Retenido por Refinanciación: </span>
                    <strong className="font-mono text-amber-800 text-sm">{formatMonedaAR(retenidoRefi)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Neto Efectivo a Entregar en Mano: </span>
                    <strong className="font-mono text-emerald-700 text-base font-extrabold">
                      {formatMonedaAR(netoEnMano)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observaciones:</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Notas u origen del trámite..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition"
            >
              Confirmar Solicitud de Ayuda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
