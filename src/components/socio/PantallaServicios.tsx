import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldAlert,
  Home,
  Smile,
  Palmtree,
  Calendar,
  CheckCircle2,
  X,
  Clock,
  Upload,
  ArrowRight,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { SocioPadron, SubsidioYConsumo } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

interface PantallaServiciosProps {
  socio: SocioPadron;
  onRegistrarTramite: (tramite: { tipo: string; detalle: string; monto?: number }) => void;
}

type ModalServicioType = 'SUBSIDIOS' | 'SEGUROS' | 'SALONES' | 'ODONTOLOGIA' | 'TURISMO' | null;

export const PantallaServicios: React.FC<PantallaServiciosProps> = ({
  socio,
  onRegistrarTramite
}) => {
  const [modalActivo, setModalActivo] = useState<ModalServicioType>(null);
  const [toastExito, setToastExito] = useState<string | null>(null);

  // Formulario Subsidios
  const [subsidioTipo, setSubsidioTipo] = useState<string>('Nacimiento ($120.000)');
  const [subsidioArchivo, setSubsidioArchivo] = useState<string>('acta_nacimiento.pdf');

  // Formulario Seguros
  const [seguroPlan, setSeguroPlan] = useState<string>('Plan Integral Familiar + Sepelio');

  // Formulario Salones
  const [salonSeleccionado, setSalonSeleccionado] = useState<string>('Quincho Los Aromos (Cap. 80 personas)');
  const [salonFecha, setSalonFecha] = useState<string>('2026-12-15');
  const [salonInvitados, setSalonInvitados] = useState<number>(45);

  // Formulario Odontología
  const [odontoEspecialista, setOdontoEspecialista] = useState<string>('Dra. Silvina Romero (Ortodoncia y Estética)');
  const [odontoFecha, setOdontoFecha] = useState<string>('2026-11-20');
  const [odontoHorario, setOdontoHorario] = useState<string>('16:30 hs');

  // Formulario Turismo
  const [turismoDestino, setTurismoDestino] = useState<string>('Bariloche Clásico - 7 Noches Hotel 4*');

  const dispararExito = (msg: string) => {
    setToastExito(msg);
    setModalActivo(null);
    setTimeout(() => setToastExito(null), 3000);
  };

  const handleSubsidioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegistrarTramite({
      tipo: 'Subsidio Mutual',
      detalle: `${subsidioTipo} - Comprobante: ${subsidioArchivo}`,
      monto: 120000
    });
    dispararExito('¡Solicitud de subsidio ingresada con éxito!');
  };

  const handleSeguroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegistrarTramite({
      tipo: 'Adhesión Seguros',
      detalle: `Alta en ${seguroPlan}`
    });
    dispararExito('¡Adhesión al seguro procesada!');
  };

  const handleSalonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegistrarTramite({
      tipo: 'Reserva de Salón',
      detalle: `${salonSeleccionado} para fecha ${salonFecha} (${salonInvitados} invitados)`
    });
    dispararExito('¡Solicitud de reserva de salón reservada!');
  };

  const handleOdontoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegistrarTramite({
      tipo: 'Turno Odontológico',
      detalle: `Turno con ${odontoEspecialista} el ${odontoFecha} a las ${odontoHorario}`
    });
    dispararExito('¡Turno odontológico agendado con éxito!');
  };

  const handleTurismoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegistrarTramite({
      tipo: 'Consulta Turismo',
      detalle: `Interés en paquete ${turismoDestino}`
    });
    dispararExito('¡Consulta de turismo enviada a la coordinación!');
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-4 animate-in fade-in duration-300">
      {/* HEADER DE SERVICIOS */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Beneficios y Coberturas</span>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Servicios al Asociado</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gestiona trámites, reservas de salones y prestaciones con tu cuota social.
        </p>
      </div>

      {toastExito && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastExito}</span>
        </div>
      )}

      {/* GRILLA TÁCTIL DE SERVICIOS ESTILO FINTECH */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* 1. Subsidios */}
        <div
          onClick={() => setModalActivo('SUBSIDIOS')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Subsidios Extraordinarios</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">100% Bonificado</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Nacimiento, casamiento, escolaridad y fallecimiento</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>

        {/* 2. Seguros y Coberturas */}
        <div
          onClick={() => setModalActivo('SEGUROS')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Seguros y Cobertura Integral</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Grupo Familiar</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Sepelio, vida y accidentes personales 24/7</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>

        {/* 3. Salones de Eventos */}
        <div
          onClick={() => setModalActivo('SALONES')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Home className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Salones y Quinchos Sociales</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">Tarifa Socio</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Eventos familiares, cumpleaños y reuniones en Paraná</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </div>

        {/* 4. Clínica Odontológica y Estética */}
        <div
          onClick={() => setModalActivo('ODONTOLOGIA')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smile className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Odontología y Estética</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">Consultorios Propios</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Turnos online, ortodoncia e implantes en cuotas</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>

        {/* 5. Turismo Mutual */}
        <div
          onClick={() => setModalActivo('TURISMO')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Palmtree className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Turismo Federal Mutual</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">12 Cuotas Fijas</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Paquetes a Bariloche, Carlos Paz, Mar del Plata y Cataratas</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
      </div>

      {/* ===================== MODALES INTERACTIVOS DE CADA SERVICIO ===================== */}

      {/* MODAL 1: SUBSIDIOS */}
      {modalActivo === 'SUBSIDIOS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Solicitar Subsidio</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubsidioSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Subsidio</label>
                <select
                  value={subsidioTipo}
                  onChange={(e) => setSubsidioTipo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                >
                  <option value="Nacimiento ($120.000)">Nacimiento ($120.000)</option>
                  <option value="Casamiento ($150.000)">Casamiento ($150.000)</option>
                  <option value="Escolaridad Anual ($80.000)">Escolaridad Anual ($80.000)</option>
                  <option value="Ayuda Óptica / Anteojos ($90.000)">Ayuda Óptica / Anteojos ($90.000)</option>
                  <option value="Fallecimiento Familiar Directo ($200.000)">Fallecimiento Familiar Directo ($200.000)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Comprobante de Respaldo</label>
                <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-[11px] font-semibold text-slate-700">{subsidioArchivo}</p>
                  <p className="text-[10px] text-slate-400">PDF, JPG o PNG hasta 10MB</p>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Ingresar Solicitud de Subsidio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEGUROS */}
      {modalActivo === 'SEGUROS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Coberturas Mutual</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSeguroSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plan Seleccionado</label>
                <select
                  value={seguroPlan}
                  onChange={(e) => setSeguroPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                >
                  <option value="Plan Integral Familiar + Sepelio">Plan Integral Familiar + Sepelio ($4.200/mes)</option>
                  <option value="Accidentes Personales 24hs">Accidentes Personales 24hs ($3.100/mes)</option>
                  <option value="Cobertura de Salud Odontológica Plus">Cobertura de Salud Odontológica Plus ($3.800/mes)</option>
                </select>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                Se debitará mensualmente de tu recibo de haberes bajo concepto de Coberturas Solidarias.
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Confirmar Adhesión al Seguro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SALONES */}
      {modalActivo === 'SALONES' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Reserva de Salón</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSalonSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instalación</label>
                <select
                  value={salonSeleccionado}
                  onChange={(e) => setSalonSeleccionado(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                >
                  <option value="Quincho Los Aromos (Cap. 80 personas)">Quincho Los Aromos (Cap. 80 personas)</option>
                  <option value="Salón Principal Mutual Modelo (Cap. 200 personas)">Salón Principal Mutual Modelo (Cap. 200 personas)</option>
                  <option value="Espacio Terraza & Parrilla (Cap. 40 personas)">Espacio Terraza & Parrilla (Cap. 40 personas)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={salonFecha}
                    onChange={(e) => setSalonFecha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Invitados</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={salonInvitados}
                    onChange={(e) => setSalonInvitados(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Solicitar Reserva de Salón
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ODONTOLOGÍA */}
      {modalActivo === 'ODONTOLOGIA' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Agenda Odontológica</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleOdontoSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Profesional / Especialidad</label>
                <select
                  value={odontoEspecialista}
                  onChange={(e) => setOdontoEspecialista(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                >
                  <option value="Dra. Silvina Romero (Ortodoncia y Estética)">Dra. Silvina Romero (Ortodoncia y Estética)</option>
                  <option value="Dr. Marcos Benítez (Odontología General y Cirugía)">Dr. Marcos Benítez (Odontología General y Cirugía)</option>
                  <option value="Dra. Paula Varela (Odontopediatría)">Dra. Paula Varela (Odontopediatría)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={odontoFecha}
                    onChange={(e) => setOdontoFecha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Horario</label>
                  <select
                    value={odontoHorario}
                    onChange={(e) => setOdontoHorario(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                  >
                    <option value="09:00 hs">09:00 hs</option>
                    <option value="11:30 hs">11:30 hs</option>
                    <option value="16:30 hs">16:30 hs</option>
                    <option value="18:00 hs">18:00 hs</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Confirmar Turno Odontológico
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: TURISMO */}
      {modalActivo === 'TURISMO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Turismo Mutual Modelo</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTurismoSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Destino Promo</label>
                <select
                  value={turismoDestino}
                  onChange={(e) => setTurismoDestino(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800"
                >
                  <option value="Bariloche Clásico - 7 Noches Hotel 4*">Bariloche Clásico - 7 Noches Hotel 4*</option>
                  <option value="Villa Carlos Paz - 5 Noches con Pensión Completa">Villa Carlos Paz - 5 Noches con Pensión Completa</option>
                  <option value="Mar del Plata Verano - 7 Noches frente al mar">Mar del Plata Verano - 7 Noches frente al mar</option>
                  <option value="Cataratas del Iguazú - 4 Noches con Excursiones">Cataratas del Iguazú - 4 Noches con Excursiones</option>
                </select>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                Financiación exclusiva en hasta 12 cuotas fijas descontadas por recibo de haberes.
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Consultar e Iniciar Reserva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
