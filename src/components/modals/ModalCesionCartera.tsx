import React from 'react';
import { formatMonedaAR } from '../../utils/financialCalculations';
import { X, Handshake, CheckCircle } from 'lucide-react';

interface ModalCesionCarteraProps {
  idsSeleccionados: string[];
  resumenValuacion: {
    cantidad: number;
    capitalOriginal: number;
    flujoNominal: number;
    vpnTotal: number;
    quitaEstimada: number;
    tasaDescuentoMensual: number;
  };
  onConfirmar: (payload: any) => void;
  onCerrar: () => void;
}

export const ModalCesionCartera: React.FC<ModalCesionCarteraProps> = ({
  idsSeleccionados,
  resumenValuacion,
  onConfirmar,
  onCerrar
}) => {
  const [entidad, setEntidad] = React.useState('Fideicomiso Financiero Entre Ríos I');
  const [cuit, setCuit] = React.useState('30-71892019-3');
  const [precioAcordado, setPrecioAcordado] = React.useState<number>(resumenValuacion.vpnTotal);
  const [modalidad, setModalidad] = React.useState('Retención por Recibo CGE');
  const [observaciones, setObservaciones] = React.useState('Cesión de cartera aprobada por Comisión Directiva.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entidad.trim() || !precioAcordado) {
      alert('Por favor complete la entidad cesionaria y el precio de venta acordado.');
      return;
    }

    onConfirmar({
      cesionarioEntidad: entidad,
      cuitCesionario: cuit,
      idsAyudasSeleccionadas: idsSeleccionados,
      totalMontoOriginal: resumenValuacion.capitalOriginal,
      totalCuotasRestantes: 0,
      saldoNominalCedido: resumenValuacion.flujoNominal,
      tasaDescuentoAplicadaPct: resumenValuacion.tasaDescuentoMensual,
      precioVentaAcordado: Number(precioAcordado) || resumenValuacion.vpnTotal,
      modalidadCobranza: modalidad,
      observaciones: observaciones
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-emerald-600" />
            <span>Formalizar Lote de Cesión de Cartera</span>
          </h3>
          <button onClick={onCerrar} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Resumen de la Cartera a Ceder */}
          <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Créditos a Ceder:</span>
              <strong className="text-slate-800 text-sm font-mono">{idsSeleccionados.length} operaciones</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Flujo Nominal Restante:</span>
              <strong className="text-purple-700 text-sm font-mono">{formatMonedaAR(resumenValuacion.flujoNominal)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">VPN Descontado ({resumenValuacion.tasaDescuentoMensual}% m.):</span>
              <strong className="text-emerald-700 text-sm font-mono">{formatMonedaAR(resumenValuacion.vpnTotal)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Quita de Valuación:</span>
              <strong className="text-rose-700 text-sm font-mono">{formatMonedaAR(resumenValuacion.quitaEstimada)}</strong>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Entidad Cesionaria / Fideicomiso (*):</label>
            <input
              type="text"
              required
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CUIT Cesionario:</label>
              <input
                type="text"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Precio Venta Acordado ($):</label>
              <input
                type="number"
                required
                value={precioAcordado}
                onChange={(e) => setPrecioAcordado(Number(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono font-bold text-emerald-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Modalidad de Cobranza:</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
            >
              <option value="Retención por Recibo CGE">Retención por Recibo CGE</option>
              <option value="Cobranza por CBU BERSA">Cobranza por CBU BERSA</option>
              <option value="Cesión Plena">Cesión Plena sin Recurso</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observaciones / Dictamen:</label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-3 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-xs transition"
            >
              Firmar y Ceder Cartera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
