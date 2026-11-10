import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  DollarSign,
  Tag,
  Percent,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  MapPin,
  Clock
} from 'lucide-react';
import { ComercioAlianzaB2B, PromocionPoolReintegro, RubroComercioB2B } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface CrmAlianzasComerciosProps {
  comercios: ComercioAlianzaB2B[];
  promociones: PromocionPoolReintegro[];
  onCrearComercio: (comercio: ComercioAlianzaB2B) => void;
  onActualizarComercio: (comercio: ComercioAlianzaB2B) => void;
  onEliminarComercio: (id: string) => void;
}

export const CrmAlianzasComercios: React.FC<CrmAlianzasComerciosProps> = ({
  comercios,
  promociones,
  onCrearComercio,
  onActualizarComercio,
  onEliminarComercio
}) => {
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [comercioEnEdicion, setComercioEnEdicion] = useState<ComercioAlianzaB2B | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  // Formulario ABM Comercio
  const [nombreFantasia, setNombreFantasia] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [cuit, setCuit] = useState<string>('');
  const [rubro, setRubro] = useState<RubroComercioB2B>('Farmacia');
  const [direccion, setDireccion] = useState<string>('');
  const [arancel, setArancel] = useState<number>(3.5);

  const abrirCrear = () => {
    setComercioEnEdicion(null);
    setNombreFantasia('');
    setRazonSocial('');
    setCuit('');
    setRubro('Farmacia');
    setDireccion('San Martín 600, Paraná');
    setArancel(3.5);
    setModalAbierto(true);
  };

  const abrirEditar = (c: ComercioAlianzaB2B) => {
    setComercioEnEdicion(c);
    setNombreFantasia(c.Nombre_Fantasia);
    setRazonSocial(c.Razon_Social);
    setCuit(c.CUIT_Responsable);
    setRubro(c.Rubro);
    setDireccion(c.Direccion);
    setArancel(c.Arancel_Mutual_Pct);
    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comercioEnEdicion) {
      onActualizarComercio({
        ...comercioEnEdicion,
        Nombre_Fantasia: nombreFantasia,
        Razon_Social: razonSocial,
        CUIT_Responsable: cuit,
        Rubro: rubro,
        Direccion: direccion,
        Arancel_Mutual_Pct: arancel
      });
    } else {
      const nuevo: ComercioAlianzaB2B = {
        ID_Comercio: `COM-${Date.now().toString().slice(-4)}`,
        CUIT_Responsable: cuit,
        Razon_Social: razonSocial || nombreFantasia,
        Nombre_Fantasia: nombreFantasia,
        Rubro: rubro,
        Direccion: direccion,
        Localidad: 'Paraná',
        Telefono_WhatsApp: '0343-4220000',
        Email: 'contacto@comercio.com',
        Arancel_Mutual_Pct: arancel,
        Planes_Cuotas_JSON: '[1, 3, 6, 12]',
        Acepta_Cuenta_Corriente: 'SI',
        Permite_Adelanto_Liquidacion: 'SI',
        Tasa_Descuento_Adelanto_Pct: 3.0,
        PIN_Token_Acceso: '1234',
        Estado: 'Activo',
        Saldo_Ventas_Pendientes: 0,
        Total_Facturado_Historico: 0,
        Fecha_Alta: new Date().toISOString().slice(0, 10),
        Latitud: -31.7333,
        Longitud: -60.5297
      };
      onCrearComercio(nuevo);
    }
    setModalAbierto(false);
  };

  const filtrados = comercios.filter(
    (c) =>
      c.Nombre_Fantasia.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.CUIT_Responsable.includes(busqueda) ||
      c.Rubro.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
            Módulo 6 • Ecosistema Comercial
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Alianzas B2B y Comercios Adheridos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Padrón fiscal de comercios aliados, reglas de cuotas, aranceles y Pool Global de Reintegros.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Comercio Aliado
        </button>
      </div>

      {/* TABLA ABM DE COMERCIOS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, CUIT o rubro..."
            className="p-2 px-3 rounded-2xl border border-slate-200 text-xs bg-slate-50 w-72"
          />
          <span className="text-xs text-slate-500 font-mono">
            {filtrados.length} comercios activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Comercio</th>
                <th className="py-3 px-3">CUIT</th>
                <th className="py-3 px-3">Rubro</th>
                <th className="py-3 px-3">Dirección</th>
                <th className="py-3 px-3">Arancel</th>
                <th className="py-3 px-3">Liquidación Pendiente</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtrados.map((c) => (
                <tr key={c.ID_Comercio} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{c.Nombre_Fantasia}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{c.CUIT_Responsable}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {c.Rubro}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{c.Direccion}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{c.Arancel_Mutual_Pct}%</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {formatMonedaAR(c.Saldo_Ventas_Pendientes || 0)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirEditar(c)}
                      className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] mr-1"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminarComercio(c.ID_Comercio)}
                      className="py-1 px-2 rounded-lg text-rose-500 hover:bg-rose-50 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ABM COMERCIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {comercioEnEdicion ? 'Editar Comercio Aliado' : 'Alta de Comercio Aliado'}
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de Fantasía</label>
                <input
                  type="text"
                  required
                  value={nombreFantasia}
                  onChange={(e) => setNombreFantasia(e.target.value)}
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rubro</label>
                  <select
                    value={rubro}
                    onChange={(e) => setRubro(e.target.value as RubroComercioB2B)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="Farmacia">Farmacia</option>
                    <option value="Óptica">Óptica</option>
                    <option value="Motos & Movilidad">Motos & Movilidad</option>
                    <option value="Electro & Hogar">Electro & Hogar</option>
                    <option value="Proveeduría">Proveeduría</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dirección Comercial</label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Arancel %</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={arancel}
                  onChange={(e) => setArancel(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Guardar Comercio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
