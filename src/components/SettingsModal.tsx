import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  Check,
  Users,
  Info,
  Smartphone,
  Trash2,
  Sparkles,
  Download,
} from 'lucide-react';
import { TouristSpotConfig, Employee } from '../types';
import { AndroidInstallModal } from './AndroidInstallModal';

interface SettingsModalProps {
  config: TouristSpotConfig;
  employees: Employee[];
  onSaveConfig: (newConfig: TouristSpotConfig) => void;
  onResetData: () => void;
  onLoadDemoData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  employees,
  onSaveConfig,
  onResetData,
  onLoadDemoData,
}) => {
  const [spotName, setSpotName] = useState(config.spotName);
  const [tagline, setTagline] = useState(config.tagline);
  const [location, setLocation] = useState(config.location);
  const [ticketPrice, setTicketPrice] = useState(config.ticketPrice.toString());
  const [cashierName, setCashierName] = useState(config.cashierName);
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TouristSpotConfig = {
      spotName: spotName.trim() || 'Wisata Curug Telu & Sendang Bidadari',
      tagline: tagline.trim(),
      location: location.trim(),
      ticketPrice: parseInt(ticketPrice, 10) || 7000,
      cashierName: cashierName.trim() || 'Loket Curug Telu',
      receiptFooter: receiptFooter.trim(),
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Banner Install APK / HP */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-2xl p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Pasang di HP Android (.APK)</h3>
              <p className="text-[10px] text-emerald-300">Data saat ini bersih (0 tiket), siap kerja</p>
            </div>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      </div>

      {/* Form Pengaturan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-400" />
            Pengaturan Aplikasi & Loket
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Tarif Rp 7.000 / org
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Nama Objek Wisata
            </label>
            <input
              type="text"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Lokasi / Alamat
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Harga Tiket (Rp / Orang)
              </label>
              <input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Nama Petugas Kasir Loket
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Slogan / Deskripsi Singkat
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Catatan Kaki Struk Tiket
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-md shadow-emerald-950/40"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Pengaturan Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Karyawan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Users className="w-4 h-4 text-indigo-400" />
            Daftar Karyawan ({employees.length} Orang)
          </h4>
          <span className="text-[10px] text-slate-400">Absensi di Laporan Harian</span>
        </div>
        <div className="space-y-1.5">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-200">{emp.name}</span>
              <span className="text-[10px] text-slate-400">{emp.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pengelolaan Data: Kosongkan Data / Muat Demo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5 text-xs">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <Trash2 className="w-4 h-4 text-rose-400" />
          Manajemen Data Loket
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {/* Reset Kosong Bersih */}
          <button
            onClick={() => {
              if (confirm('Kosongkan semua transaksi dan laporan? Data akan kembali bersih (0 tiket) untuk loket riil.')) {
                onResetData();
              }
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-700/60 text-left transition cursor-pointer"
          >
            <p className="font-bold text-rose-400 text-xs">Kosongkan Data (0 Tiket)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Mulai loket baru tanpa riwayat</p>
          </button>

          {/* Muat Simulasi Demo */}
          {onLoadDemoData && (
            <button
              onClick={() => {
                if (confirm('Muat contoh data simulasi 7 hari untuk melihat tampilan laporan lengkap?')) {
                  onLoadDemoData();
                }
              }}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-700/60 text-left transition cursor-pointer"
            >
              <p className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Muat Data Contoh
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Isi simulasi 7 hari transaksi</p>
            </button>
          )}
        </div>
      </div>

      {/* Modal Install APK */}
      <AndroidInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
