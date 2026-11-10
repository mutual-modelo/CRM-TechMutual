import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { Comercializador, LiquidacionComision } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface CrmComercializadoresProps {
  comercializadores: Comercializador[];
  liquidaciones: LiquidacionComision[];
  onCrearComercializador: (com: Comercializador) => void;
  onActualizarComercializador: (com: Comercializador) => void;
}

export const CrmComercializadores: React.FC<CrmComercializadoresProps> = ({
  comercializadores,
  liquidaciones,
  onCrearComercializador,
  onActualizarComercializador
}) => {
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [enEdicion, setEnEdicion] = useState<Comercializador | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  // Formulario ABM
  const [nombre, setNombre] = useState<string>('');
  const [cuit, setCuit] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [porcentaje, setPorcentaje] = useState<number>(5.0);
  const [baseCalculo, setBaseCalculo] = useState<'Neto_Efectivo_Entregado' | 'Monto_Solicitado' | 'Capital_Bruto'>('Neto_Efectivo_Entregado');

  const abrirCrear = () => {
    setEnEdicion(null);
    setNombre('');
    setCuit('');
    setTelefono('');
    setPorcentaje(5.0);
    setBaseCalculo('Neto_Efectivo_Entregado');
    setModalAbierto(true);
  };

  const abrirEditar = (c: Comercializador) => {
    setEnEdicion(c);
    setNombre(c.Nombre_Estudio_Agente);
    setCuit(c.DNI_CUIT);
    setTelefono(c.Telefono);
    setPorcentaje(c.Porcentaje_Comision);
    setBaseCalculo(c.Base_Calculo_Comision);
    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enEdicion) {
      onActualizarComercializador({
        ...enEdicion,
        Nombre_Estudio_Agente: nombre,
        DNI_CUIT: cuit,
        Telefono: telefono,
        Porcentaje_Comision: porcentaje,
        Base_Calculo_Comision: baseCalculo
      });
    } else {
      const nuevo: Comercializador = {
        ID_Comercializador: `COM-${Date.now().toString().slice(-4)}`,
        Nombre_Estudio_Agente: nombre,
        DNI_CUIT: cuit,
        Telefono: telefono,
        Email: 'agente@mutualmodelo.com.ar',
        CBU_Pago: '0070012300000000000000',
        Base_Calculo_Comision: baseCalculo,
        Porcentaje_Comision: porcentaje,
        Estado: 'Activo',
        Fecha_Alta: new Date().toISOString().slice(0, 10),
        Observaciones: 'Alta desde Backoffice'
      };
      onCrearComercializador(nuevo);
    }
    setModalAbierto(false);
  };

  const filtrados = comercializadores.filter(
    (c) =>
      c.Nombre_Estudio_Agente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.DNI_CUIT.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
            Módulo 4 • Canales de Distribución
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Padrón de Comercializadores y Comisiones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de asesores comerciales externos, bases de liquidación y comisiones por colocación.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Comercializador
        </button>
      </div>

      {/* LISTADO DE COMERCIALIZADORES */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar asesor por nombre o CUIT..."
            className="p-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 w-72"
          />
          <span className="text-xs text-slate-500 font-mono">
            {filtrados.length} comercializadores registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Asesor / Comercializador</th>
                <th className="py-3 px-3">CUIT</th>
                <th className="py-3 px-3">Teléfono</th>
                <th className="py-3 px-3">Base de Cálculo</th>
                <th className="py-3 px-3">% Comisión</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtrados.map((c) => (
                <tr key={c.ID_Comercializador} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{c.Nombre_Estudio_Agente}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{c.DNI_CUIT}</td>
                  <td className="py-3 px-3 text-slate-600">{c.Telefono}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {c.Base_Calculo_Comision}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    {c.Porcentaje_Comision}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirEditar(c)}
                      className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ABM COMERCIALIZADOR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {enEdicion ? 'Editar Comercializador' : 'Alta de Comercializador'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo / Agencia</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">CUIT</label>
                  <input
                    type="text"
                    required
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Base de Cálculo de Comisión</label>
                <select
                  value={baseCalculo}
                  onChange={(e) => setBaseCalculo(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                >
                  <option value="Neto_Efectivo_Entregado">Neto Efectivo Entregado al Socio</option>
                  <option value="Monto_Solicitado">Monto Solicitado</option>
                  <option value="Capital_Bruto">Capital Bruto con Gastos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">% Porcentaje Comisión</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="20"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Guardar Comercializador
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
