import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Minus,
  Banknote,
  QrCode,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, PaymentMethod, GuestCategory, TouristSpotConfig } from '../types';
import { formatRupiah, formatNumber, generateTicketCode, getIsoDateOnly } from '../utils/formatters';
import { playBeep, playSuccessChime } from '../utils/audio';

interface PosTicketCounterProps {
  config: TouristSpotConfig;
  onTransactionComplete: (trx: Transaction) => void;
  todaySummary: {
    totalTickets: number;
    cashRevenue: number;
    transferRevenue: number;
  };
}

export const PosTicketCounter: React.FC<PosTicketCounterProps> = ({
  config,
  onTransactionComplete,
  todaySummary,
}) => {
  const [guestCount, setGuestCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [guestName, setGuestName] = useState<string>('');
  const [originCity, setOriginCity] = useState<string>('');
  const [category, setCategory] = useState<GuestCategory>('Keluarga');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const unitPrice = config.ticketPrice || 7000;
  const ticketSubtotal = useMemo(() => guestCount * unitPrice, [guestCount, unitPrice]);
  const transferAdminFee = paymentMethod === 'TRANSFER' ? 1000 : 0;
  const totalAmount = useMemo(() => ticketSubtotal + transferAdminFee, [ticketSubtotal, transferAdminFee]);

  // Fast cash presets
  const quickCashPresets = useMemo(() => {
    const list = new Set<number>();
    list.add(totalAmount);
    [10000, 20000, 50000, 100000, 200000, 500000].forEach((nom) => {
      if (nom >= totalAmount) list.add(nom);
    });
    return Array.from(list).sort((a, b) => a - b).slice(0, 5);
  }, [totalAmount]);

  const cashChange = useMemo(() => {
    if (cashGiven === '' || typeof cashGiven !== 'number') return 0;
    return cashGiven - totalAmount;
  }, [cashGiven, totalAmount]);

  const isCashInsufficient = paymentMethod === 'CASH' && (cashGiven === '' || cashGiven < totalAmount);

  const handleAdjustCount = (delta: number) => {
    playBeep();
    setGuestCount((prev) => Math.max(1, Math.min(500, prev + delta)));
  };

  const handleSetQuickCount = (count: number) => {
    playBeep();
    setGuestCount(count);
  };

  const handleResetForm = () => {
    setGuestCount(1);
    setPaymentMethod('CASH');
    setCashGiven('');
    setGuestName('');
    setOriginCity('');
    setCategory('Keluarga');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestCount < 1) return;
    if (paymentMethod === 'CASH' && isCashInsufficient) {
      alert(`Uang tunai kurang ${formatRupiah(Math.abs(cashChange))}! Masukkan uang tunai yang cukup.`);
      return;
    }

    setIsSubmitting(true);
    playSuccessChime();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    const now = new Date();
    const todayStr = getIsoDateOnly(now);
    const code = generateTicketCode(todaySummary.totalTickets + 1);

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      ticketCode: code,
      timestamp: now.toISOString(),
      date: todayStr,
      guestCount,
      unitPrice,
      ticketSubtotal,
      transferAdminFee: transferAdminFee > 0 ? transferAdminFee : undefined,
      totalAmount,
      paymentMethod,
      cashPaid: paymentMethod === 'CASH' && typeof cashGiven === 'number' ? cashGiven : totalAmount,
      cashChange: paymentMethod === 'CASH' ? Math.max(0, cashChange) : 0,
      guestName: guestName.trim() || `Tamu Curug Telu #${todaySummary.totalTickets + 1}`,
      originCity: originCity.trim() || 'Wisatawan',
      category,
      notes: notes.trim() || undefined,
    };

    onTransactionComplete(newTrx);
    handleResetForm();
    setIsSubmitting(false);
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-center">
        <div className="border-r border-slate-800 pr-1">
          <p className="text-[10px] text-slate-400 font-medium">Tiket Hari Ini</p>
          <p className="text-base font-bold text-white font-mono-num">
            {formatNumber(todaySummary.totalTickets)} <span className="text-[10px] font-sans text-slate-400">org</span>
          </p>
        </div>
        <div className="border-r border-slate-800 pr-1">
          <p className="text-[10px] text-emerald-400 font-medium">Cash Terkumpul</p>
          <p className="text-xs font-bold text-emerald-300 font-mono-num truncate">
            {formatRupiah(todaySummary.cashRevenue)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-sky-400 font-medium">Transfer Masuk</p>
          <p className="text-xs font-bold text-sky-300 font-mono-num truncate">
            {formatRupiah(todaySummary.transferRevenue)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Card: Hitung Jumlah Tiket Masuk */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              Jumlah Tiket Masuk
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              @ {formatRupiah(unitPrice)}
            </span>
          </div>

          {/* Stepper with Large Display */}
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleAdjustCount(-1)}
              disabled={guestCount <= 1}
              className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xl active:scale-95 transition cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="text-center px-2 flex-1">
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={guestCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setGuestCount(isNaN(val) || val < 1 ? 1 : val);
                  }}
                  className="w-24 text-center font-bold text-3xl text-white bg-transparent focus:outline-none font-mono-num border-b border-transparent focus:border-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-400">Orang</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Subtotal Tiket: {formatRupiah(ticketSubtotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAdjustCount(1)}
              className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xl active:scale-95 transition cursor-pointer shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Add Presets */}
          <div className="grid grid-cols-6 gap-1.5 mt-2.5">
            {[1, 2, 4, 5, 10, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSetQuickCount(num)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition active:scale-95 cursor-pointer ${
                  guestCount === num
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                }`}
              >
                {num} org
              </button>
            ))}
          </div>
        </div>

        {/* Card: Metode Pembayaran (Hanya Cash & Transfer Sederhana) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              Total Pembayaran
            </span>
            <div className="text-right">
              <span className="text-xl font-black text-amber-400 font-mono-num">
                {formatRupiah(totalAmount)}
              </span>
              {paymentMethod === 'TRANSFER' && (
                <span className="block text-[10px] text-sky-400 font-medium">
                  (Termasuk biaya transfer +Rp 1.000)
                </span>
              )}
            </div>
          </div>

          {/* Simple 2 Buttons: CASH or TRANSFER */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                playBeep();
                setPaymentMethod('CASH');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>CASH (TUNAI)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBeep();
                setPaymentMethod('TRANSFER');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition cursor-pointer relative ${
                paymentMethod === 'TRANSFER'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="absolute -top-1.5 right-2 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                +1rb
              </span>
              <QrCode className="w-4 h-4" />
              <span>TRANSFER</span>
            </button>
          </div>

          {/* Details based on selection */}
          {paymentMethod === 'CASH' ? (
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Uang Tunai Diterima:</span>
                <span className="text-[11px] text-slate-400">Pilih cepat / ketik:</span>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashPresets.map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => {
                      playBeep();
                      setCashGiven(nom);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono-num transition cursor-pointer ${
                      cashGiven === nom
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {nom === totalAmount ? 'Uang Pas' : formatRupiah(nom)}
                  </button>
                ))}
              </div>

              {/* Cash Input Field */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  placeholder="Ketik uang tunai diserahkan..."
                  value={cashGiven}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setCashGiven(val);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono-num focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Change calculation */}
              <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-800/60">
                <span className="text-slate-400">Kembalian:</span>
                <span
                  className={`font-mono-num font-bold text-sm ${
                    cashGiven === ''
                      ? 'text-slate-500'
                      : cashChange < 0
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {cashGiven === ''
                    ? 'Rp 0'
                    : cashChange < 0
                    ? `Kurang ${formatRupiah(Math.abs(cashChange))}`
                    : formatRupiah(cashChange)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Metode Transfer:</span>
                <span className="text-sky-300 font-bold font-mono">
                  {formatRupiah(ticketSubtotal)} + Rp 1.000 = {formatRupiah(totalAmount)}
                </span>
              </div>

              <div className="bg-sky-950/40 border border-sky-800/40 rounded-lg p-2.5 flex items-center gap-2 text-xs text-sky-200">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Pastikan bukti transfer <strong>{formatRupiah(totalAmount)}</strong> sudah dicek sebelum cetak tiket.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card: Pendataan Tamu (Cepat & Ringkas) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Pendataan Tamu Masuk
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Bisa dikosongkan jika cepat</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Tamu / Rombongan</label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Dani"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" /> Asal Kota
              </label>
              <input
                type="text"
                placeholder="Contoh: Purwokerto, Cilacap"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
            <span className="text-[10px] text-slate-400 shrink-0">Kategori:</span>
            {(['Keluarga', 'Rombongan', 'Individu', 'Pelajar', 'Umum'] as GuestCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 transition cursor-pointer ${
                  category === cat
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Proses Pembayaran & Cetak */}
        <div className="pt-1 flex gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset form"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={isSubmitting || (paymentMethod === 'CASH' && isCashInsufficient)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 transition active:scale-[0.99] cursor-pointer shadow-lg ${
              paymentMethod === 'CASH' && isCashInsufficient
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-105 shadow-emerald-500/25'
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>BAYAR & CETAK STRUK ({formatRupiah(totalAmount)})</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </div>
  );
};
