import React from 'react';
import { SocioPadron, OperadorMutual } from '../../types/crm';
import { X } from 'lucide-react';

interface ModalSocioProps {
  socioAEditar?: SocioPadron | null;
  operadorActivo: OperadorMutual;
  onGuardar: (socio: Partial<SocioPadron>) => void;
  onCerrar: () => void;
}

export const ModalSocio: React.FC<ModalSocioProps> = ({
  socioAEditar,
  operadorActivo,
  onGuardar,
  onCerrar
}) => {
  const [formData, setFormData] = React.useState<Partial<SocioPadron>>({
    DNI: socioAEditar?.DNI || '',
    Nro_Socio: socioAEditar?.Nro_Socio || `SOC-${Math.floor(10000 + Math.random() * 90000)}`,
    Apellido_Nombre: socioAEditar?.Apellido_Nombre || '',
    Fecha_Nacimiento: socioAEditar?.Fecha_Nacimiento || '1985-05-15',
    Sexo: socioAEditar?.Sexo || 'F',
    Domicilio: socioAEditar?.Domicilio || '',
    Localidad: socioAEditar?.Localidad || 'Paraná',
    Telefono_WhatsApp: socioAEditar?.Telefono_WhatsApp || '',
    Email: socioAEditar?.Email || '',
    CBU_Alias: socioAEditar?.CBU_Alias || '',
    Banco: socioAEditar?.Banco || 'Banco de Entre Ríos (BERSA)',
    Organismo: socioAEditar?.Organismo || 'Consejo General de Educación (CGE)',
    Sector_Trabajo: socioAEditar?.Sector_Trabajo || '',
    Dependencia_Funcion: socioAEditar?.Dependencia_Funcion || '',
    Condicion_Laboral: socioAEditar?.Condicion_Laboral || 'Planta Permanente',
    Sueldo_Bruto: socioAEditar?.Sueldo_Bruto || 1200000,
    Afectaciones_Ley: socioAEditar?.Afectaciones_Ley || 228000,
    Afectaciones_Particulares: socioAEditar?.Afectaciones_Particulares || 140000,
    Bloqueado_Legales: socioAEditar?.Bloqueado_Legales || 'NO',
    Detalle_Legales: socioAEditar?.Detalle_Legales || '',
    En_Tramite_Jubilacion: socioAEditar?.En_Tramite_Jubilacion || 'NO',
    Detalle_Jubilacion: socioAEditar?.Detalle_Jubilacion || '',
    Pagos_Duplicados: socioAEditar?.Pagos_Duplicados || 'NO',
    Detalle_Pagos_Duplicados: socioAEditar?.Detalle_Pagos_Duplicados || '',
    Alivio_Financiero: socioAEditar?.Alivio_Financiero || 'NO',
    Mutuales_Alivio: socioAEditar?.Mutuales_Alivio || '',
    Certificacion_Deuda: socioAEditar?.Certificacion_Deuda || 'NO',
    Detalle_Certificacion: socioAEditar?.Detalle_Certificacion || '',
    Estado_Cuota_Social: socioAEditar?.Estado_Cuota_Social || 'Al Día',
    Originacion: socioAEditar?.Originacion || 'Orgánica',
    Operador: operadorActivo
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.DNI || !formData.Apellido_Nombre) {
      alert('Por favor complete DNI y Apellido/Nombre.');
      return;
    }

    const bruto = Number(formData.Sueldo_Bruto) || 0;
    const ley = Number(formData.Afectaciones_Ley) || 0;
    const part = Number(formData.Afectaciones_Particulares) || 0;
    const neto = bruto - ley - part;
    const margen = Math.max(0, Math.round((bruto - ley) * 0.35 - part));

    onGuardar({
      ...formData,
      Sueldo_Neto: neto,
      Margen_Cuota_Disponible: margen,
      Monto_Preaprobado: margen * 10,
      Ultima_Actualizacion: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            {socioAEditar ? 'Editar Ficha del Asociado' : 'Alta de Nuevo Asociado'}
          </h3>
          <button onClick={onCerrar} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DNI (*):</label>
              <input
                type="text"
                required
                value={formData.DNI}
                onChange={(e) => setFormData({ ...formData, DNI: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">N° Socio:</label>
              <input
                type="text"
                value={formData.Nro_Socio}
                onChange={(e) => setFormData({ ...formData, Nro_Socio: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Apellido y Nombre (*):</label>
              <input
                type="text"
                required
                value={formData.Apellido_Nombre}
                onChange={(e) => setFormData({ ...formData, Apellido_Nombre: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fecha Nacimiento:</label>
              <input
                type="date"
                value={formData.Fecha_Nacimiento}
                onChange={(e) => setFormData({ ...formData, Fecha_Nacimiento: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sexo:</label>
              <select
                value={formData.Sexo}
                onChange={(e) => setFormData({ ...formData, Sexo: e.target.value as any })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              >
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp:</label>
              <input
                type="text"
                value={formData.Telefono_WhatsApp}
                onChange={(e) => setFormData({ ...formData, Telefono_WhatsApp: e.target.value })}
                placeholder="343..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Organismo:</label>
              <input
                type="text"
                value={formData.Organismo}
                onChange={(e) => setFormData({ ...formData, Organismo: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sector de Trabajo:</label>
              <input
                type="text"
                value={formData.Sector_Trabajo}
                onChange={(e) => setFormData({ ...formData, Sector_Trabajo: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Condición Laboral:</label>
              <select
                value={formData.Condicion_Laboral}
                onChange={(e) => setFormData({ ...formData, Condicion_Laboral: e.target.value as any })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              >
                <option value="Planta Permanente">Planta Permanente</option>
                <option value="Contratado">Contratado</option>
                <option value="Jubilado/Pensionado">Jubilado/Pensionado</option>
                <option value="Monotributista">Monotributista</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sueldo Bruto ($):</label>
              <input
                type="number"
                value={formData.Sueldo_Bruto}
                onChange={(e) => setFormData({ ...formData, Sueldo_Bruto: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Afectaciones Ley ($):</label>
              <input
                type="number"
                value={formData.Afectaciones_Ley}
                onChange={(e) => setFormData({ ...formData, Afectaciones_Ley: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono font-bold text-rose-700"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Afectaciones Particulares ($):</label>
              <input
                type="number"
                value={formData.Afectaciones_Particulares}
                onChange={(e) => setFormData({ ...formData, Afectaciones_Particulares: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono font-bold text-amber-700"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-800 mb-2">Banderas y Bloqueos de Gestión</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bloqueado Legales:</label>
                <select
                  value={formData.Bloqueado_Legales}
                  onChange={(e) => setFormData({ ...formData, Bloqueado_Legales: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SI</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trámite Jubilación:</label>
                <select
                  value={formData.En_Tramite_Jubilacion}
                  onChange={(e) => setFormData({ ...formData, En_Tramite_Jubilacion: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SI</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pagos Duplicados:</label>
                <select
                  value={formData.Pagos_Duplicados}
                  onChange={(e) => setFormData({ ...formData, Pagos_Duplicados: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SI</option>
                </select>
              </div>
            </div>
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
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#135596] hover:bg-[#0d3b68] rounded-md shadow-xs transition"
            >
              Guardar Asociado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
