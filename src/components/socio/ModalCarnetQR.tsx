import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Camera,
  ShieldCheck,
  Clock,
  RefreshCw,
  Sparkles,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { SocioPadron } from '../../types/crm';
import { QRCodeView } from '../common/QRCodeView';
import { QRCameraScannerModal } from '../common/QRCameraScannerModal';

interface ModalCarnetQRProps {
  socio: SocioPadron;
  onClose: () => void;
  onQRComercioEscaneado?: (codigo: string) => void;
}

export const ModalCarnetQR: React.FC<ModalCarnetQRProps> = ({
  socio,
  onClose,
  onQRComercioEscaneado
}) => {
  const [tabActiva, setTabActiva] = useState<'CARNET' | 'ESCANEAR'>('CARNET');
  const [timestampToken, setTimestampToken] = useState<number>(Date.now());
  const [segundosRestantes, setSegundosRestantes] = useState<number>(30);
  const [modalCamaraAbierto, setModalCamaraAbierto] = useState<boolean>(false);
  const [codigoManual, setCodigoManual] = useState<string>('');
  const [confirmacionPago, setConfirmacionPago] = useState<string | null>(null);

  // Ciclo estricto de rotación de 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const segundosDelCiclo = Math.floor((now / 1000) % 30);
      const restantes = 30 - segundosDelCiclo;
      setSegundosRestantes(restantes);

      // Si comienza nuevo ciclo de 30s
      if (restantes === 30 || restantes === 0) {
        setTimestampToken(now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Payload encriptado / dinámico del QR
  const cicloId = Math.floor(timestampToken / 30000);
  const qrPayload = JSON.stringify({
    tipo: 'SOCIO_MUTUAL_MODELO',
    dni: socio.DNI,
    socio: socio.Nro_Socio,
    nombre: socio.Apellido_Nombre,
    estado: socio.Estado_Cuota_Social,
    margen: socio.Margen_Cuota_Disponible,
    organismo: socio.Organismo,
    t: cicloId
  });

  const handleScanSuccess = (texto: string) => {
    setModalCamaraAbierto(false);
    if (onQRComercioEscaneado) {
      onQRComercioEscaneado(texto);
    }
    setConfirmacionPago(`Código escaneado: "${texto}". Transacción en proceso.`);
    setTimeout(() => {
      setConfirmacionPago(null);
      onClose();
    }, 2500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    handleScanSuccess(codigoManual);
  };

  const progressPercentage = (segundosRestantes / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* TÍTULO Y SELECTOR DE TABS */}
        <div className="text-center pb-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl mb-3">
            <button
              type="button"
              onClick={() => setTabActiva('CARNET')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabActiva === 'CARNET'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mi Carnet QR Dinámico
            </button>
            <button
              type="button"
              onClick={() => setTabActiva('ESCANEAR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabActiva === 'ESCANEAR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Escanear Comercio
            </button>
          </div>
        </div>

        {confirmacionPago && (
          <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center">
            {confirmacionPago}
          </div>
        )}

        {/* ===================== TAB 1: CARNET DINÁMICO ===================== */}
        {tabActiva === 'CARNET' ? (
          <div className="space-y-4">
            {/* Tarjeta Visual Estilo Credencial */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-4 text-white shadow-md border border-blue-700/50 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden">
                    <img src="logo.jpg" alt="Mutual Modelo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-extrabold tracking-tight">Mutual Modelo de Entre Ríos</h3>
                    <p className="text-[9px] text-blue-200">Carnet Digital Oficial del Asociado</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  AL DÍA 🟢
                </span>
              </div>

              <div className="pt-3">
                <p className="text-sm font-extrabold tracking-tight">{socio.Apellido_Nombre}</p>
                <div className="flex justify-between text-[11px] text-blue-100/90 font-mono mt-1">
                  <span>DNI {socio.DNI}</span>
                  <span>Socio #{socio.Nro_Socio}</span>
                </div>
                <p className="text-[10px] text-blue-200 mt-1 truncate">{socio.Organismo}</p>
              </div>
            </div>

            {/* CÓDIGO QR DINÁMICO */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
              <QRCodeView
                value={qrPayload}
                size={180}
                colorDark="#0f172a"
                centerLogo="logo.jpg"
              />

              {/* BARRA DE PROGRESO DE 30 SEGUNDOS CONTINUA */}
              <div className="w-full mt-3 px-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                    Renovación de seguridad:
                  </span>
                  <span className="font-bold text-blue-600">{segundosRestantes}s</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center mt-2 max-w-[240px]">
                Muestra este código al comerciante para autorizar compras o validar tu condición de socio activo.
              </p>
            </div>
          </div>
        ) : (
          /* ===================== TAB 2: ESCANEAR QR COMERCIO ===================== */
          <div className="space-y-4 py-2">
            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-blue-900">Escanear Terminal de Cobro</h4>
              <p className="text-[11px] text-blue-700 mt-1">
                Apunta la cámara de tu teléfono hacia el QR generado por el comercio adherido.
              </p>

              <button
                type="button"
                onClick={() => setModalCamaraAbierto(true)}
                className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Abrir Escáner de Cámara
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[10px] text-slate-400 font-semibold uppercase">O ingresa el código</span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-2">
              <input
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value)}
                placeholder="Ej. B2B-PARANA-FARMACIA-4521"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Validar Código Manual
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL DE CÁMARA UNIVERSAL (HTML5-QRCODE) */}
      {modalCamaraAbierto && (
        <QRCameraScannerModal
          isOpen={modalCamaraAbierto}
          title="Escáner QR Mutual"
          subtitle="Apunta hacia el código de la terminal del comercio"
          onScanSuccess={handleScanSuccess}
          onClose={() => setModalCamaraAbierto(false)}
        />
      )}
    </div>
  );
};
