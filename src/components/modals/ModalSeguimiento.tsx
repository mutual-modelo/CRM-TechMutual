import React from 'react';
import { SeguimientoAlerta, SocioPadron, OperadorMutual, PrioridadAlerta } from '../../types/crm';
import { OPERADORES_MUTUAL_LISTA } from '../../data/seedData';
import { X, Bell } from 'lucide-react';

interface ModalSeguimientoProps {
  socios: SocioPadron[];
  operadorActivo: OperadorMutual;
  onGuardar: (seguimiento: Partial<SeguimientoAlerta>) => void;
  onCerrar: () => void;
}

export const ModalSeguimiento: React.FC<ModalSeguimientoProps> = ({
  socios,
  operadorActivo,
  onGuardar,
  onCerrar
}) => {
  const [dni, setDni] = React.useState('');
  const [prioridad, setPrioridad] = React.useState<PrioridadAlerta>('Media');
  const [categoria, setCategoria] = React.useState<'Alerta SLA' | 'Seguimiento' | 'Cobranzas' | 'Comercial'>('Alerta SLA');
  const [subtipo, setSubtipo] = React.useState('Falta Firma Mutuo / Pagaré');
  const [fechaVencimiento, setFechaVencimiento] = React.useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [detalle, setDetalle] = React.useState('');
  const [operadorAsignado, setOperadorAsignado] = React.useState<OperadorMutual>(operadorActivo);

  const socioEncontrado = React.useMemo(() => {
    return socios.find((s) => s.DNI.trim() === dni.trim());
  }, [socios, dni]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !detalle.trim()) {
      alert('Por favor complete DNI del socio y detalle de la gestión.');
      return;
    }

    onGuardar({
      ID_Seguimiento: `SEG-${Date.now()}`,
      Fecha_Hora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI: dni.trim(),
      Apellido_Nombre: socioEncontrado ? socioEncontrado.Apellido_Nombre : 'Socio DNI ' + dni,
      Tipo_Registro: 'Alerta Trámite',
      Categoria: categoria,
      Subtipo_Tramite: subtipo,
      Prioridad: prioridad,
      Fecha_Vencimiento_Alerta: fechaVencimiento,
      Estado_Alerta: 'Pendiente',
      Detalle_Gestion: detalle,
      Resultado_Proximo_Paso: '',
      Operador_Asignado: operadorAsignado,
      Operador_Creador: operadorActivo,
      Notificado_WhatsApp: 'NO'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Nueva Alerta / Seguimiento SLA</span>
          </h3>
          <button onClick={onCerrar} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">DNI del Socio (*):</label>
            <input
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 28456123..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono font-bold"
            />
            {socioEncontrado && (
              <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
                Socio: {socioEncontrado.Apellido_Nombre} ({socioEncontrado.Organismo})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Prioridad:</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
              >
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Categoría:</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
              >
                <option value="Alerta SLA">Alerta SLA</option>
                <option value="Seguimiento">Seguimiento Trámite</option>
                <option value="Cobranzas">Cobranzas</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fecha Vencimiento:</label>
              <input
                type="date"
                required
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operador Asignado:</label>
              <select
                value={operadorAsignado}
                onChange={(e) => setOperadorAsignado(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
              >
                {OPERADORES_MUTUAL_LISTA.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Subtipo de Trámite:</label>
            <input
              type="text"
              value={subtipo}
              onChange={(e) => setSubtipo(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Detalle de la Gestión (*):</label>
            <textarea
              required
              rows={3}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Indique las acciones a realizar con el socio..."
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
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md"
            >
              Guardar Alerta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
