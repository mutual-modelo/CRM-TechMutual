import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import {
  Camera,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  SwitchCamera,
  Store,
  UserCheck,
  VideoOff,
  Keyboard,
  ShieldCheck,
  Upload,
  FileImage,
  Lock
} from 'lucide-react';

interface QRCameraScannerModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  expectedType?: 'COMERCIO' | 'SOCIO' | 'CUALQUIERA';
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRCameraScannerModal: React.FC<QRCameraScannerModalProps> = ({
  isOpen,
  title = 'Escanear Código QR con Cámara',
  subtitle = 'Apunte la cámara hacia el código QR para procesar la transacción',
  expectedType = 'CUALQUIERA',
  onScanSuccess,
  onClose
}) => {
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerId = 'html5qr-code-region-portal';

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraInitializing, setCameraInitializing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSecureContextEnv, setIsSecureContextEnv] = useState<boolean>(true);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [processingFile, setProcessingFile] = useState<boolean>(false);

  // Limpiar escáner de forma segura
  const detenerEscaner = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (isScanningRef.current) {
          await scannerInstanceRef.current.stop();
        }
        await scannerInstanceRef.current.clear();
      } catch (err) {
        console.warn('Advertencia al detener Html5Qrcode:', err);
      } finally {
        isScanningRef.current = false;
        scannerInstanceRef.current = null;
      }
    }
    setCameraActive(false);
    setCameraInitializing(false);
  };

  // Iniciar detección y escaneo multi-capa
  const iniciarEscaner = async (forcedCameraId?: string) => {
    await detenerEscaner();
    setCameraError(null);
    setCameraInitializing(true);

    // Verificación de Contexto Seguro (HTTPS / Localhost)
    const isSecure =
      typeof window !== 'undefined' &&
      (window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'https:');

    setIsSecureContextEnv(isSecure);

    if (!isSecure) {
      setCameraError(
        'El acceso a la cámara requiere una conexión segura (HTTPS o localhost). Puede cargar una imagen del QR o ingresar el código manualmente.'
      );
      setCameraInitializing(false);
      setCameraActive(false);
      return;
    }

    try {
      // CAPA 1: Detección por enumeración mediante Html5Qrcode.getCameras()
      let cameras: CameraDevice[] = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (getCamerasErr: any) {
        console.warn('Advertencia en Html5Qrcode.getCameras():', getCamerasErr);
      }

      // Si getCameras no devolvió lista, intentar navigator.mediaDevices.enumerateDevices()
      if ((!cameras || cameras.length === 0) && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          cameras = videoDevices.map((vd, idx) => ({
            id: vd.deviceId,
            label: vd.label || `Cámara ${idx + 1}`
          }));
        } catch (_enumErr) {
          // Ignorar y manejar abajo
        }
      }

      setAvailableCameras(cameras);

      // CAPA 2: Smart Fallback de Constraints
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      let targetCameraConfig: string | { facingMode: string } =
        cameras.length > 0 ? cameras[0].id : { facingMode: 'environment' };

      if (forcedCameraId) {
        targetCameraConfig = forcedCameraId;
      } else if (isMobile) {
        // En celular intentar cámara trasera
        const rearCamera = cameras.find((c) =>
          /back|rear|trasera|environment|posterior|externa/i.test(c.label)
        );
        targetCameraConfig = rearCamera
          ? rearCamera.id
          : cameras.length > 0
          ? cameras[cameras.length - 1].id
          : { facingMode: 'environment' };
      } else {
        // En PC / Laptop / Webcam USB: usar deviceId directo para evitar OverconstrainedError
        targetCameraConfig = cameras.length > 0 ? cameras[0].id : { facingMode: 'user' };
      }

      if (typeof targetCameraConfig === 'string') {
        setSelectedCameraId(targetCameraConfig);
      }

      // Inicializar instancia de Html5Qrcode
      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      scannerInstanceRef.current = html5QrCode;

      try {
        // Intentar iniciar con la configuración elegida
        await html5QrCode.start(
          targetCameraConfig,
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText: string) => {
            handleProcesarResultado(decodedText);
          },
          (_errorMessage: string) => {
            // Cuadro sin QR: comportamiento esperado
          }
        );
      } catch (firstStartErr: any) {
        console.warn('Reintentando con fallback básico { video: true }...', firstStartErr);
        // Fallback defensivo si OverconstrainedError ocurre (común en PC / USB webcams)
        const fallbackConfig = cameras.length > 0 ? cameras[0].id : (true as any);
        await html5QrCode.start(
          fallbackConfig,
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText: string) => {
            handleProcesarResultado(decodedText);
          },
          (_errorMessage: string) => {}
        );
      }

      isScanningRef.current = true;
      setCameraActive(true);
      setCameraInitializing(false);
    } catch (err: any) {
      console.warn('Error definitivo en inicialización de cámara:', err);
      const errMsg = err?.message || String(err);

      if (/NotAllowedError|Permission|denied|Permiso/i.test(errMsg)) {
        setCameraError(
          'Permiso de video denegado en el navegador. Por favor autorice el acceso a la cámara o utilice la carga de imagen / ingreso manual.'
        );
      } else if (/NotFoundError|DevicesNotFoundError|no device/i.test(errMsg)) {
        setCameraError(
          'No se detectó cámara activa conectada. Puede subir una foto del código QR o ingresar el código manualmente.'
        );
      } else if (/OverconstrainedError|constraint/i.test(errMsg)) {
        setCameraError(
          'El dispositivo no admite los parámetros de video solicitados. Puede alternar de cámara o cargar una foto del QR.'
        );
      } else {
        setCameraError(
          'No se pudo activar la transmisión de video. Dispone de carga de imagen de QR o ingreso manual a continuación.'
        );
      }

      isScanningRef.current = false;
      setCameraActive(false);
      setCameraInitializing(false);
    }
  };

  // Alternar entre cámaras disponibles
  const alternarCamara = async () => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await iniciarEscaner(nextCamera.id);
  };

  // CAPA 3: Subir Imagen de QR (scanFile)
  const handleSubirArchivoQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingFile(true);
    setCameraError(null);

    try {
      // Detener escáner de cámara si estuviera activo para liberar recursos
      await detenerEscaner();

      const html5QrCode = new Html5Qrcode('html5qr-file-helper', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      handleProcesarResultado(decodedText);
    } catch (err: any) {
      console.warn('Error al decodificar QR desde imagen:', err);
      setCameraError(
        'No se encontró un código QR legible en la imagen seleccionada. Pruebe con una imagen más nítida o ingrese el código manualmente.'
      );
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Efecto de apertura/cierre
  useEffect(() => {
    if (!isOpen) {
      detenerEscaner();
      setScannedResult(null);
      setCameraError(null);
      return;
    }

    const timeout = setTimeout(() => {
      iniciarEscaner();
    }, 120);

    return () => {
      clearTimeout(timeout);
      detenerEscaner();
    };
  }, [isOpen]);

  // Manejo del código detectado
  const handleProcesarResultado = (codigo: string) => {
    setScannedResult(codigo);

    // Beep sintético suave de confirmación
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (_e) {
      // Ignorar restricciones de audio
    }

    setTimeout(() => {
      detenerEscaner();
      onScanSuccess(codigo);
      onClose();
    }, 550);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Helper invisible para scanFile */}
        <div id="html5qr-file-helper" style={{ display: 'none' }} />

        {/* Input oculto para subir archivo de imagen */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSubirArchivoQR}
        />

        {/* Cabecera del Escáner */}
        <div className="p-4 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#135596] to-blue-500 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold border border-emerald-500/30">
                  Universal v5.3
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-sans">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              detenerEscaner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advertencia de Contexto Inseguro si aplicara */}
        {!isSecureContextEnv && (
          <div className="p-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2 text-amber-200 text-xs px-4">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Modo HTTP detectado:</strong> El acceso a la cámara requiere HTTPS. Utilice
              el botón "Subir Imagen de QR" o el ingreso manual.
            </span>
          </div>
        )}

        {/* Visor de Cámara y Contenedor Html5Qrcode */}
        <div className="relative bg-black min-h-[290px] max-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Contenedor DOM para la librería Html5Qrcode */}
          <div
            id={containerId}
            className="w-full h-full flex items-center justify-center"
            style={{ minHeight: '290px' }}
          />

          {/* Loader mientras inicializa o procesa archivo */}
          {(cameraInitializing || processingFile) && !cameraError && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-6 z-10">
              <RefreshCw className="w-8 h-8 text-[#135596] animate-spin mb-2" />
              <span className="text-xs font-bold text-white">
                {processingFile ? 'Analizando archivo de imagen...' : 'Detectando cámara activa...'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {processingFile
                  ? 'Decodificando código QR con motor de visión'
                  : 'Webcam PC / USB / Smartphone con soporte HTTPS'}
              </span>
            </div>
          )}

          {/* Marco de Enfoque con Láser de Escaneo */}
          {cameraActive && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="relative w-60 h-60 rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.35)] overflow-hidden">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Haz Láser Animado */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_12px_#34d399]" />

                <div className="absolute bottom-2.5 inset-x-0 text-center">
                  <span className="text-[10px] font-mono tracking-wider font-semibold text-emerald-300 bg-slate-900/85 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    CENTRE EL CÓDIGO QR AQUÍ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notificación amigable si no se detectó cámara o denegó permisos (CAPA 3) */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center z-20">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2.5">
                <VideoOff className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Cámara no disponible o permisos pendientes
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mb-3.5 leading-relaxed font-sans">
                {cameraError}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => iniciarEscaner()}
                  className="px-3 py-1.5 bg-[#135596] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reintentar Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto de QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Notificación de Éxito al Detectar QR */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-30 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
              <h4 className="text-base font-bold text-white">¡Código QR Detectado con Éxito!</h4>
              <p className="text-xs text-emerald-200 font-mono mt-1 break-all max-w-xs bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-500/40">
                {scannedResult}
              </p>
              <span className="text-[11px] text-emerald-300 mt-2 font-medium">
                Procesando transacción mutual...
              </span>
            </div>
          )}

          {/* Botones Flotantes Superiores: Alternar Cámara y Subir Imagen */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Subir archivo o foto de QR desde el equipo"
              className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-full border border-slate-600/80 shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </button>

            {cameraActive && availableCameras.length > 1 && (
              <button
                type="button"
                onClick={alternarCamara}
                title="Cambiar dispositivo de cámara"
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-600/80 shadow-md transition-all cursor-pointer"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Panel Inferior: Entrada Manual y Atajos Rápidos de Simulación */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Atajos Rápidos de Prueba (Zero Friction)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileImage className="w-3.5 h-3.5" />
              <span>Subir Foto QR</span>
            </button>
          </div>

          {/* Botones de simulación según el tipo esperado */}
          <div className="grid grid-cols-2 gap-2">
            {(expectedType === 'COMERCIO' || expectedType === 'CUALQUIERA') && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleProcesarResultado(
                      'QR_COMERCIO:COM-B2B-001|MONTO:18500|RUBRO:Farmacia|REINTEGRO:25%'
                    )
                  }
                  className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/60 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-0.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Farmacia Modelo ($18.500)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Simula QR de mostrador con 25% de reintegro en medicamentos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleProcesarResultado(
                      'QR_COMERCIO:COM-B2B-002|MONTO:34200|RUBRO:Proveeduría|REINTEGRO:20%'
                    )
                  }
                  className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/60 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-0.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Proveeduría Belgrano ($34.200)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Simula QR en caja de alimentos y proveeduría en 3 cuotas.
                  </p>
                </button>
              </>
            )}

            {(expectedType === 'SOCIO' || expectedType === 'CUALQUIERA') && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleProcesarResultado(
                      'QR_SOCIO:28456123|NOMBRE:BENITEZ, MARÍA LAURA|CUOTA:AL_DIA|TOTP:841920'
                    )
                  }
                  className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/60 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-0.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Credencial María L. Benítez</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    DNI 28456123 • Carnet digital con Cuota al Día y TOTP 30s.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleProcesarResultado(
                      'QR_SOCIO:31920445|NOMBRE:RAMÍREZ, HÉCTOR DANIEL|CUOTA:AL_DIA|TOTP:319082'
                    )
                  }
                  className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/60 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Credencial Héctor Ramírez</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    DNI 31920445 • Policía Entre Ríos • Margen $195.000.
                  </p>
                </button>
              </>
            )}
          </div>

          {/* Ingreso manual defensivo de código / DNI */}
          <div className="pt-2 border-t border-slate-800 flex gap-2 items-center">
            <div className="relative flex-1">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualInput.trim()) {
                    handleProcesarResultado(manualInput.trim());
                  }
                }}
                placeholder="Ingresar DNI o texto QR manualmente..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="button"
              disabled={!manualInput.trim()}
              onClick={() => handleProcesarResultado(manualInput.trim())}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Procesar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
