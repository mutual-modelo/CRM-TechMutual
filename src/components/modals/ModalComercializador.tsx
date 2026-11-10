import React from 'react';
import { Comercializador } from '../../types/crm';
import { X, Briefcase } from 'lucide-react';

interface ModalComercializadorProps {
  onGuardar: (comercializador: Partial<Comercializador>) => void;
  onCerrar: () => void;
}

export const ModalComercializador: React.FC<ModalComercializadorProps> = ({
  onGuardar,
  onCerrar
}) => {
  const [nombre, setNombre] = React.useState('');
  const [cuit, setCuit] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [cbu, setCbu] = React.useState('');
  const [base, setBase] = React.useState<'Capital_Bruto' | 'Neto_Efectivo_Entregado' | 'Monto_Solicitado'>('Neto_Efectivo_Entregado');
  const [pct, setPct] = React.useState<number>(4.5);
  const [obs, setObs] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cuit.trim()) {
      alert('Por favor complete Nombre y CUIT del comercializador.');
      return;
    }

    onGuardar({
      ID_Comercializador: `COM-${Math.floor(100 + Math.random() * 900)}`,
      Nombre_Estudio_Agente: nombre,
      DNI_CUIT: cuit,
      Telefono: telefono,
      Email: email,
      CBU_Pago: cbu,
      Base_Calculo_Comision: base,
      Porcentaje_Comision: Number(pct) || 4.5,
      Estado: 'Activo',
      Fecha_Alta: new Date().toISOString().slice(0, 10),
      Observaciones: obs
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#135596]" />
            <span>Nuevo Comercializador / Agente</span>
          </h3>
          <button onClick={onCerrar} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nombre Estudio / Agente (*):</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Estudio Jurídico Paraná..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CUIT (*):</label>
              <input
                type="text"
                required
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="30-..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Teléfono:</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="343..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Base de Cálculo:</label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-200 rounded-md font-medium"
              >
                <option value="Neto_Efectivo_Entregado">Neto Efectivo Entregado</option>
                <option value="Capital_Bruto">Capital Bruto</option>
                <option value="Monto_Solicitado">Monto Solicitado</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Comisión (%):</label>
              <input
                type="number"
                step="0.1"
                value={pct}
                onChange={(e) => setPct(Number(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">CBU de Pago Comisiones:</label>
            <input
              type="text"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
              placeholder="086..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
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
              className="px-4 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white font-bold rounded-md"
            >
              Guardar Comercializador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
