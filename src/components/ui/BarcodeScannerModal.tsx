import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        // Success
        if (scannerRef.current && scannerRef.current.isScanning) {
           scannerRef.current.stop().then(() => {
             onScan(decodedText);
             onClose();
           }).catch(console.error);
        }
      },
      (errorMessage) => {
        // Parse error, usually just ignore it as it scans continuously
      }
    ).catch((err) => {
      setError('No se pudo acceder a la cámara. Revisa los permisos.');
      console.error(err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
          <h3 className="headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">barcode_scanner</span>
            Escanear Código
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 flex flex-col items-center bg-surface">
          {error ? (
            <div className="text-error text-center mb-4 p-4 bg-error-container/30 rounded-lg w-full">
              <span className="material-symbols-outlined text-3xl mb-2">no_photography</span>
              <p className="label-md">{error}</p>
            </div>
          ) : (
            <p className="body-md text-on-surface-variant mb-4 text-center">
              Apunta la cámara al código de barras del producto.
            </p>
          )}
          
          <div className="w-full bg-black rounded-lg overflow-hidden relative shadow-inner flex items-center justify-center">
            <div id="reader" className="w-full" style={{ minHeight: '300px' }} />
          </div>
          
          <div className="mt-6 flex w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/50 text-on-surface label-md hover:bg-surface-container-low transition-colors active:scale-[0.98]">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
