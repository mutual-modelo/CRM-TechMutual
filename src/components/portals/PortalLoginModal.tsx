import React, { useState } from 'react';
import { SocioPadron, ComercioAlianzaB2B, OperadorMutual, SesionUsuario, PortalType } from '../../types/crm';
import {
  User,
  Store,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound,
  Send,
  Sparkles,
  Smartphone,
  X
} from 'lucide-react';

interface PortalLoginModalProps {
  isOpen: boolean;
  portalInicial?: PortalType;
  socios: SocioPadron[];
  comercios: ComercioAlianzaB2B[];
  operadores: readonly string[];
  onLoginExitoso: (sesion: SesionUsuario, portalDestino: PortalType) => void;
  onActualizarClaveSocio: (dni: string, nuevaClave: string) => void;
  onActualizarClaveComercio: (cuit: string, nuevaClave: string) => void;
  onClose: () => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  portalInicial = 'portal-socio-app',
  socios,
  comercios,
  operadores,
  onLoginExitoso,
  onActualizarClaveSocio,
  onActualizarClaveComercio,
  onClose
}) => {
  const [tabLogin, setTabLogin] = useState<'socio' | 'comercio' | 'operador'>(
    portalInicial === 'portal-comercio-b2b'
      ? 'comercio'
      : portalInicial === 'portal-crm-admin'
      ? 'operador'
      : 'socio'
  );

  // Estados Formulario Socio
  const [dniSocio, setDniSocio] = useState('');
  const [claveSocio, setClaveSocio] = useState('');
  const [showClaveSocio, setShowClaveSocio] = useState(false);
  const [modalResetSocio, setModalResetSocio] = useState(false);
  const [modalPrimerIngreso, setModalPrimerIngreso] = useState(false);
  const [resetDni, setResetDni] = useState('');
  const [resetTelefono, setResetTelefono] = useState('');
  const [resetPaso, setResetPaso] = useState<'PEDIR_DATOS' | 'TOKEN_ENVIADO' | 'EXITO'>('PEDIR_DATOS');
  const [resetNuevaClave, setResetNuevaClave] = useState('');
  const [tokenSimulado, setTokenSimulado] = useState('7841');
  const [tokenIngresado, setTokenIngresado] = useState('');

  // Estados Formulario Comercio
  const [cuitComercio, setCuitComercio] = useState('');
  const [claveComercio, setClaveComercio] = useState('');
  const [showClaveComercio, setShowClaveComercio] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('Casa Central Paraná');

  // Estados Formulario Operador
  const [operadorSeleccionado, setOperadorSeleccionado] = useState<OperadorMutual>('Julian');
  const [pinOperador, setPinOperador] = useState('1234');

  // Feedback de error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Manejador Login Socio
  const handleLoginSocio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const socio = socios.find((s) => s.DNI === dniSocio.trim());
    if (!socio) {
      setErrorMsg(`No se encontró ningún asociado registrado con el DNI ${dniSocio}.`);
      return;
    }

    const claveEsperada = socio.Clave_Acceso_Hash || '1234';
    if (claveSocio !== claveEsperada && claveSocio !== '1234') {
      setErrorMsg('Clave de acceso incorrecta. Recuerde que para pruebas la clave predeterminada es "1234".');
      return;
    }

    const sesion: SesionUsuario = {
      tipo: 'SOCIO_APP',
      idUsuario: socio.DNI,
      nombre: socio.Apellido_Nombre,
      rol: 'Socio Activo Mutual',
      fechaIngreso: new Date().toISOString()
    };

    onLoginExitoso(sesion, 'portal-socio-app');
    onClose();
  };

  // Manejador Login Comercio
  const handleLoginComercio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const com = comercios.find(
      (c) => c.CUIT_Responsable.replace(/[^0-9]/g, '') === cuitComercio.replace(/[^0-9]/g, '') || c.CUIT_Responsable === cuitComercio.trim()
    );

    if (!com) {
      setErrorMsg(`No se encontró comercio registrado con el CUIT ${cuitComercio}.`);
      return;
    }

    const claveEsperada = com.Clave_Acceso_B2B_Hash || com.PIN_Token_Acceso || 'admin123';
    if (claveComercio !== claveEsperada && claveComercio !== 'admin123' && claveComercio !== com.PIN_Token_Acceso) {
      setErrorMsg(`Clave B2B incorrecta para ${com.Nombre_Fantasia}. Clave de prueba: "admin123" o PIN "${com.PIN_Token_Acceso}".`);
      return;
    }

    const sesion: SesionUsuario = {
      tipo: 'COMERCIO_B2B',
      idUsuario: com.CUIT_Responsable,
      nombre: com.Nombre_Fantasia,
      rol: `Comercio Aliado - ${com.Rubro}`,
      sucursal: sucursalSeleccionada,
      fechaIngreso: new Date().toISOString()
    };

    onLoginExitoso(sesion, 'portal-comercio-b2b');
    onClose();
  };

  // Manejador Login Operador CRM
  const handleLoginOperador = (e: React.FormEvent) => {
    e.preventDefault();
    const sesion: SesionUsuario = {
      tipo: 'OPERADOR_CRM',
      idUsuario: operadorSeleccionado,
      nombre: `Operador ${operadorSeleccionado}`,
      rol: 'Backoffice & Tesorería Mutual',
      fechaIngreso: new Date().toISOString()
    };

    onLoginExitoso(sesion, 'portal-crm-admin');
    onClose();
  };

  // Restablecer clave Socio
  const handleSolicitarTokenReset = (e: React.FormEvent) => {
    e.preventDefault();
    const socio = socios.find((s) => s.DNI === resetDni.trim());
    if (!socio) {
      alert('DNI no encontrado en el padrón.');
      return;
    }
    setResetTelefono(socio.Telefono_WhatsApp);
    setResetPaso('TOKEN_ENVIADO');
  };

  const handleConfirmarNuevaClave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenIngresado.trim() !== tokenSimulado && tokenIngresado.trim() !== '1234') {
      alert('Token inválido. Ingrese el código 7841 enviado por WhatsApp.');
      return;
    }
    if (resetNuevaClave.length < 4) {
      alert('La clave debe contener al menos 4 caracteres.');
      return;
    }

    onActualizarClaveSocio(resetDni.trim(), resetNuevaClave.trim());
    setResetPaso('EXITO');
    setTimeout(() => {
      setModalResetSocio(false);
      setDniSocio(resetDni.trim());
      setClaveSocio(resetNuevaClave.trim());
      setResetPaso('PEDIR_DATOS');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header con Isotipo */}
        <div className="p-5 bg-gradient-to-r from-[#135596] to-blue-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="./logo.jpg"
              alt="Mutual Modelo"
              className="w-11 h-11 object-contain rounded-xl bg-white p-1 shadow-sm"
            />
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-blue-200 uppercase block">
                CONTROL DE ACCESO SEGURO
              </span>
              <h3 className="text-lg font-extrabold tracking-tight">Mutual Modelo Entre Ríos</h3>
            </div>
          </div>

          {/* Selector de Experiencia / Rol */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 bg-black/20 p-1 rounded-2xl">
            <button
              onClick={() => {
                setTabLogin('socio');
                setErrorMsg(null);
              }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
                tabLogin === 'socio'
                  ? 'bg-white text-[#135596] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Socio (App)</span>
            </button>

            <button
              onClick={() => {
                setTabLogin('comercio');
                setErrorMsg(null);
              }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
                tabLogin === 'comercio'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Comercio B2B</span>
            </button>

            <button
              onClick={() => {
                setTabLogin('operador');
                setErrorMsg(null);
              }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
                tabLogin === 'operador'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Operador CRM</span>
            </button>
          </div>
        </div>

        {/* Contenido / Formularios */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN SOCIO */}
          {tabLogin === 'socio' && (
            <form onSubmit={handleLoginSocio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  N° de Documento (DNI)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={dniSocio}
                    onChange={(e) => setDniSocio(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ej: 28456123"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#135596] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Clave de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetDni(dniSocio);
                      setModalResetSocio(true);
                    }}
                    className="text-[11px] font-semibold text-[#135596] hover:underline"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showClaveSocio ? 'text' : 'password'}
                    required
                    value={claveSocio}
                    onChange={(e) => setClaveSocio(e.target.value)}
                    placeholder="Clave numérica o alfanumérica"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#135596] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaveSocio(!showClaveSocio)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showClaveSocio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#135596] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Ingresar a mi Billetera</span>
              </button>

              {/* Botones de Prueba Rápida de Socios */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Accesos Directos de Prueba (Demo 1-Click):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDniSocio('28456123');
                      setClaveSocio('1234');
                    }}
                    className="p-2 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 rounded-xl text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-blue-900 truncate">
                      María Laura Benítez
                    </div>
                    <div className="text-[10px] text-blue-700 font-mono">DNI 28456123 • Clave: 1234</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDniSocio('31920445');
                      setClaveSocio('1234');
                    }}
                    className="p-2 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 rounded-xl text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-emerald-900 truncate">
                      Héctor Daniel Ramírez
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono">DNI 31920445 • Clave: 1234</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: LOGIN COMERCIO */}
          {tabLogin === 'comercio' && (
            <form onSubmit={handleLoginComercio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CUIT del Comercio Adherido
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={cuitComercio}
                    onChange={(e) => setCuitComercio(e.target.value)}
                    placeholder="Ej: 30-68912345-8"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sucursal / Terminal de Cobro
                </label>
                <select
                  value={sucursalSeleccionada}
                  onChange={(e) => setSucursalSeleccionada(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                >
                  <option value="Casa Central Paraná">Casa Central Paraná (Caja 01)</option>
                  <option value="Sucursal Peatonal San Martín">Sucursal Peatonal San Martín (Caja 02)</option>
                  <option value="Terminal Móvil Mostrador">Terminal Móvil Mostrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clave de Acceso B2B / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showClaveComercio ? 'text' : 'password'}
                    required
                    value={claveComercio}
                    onChange={(e) => setClaveComercio(e.target.value)}
                    placeholder="Clave B2B o PIN de acceso"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaveComercio(!showClaveComercio)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showClaveComercio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Ingresar al Portal Comercio B2B</span>
              </button>

              {/* Botones de Prueba Rápida de Comercios */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Comercios de Prueba (Demo 1-Click):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCuitComercio('30-68912345-8');
                      setClaveComercio('admin123');
                    }}
                    className="p-2 bg-purple-50/80 hover:bg-purple-100/90 border border-purple-200 rounded-xl text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-purple-900 truncate">
                      Farmacia Modelo Central
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono">CUIT: 30-68912345-8</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCuitComercio('30-55918234-9');
                      setClaveComercio('admin123');
                    }}
                    className="p-2 bg-purple-50/80 hover:bg-purple-100/90 border border-purple-200 rounded-xl text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-purple-900 truncate">
                      Proveeduría Belgrano
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono">CUIT: 30-55918234-9</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN OPERADOR CRM */}
          {tabLogin === 'operador' && (
            <form onSubmit={handleLoginOperador} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operador Oficial de Mutual Modelo
                </label>
                <select
                  value={operadorSeleccionado}
                  onChange={(e) => setOperadorSeleccionado(e.target.value as OperadorMutual)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#135596] focus:outline-none"
                >
                  {operadores.map((op) => (
                    <option key={op} value={op}>
                      Operador: {op} (Oficial Mutual)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PIN de Acceso / Certificado Operador
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={pinOperador}
                    onChange={(e) => setPinOperador(e.target.value)}
                    placeholder="PIN numérico"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#135596] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Ingresar al Backoffice CRM</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal de Restablecer Clave por WhatsApp */}
        {modalResetSocio && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 z-20 flex flex-col justify-between animate-in fade-in duration-150">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#135596]" />
                  <span>Restablecer Clave de Acceso</span>
                </h4>
                <button
                  onClick={() => setModalResetSocio(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetPaso === 'PEDIR_DATOS' && (
                <form onSubmit={handleSolicitarTokenReset} className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ingrese su DNI. Se verificará su registro en el padrón y se enviará un código de verificación vía WhatsApp a su línea registrada.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">N° de DNI</label>
                    <input
                      type="text"
                      required
                      value={resetDni}
                      onChange={(e) => setResetDni(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Ingrese su DNI"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#135596]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar PIN por WhatsApp</span>
                  </button>
                </form>
              )}

              {resetPaso === 'TOKEN_ENVIADO' && (
                <form onSubmit={handleConfirmarNuevaClave} className="space-y-3">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                    Código de seguridad enviado al WhatsApp asociado: <strong>{resetTelefono || '343-***-1290'}</strong>.
                    <div className="mt-1 text-[11px] text-emerald-700 font-mono">
                      (Para esta demostración el código es: <strong>{tokenSimulado}</strong>)
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código de 4 dígitos</label>
                    <input
                      type="text"
                      required
                      value={tokenIngresado}
                      onChange={(e) => setTokenIngresado(e.target.value)}
                      placeholder="Ej: 7841"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center tracking-widest focus:outline-none focus:border-[#135596]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Clave de Acceso</label>
                    <input
                      type="password"
                      required
                      value={resetNuevaClave}
                      onChange={(e) => setResetNuevaClave(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#135596]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#135596] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmar y Cambiar Clave</span>
                  </button>
                </form>
              )}

              {resetPaso === 'EXITO' && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">¡Clave Actualizada con Éxito!</h4>
                  <p className="text-xs text-slate-500 mt-1">Redirigiendo al formulario de ingreso...</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalResetSocio(false)}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold text-center"
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
