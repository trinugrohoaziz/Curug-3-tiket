import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Check,
  ExternalLink,
  X,
  Share2,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Pasang di HP Android (.APK / PWA)
              </h3>
              <p className="text-[10px] text-emerald-400">Siap Pakai • Data Masih Bersih (0 Tiket)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Status Clean Data Notification */}
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-300 text-xs">
                Data Aplikasi Bersih & Kosong
              </p>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                Aplikasi telah diatur dengan <strong>data kosong (0 transaksi)</strong>, siap langsung digunakan petugas loket di pintu masuk Curug Telu & Sendang Bidadari.
              </p>
            </div>
          </div>

          {/* OPSI 1: Pasang Langsung 1 Ketukan (WebAPK Android) */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cara 1: Pasang Langsung di HP Android
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                Paling Cepat
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Buka aplikasi ini di <strong>Google Chrome HP Android</strong>, lalu:
            </p>

            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>INSTALL KE HP SEKARANG</span>
              </button>
            ) : (
              <div className="space-y-1.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <p className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Buka tautan ini di <strong>Chrome Android</strong></span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>Ketuk menu titik tiga <strong>[⋮]</strong> di pojok kanan atas Chrome</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Pilih <strong>&quot;Install aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong></span>
                </p>
              </div>
            )}

            <p className="text-[10px] text-slate-400">
              *Aplikasi akan terpasang di menu utama HP Android Anda dengan ikon resmi Curug Telu, layar penuh tanpa bar browser, dan bekerja offline.
            </p>
          </div>

          {/* OPSI 2: Link PWABuilder untuk Build File .APK Mandiri */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Cara 2: Unduh File .APK Mandiri
            </span>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Jika Anda memerlukan file mentah <strong>.APK</strong> untuk dibagikan via WhatsApp atau disimpan:
            </p>

            <a
              href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka PWABuilder & Download .APK</span>
            </a>
          </div>

          {/* Tombol Bagikan Link ke WhatsApp HP Kasir */}
          <div className="pt-1">
            <button
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Tautan Aplikasi Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Salin Tautan untuk Dibuka di HP Android</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
