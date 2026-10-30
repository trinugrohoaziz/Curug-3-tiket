import React, { useState, useMemo } from 'react';
import {
  Coins,
  Calendar,
  Users,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  Calculator,
  Info,
  Clock,
  ArrowRight,
  Check,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  Employee,
  WeeklyPayrollSummary,
} from '../types';
import {
  formatRupiah,
  formatNumber,
  formatShortDate,
  formatIndonesianDate,
  getPastNDays,
  createPayrollWhatsAppText,
} from '../utils/formatters';
import { calculateWeeklyPayroll } from '../services/storage';

interface PayrollViewProps {
  transactions: Transaction[];
  dailyRecords: Record<string, DailyRecord>;
  employees: Employee[];
  config: TouristSpotConfig;
  onGoToDaily?: () => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  transactions,
  dailyRecords,
  employees,
  config,
  onGoToDaily,
}) => {
  const past7Days = useMemo(() => getPastNDays(7), []);
  const [copiedWA, setCopiedWA] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Weekly payroll calculation
  const payroll = useMemo<WeeklyPayrollSummary>(() => {
    return calculateWeeklyPayroll(past7Days, transactions, dailyRecords, employees);
  }, [past7Days, transactions, dailyRecords, employees]);

  const handleMarkAsPaid = () => {
    if (
      confirm(
        `Konfirmasi pembayaran gaji periode ${formatShortDate(payroll.startDate)} s/d ${formatShortDate(
          payroll.endDate
        )} sebesar ${formatRupiah(payroll.totalPayrollBudget)}?`
      )
    ) {
      setIsPaid(true);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleShareWhatsApp = () => {
    const text = createPayrollWhatsAppText(
      config.spotName,
      payroll.startDate,
      payroll.endDate,
      payroll.totalTickets,
      payroll.totalCoffeeDeduction,
      payroll.equivalentCleanTickets,
      payroll.totalPayrollBudget,
      payroll.totalDepartures,
      payroll.salaryPerDeparture,
      payroll.items
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            Pembayaran Gaji Karyawan
          </span>
          <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Setiap Hari Minggu
          </span>
        </div>
        <h2 className="text-sm font-bold text-white">
          Periode: {formatShortDate(payroll.startDate)} s/d {formatShortDate(payroll.endDate)}
        </h2>
        <p className="text-[11px] text-slate-400">
          Gaji dihitung otomatis seminggu sekali berdasarkan total tiket bersih & jumlah keberangkatan.
        </p>
      </div>

      {/* RUMUS & KALKULASI GAJI SESUAI ATURAN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            Rumus Perhitungan Gaji Mingguan
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Tarif Rp 2.100 / tiket
          </span>
        </div>

        {/* Formula Banner */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
          <p className="text-amber-300 font-bold">
            Gaji per Keberangkatan = (Tiket Bersih x Rp 2.100) ÷ Total Keberangkatan
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            *Tiket Bersih = Jumlah tiket setelah dipotong nilai uang kopi seminggu.
          </p>
        </div>

        {/* Calculation Step Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Box 1: Tiket & Uang Kopi */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block">1. Tiket Bersih:</span>
            <p className="text-base font-black text-white font-mono-num">
              {formatNumber(Math.round(payroll.equivalentCleanTickets))}{' '}
              <span className="text-[10px] font-normal text-slate-400">Tiket</span>
            </p>
            <p className="text-[10px] text-slate-400">
              (Total {payroll.totalTickets} tiket - Kopi {formatRupiah(payroll.totalCoffeeDeduction)})
            </p>
          </div>

          {/* Box 2: Total Dana Gaji */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block">2. Total Dana Gaji:</span>
            <p className="text-base font-black text-amber-400 font-mono-num">
              {formatRupiah(payroll.totalPayrollBudget)}
            </p>
            <p className="text-[10px] text-slate-400 font-mono-num">
              ({Math.round(payroll.equivalentCleanTickets)} x Rp 2.100)
            </p>
          </div>

          {/* Box 3: Total Keberangkatan */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block">3. Total Keberangkatan:</span>
            <p className="text-base font-black text-sky-400 font-mono-num">
              {payroll.totalDepartures}{' '}
              <span className="text-[10px] font-normal text-slate-400">Keberangkatan</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Akumulasi kehadiran seluruh karyawan
            </p>
          </div>

          {/* Box 4: Gaji per Keberangkatan */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">4. Gaji / Keberangkatan:</span>
            <p className="text-base font-black text-emerald-300 font-mono-num">
              {formatRupiah(payroll.salaryPerDeparture)}
            </p>
            <p className="text-[10px] text-slate-400 font-mono-num">
              (Diterima per hari kerja)
            </p>
          </div>
        </div>
      </div>

      {/* RINCIAN GAJI SETIAP KARYAWAN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            Rincian Gaji Tiap Karyawan ({payroll.items.length} Orang)
          </span>
          {isPaid ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> SUDAH DIBAYAR
            </span>
          ) : (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
              SIAP DIBAYARKAN
            </span>
          )}
        </div>

        {/* Employee salary cards list */}
        <div className="space-y-2">
          {payroll.items.map((item, idx) => (
            <div
              key={item.employeeId}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {idx + 1}. {item.employeeName}
                  </span>
                  <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                    {item.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-sky-400 font-mono-num">
                    {item.attendanceDaysCount} Keberangkatan (Hari)
                  </span>
                  <span>•</span>
                  <span className="font-mono-num text-slate-400">
                    @ {formatRupiah(payroll.salaryPerDeparture)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Total Gaji:</span>
                <span className="text-sm font-black text-emerald-400 font-mono-num">
                  {formatRupiah(item.salaryAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary Footer */}
        <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/90 flex items-center justify-between text-xs pt-2">
          <span className="font-bold text-slate-300">TOTAL DIBAYARKAN (SEMINGGU):</span>
          <span className="text-base font-black text-amber-400 font-mono-num">
            {formatRupiah(payroll.totalPayrollBudget)}
          </span>
        </div>
      </div>

      {/* Button to input attendance if needed */}
      {onGoToDaily && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300">
          <span>Perlu ubah absensi / keberangkatan harian?</span>
          <button
            onClick={onGoToDaily}
            className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
          >
            Buka Menu Harian &rarr;
          </button>
        </div>
      )}

      {/* Action Buttons: Bayarkan Gaji, WhatsApp, Cetak */}
      <div className="space-y-2 pt-1">
        {!isPaid ? (
          <button
            onClick={handleMarkAsPaid}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-105 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>TANDAI GAJI MINGGU INI SUDAH DIBAYARKAN ({formatRupiah(payroll.totalPayrollBudget)})</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Gaji Minggu Ini Telah Selesai Dibayarkan!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            {copiedWA ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Slip Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Kirim Slip Gaji WA</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Cetak Slip Gaji</span>
          </button>
        </div>
      </div>
    </div>
  );
};
