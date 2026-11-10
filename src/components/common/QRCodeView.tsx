import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, QrCode as QrIcon } from 'lucide-react';

interface QRCodeViewProps {
  value: string;
  size?: number;
  title?: string;
  subtext?: string;
  showDownload?: boolean;
  colorDark?: string;
  colorLight?: string;
  centerLogo?: string;
  className?: string;
}

const QRCodeViewComponent: React.FC<QRCodeViewProps> = ({
  value,
  size = 200,
  title,
  subtext,
  showDownload = false,
  colorDark = '#135596',
  colorLight = '#ffffff',
  centerLogo = './logo.jpg',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for Retina sharpness
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight
      },
      errorCorrectionLevel: 'H' // High error correction to allow center logo overlay
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error generando QR code:', err);
        if (isMounted) setError('Error al generar código QR');
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, colorDark, colorLight]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${(title || 'Mutual_Modelo').replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      {title && (
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 text-center">
          {title}
        </h4>
      )}

      <div className="relative p-2 bg-white rounded-xl border border-slate-100 shadow-inner flex items-center justify-center" style={{ width: size, height: size }}>
        {dataUrl ? (
          <>
            <img
              src={dataUrl}
              alt="Código QR"
              className="w-full h-full object-contain rounded-lg"
            />
            {centerLogo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 bg-white rounded-full p-1 shadow-md border border-slate-200 flex items-center justify-center">
                  <img
                    src={centerLogo}
                    alt="Logo"
                    className="w-7 h-7 object-contain rounded-full"
                    onError={(e) => {
                      // Fallback si no carga la imagen
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : error ? (
          <div className="text-center p-2 text-rose-500 text-xs">
            <QrIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-1 text-[#135596]" />
            <span className="text-[10px]">Generando QR...</span>
          </div>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-500 mt-2 text-center max-w-[220px] font-mono leading-tight">
          {subtext}
        </p>
      )}

      {showDownload && dataUrl && (
        <button
          onClick={handleDownload}
          className="mt-2.5 px-3 py-1 bg-slate-100 hover:bg-[#135596] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar PNG</span>
        </button>
      )}
    </div>
  );
};

export const QRCodeView = React.memo(QRCodeViewComponent);
