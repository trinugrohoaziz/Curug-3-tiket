import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Banknote,
  QrCode,
  Calendar,
  Share2,
  Printer,
  Download,
  Check,
  Scale,
  BarChart3,
  Coins,
} from 'lucide-react';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  WeeklySummary,
} from '../types';
import {
  formatRupiah,
  formatNumber,
  formatShortDate,
  getPastNDays,
  createWeeklyWhatsAppText,
} from '../utils/formatters';
import { calculateWeeklySummary } from '../services/storage';

interface WeeklyReportViewProps {
  transactions: Transaction[];
  dailyRecords: Record<string, DailyRecord>;
  config: TouristSpotConfig;
  onSelectDayForDetail?: (date: string) => void;
  onGoToPayroll?: () => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  transactions,
  dailyRecords,
  config,
  onSelectDayForDetail,
  onGoToPayroll,
}) => {
  const past7Days = useMemo(() => getPastNDays(7), []);
  const [copiedWA, setCopiedWA] = useState(false);

  const weekly = useMemo<WeeklySummary>(() => {
    return calculateWeeklySummary(past7Days, transactions, dailyRecords);
  }, [past7Days, transactions, dailyRecords]);

  const maxDayTickets = useMemo(() => {
    const max = Math.max(...weekly.days.map((d) => d.totalTickets));
    return max > 0 ? max : 10;
  }, [weekly]);

  const handleShareWhatsApp = () => {
    const text = createWeeklyWhatsAppText(
      config.spotName,
      weekly.startDate,
      weekly.endDate,
      weekly.totalTickets,
      weekly.totalGrossRevenue,
      weekly.totalCashTickets,
      weekly.totalCashRevenue,
      weekly.totalTransferTickets,
      weekly.totalTransferRevenue,
      weekly.totalCoffeeDeduction,
      weekly.totalNetRevenue
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'Hari',
      'Total Tiket',
      'Tiket Cash',
      'Pendapatan Cash (Rp)',
      'Tiket Transfer',
      'Pendapatan Transfer (Rp)',
      'Total Kotor (Rp)',
      'Potongan Uang Kopi (Rp)',
      'Pendapatan Bersih (Rp)',
    ];

    const rows = weekly.days.map((d) => [
      d.date,
      d.dayName,
      d.totalTickets,
      d.cashTickets,
      d.cashRevenue,
      d.transferTickets,
      d.transferRevenue,
      d.totalGrossRevenue,
      d.coffeeDeduction,
      d.netRevenue,
    ]);

    const totalRow = [
      'TOTAL 1 MINGGU',
      '7 Hari',
      weekly.totalTickets,
      weekly.totalCashTickets,
      weekly.totalCashRevenue,
      weekly.totalTransferTickets,
      weekly.totalTransferRevenue,
      weekly.totalGrossRevenue,
      weekly.totalCoffeeDeduction,
      weekly.totalNetRevenue,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), totalRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Mingguan_${config.spotName.replace(/\s+/g, '_')}_${weekly.startDate}_sd_${weekly.endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Laporan Akumulasi 1 Minggu
          </span>
          <h2 className="text-sm font-bold text-white mt-0.5">
            {formatShortDate(weekly.startDate)} — {formatShortDate(weekly.endDate)}
          </h2>
          <p className="text-[10px] text-slate-400">
            {config.spotName} • @ {formatRupiah(config.ticketPrice || 7000)}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
          title="Ekspor file CSV Excel"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Excel</span>
        </button>
      </div>

      {/* Banner Shortcut to Weekly Payroll */}
      {onGoToPayroll && (
        <div
          onClick={onGoToPayroll}
          className="bg-gradient-to-r from-amber-900/60 via-slate-900 to-indigo-950/70 border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-amber-400 transition shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                Hitung Gaji Mingguan Karyawan (Hari Minggu)
              </p>
              <p className="text-[10px] text-amber-300">
                Formula: (Tiket Bersih x 2.100) ÷ Keberangkatan Karyawan
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-400 shrink-0">Buka &rarr;</span>
        </div>
      )}

      {/* ATURAN LAPORAN MINGGUAN: 2 LAPORAN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            Aturan 2 Laporan Mingguan
          </span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            Akurat & Terpantau
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Laporan 1: Sebelum Potong Kopi */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">
              1. SEBELUM POTONG KOPI
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total Kotor (7 Hari)</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Total Tiket Masuk:</span>
                <p className="text-xl font-black text-white font-mono-num leading-tight">
                  {formatNumber(weekly.totalTickets)}{' '}
                  <span className="text-xs font-normal text-slate-400">Orang</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Pendapatan Bruto:</span>
                <p className="text-sm font-bold text-amber-400 font-mono-num">
                  {formatRupiah(weekly.totalGrossRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Laporan 2: Setelah Potong Kopi */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
              2. SETELAH POTONG KOPI
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total Bersih (Netto)</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Total Potong Kopi:</span>
                <p className="text-xs font-bold text-rose-400 font-mono-num">
                  - {formatRupiah(weekly.totalCoffeeDeduction)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Pendapatan Bersih:</span>
                <p className="text-base font-black text-emerald-300 font-mono-num">
                  {formatRupiah(weekly.totalNetRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono-num">
          <span className="text-slate-400">Transparansi:</span>
          <span className="font-semibold text-white">
            {formatRupiah(weekly.totalGrossRevenue)} - {formatRupiah(weekly.totalCoffeeDeduction)} ={' '}
            <span className="text-emerald-400 font-bold">{formatRupiah(weekly.totalNetRevenue)}</span>
          </span>
        </div>
      </div>

      {/* RINCIAN TRANSAKSI MINGGUAN: CASH & TRANSFER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-400" />
          Rincian Transaksi 1 Minggu: Cash & Transfer
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Cash Summary Card */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> TOTAL CASH
              </span>
              <span className="font-mono text-[9px] bg-emerald-500/20 px-1 rounded">
                {weekly.totalCashTransactions} Trx
              </span>
            </div>
            <p className="text-sm font-bold text-white font-mono-num">
              {formatNumber(weekly.totalCashTickets)} Orang
            </p>
            <p className="text-xs font-bold text-emerald-400 font-mono-num">
              {formatRupiah(weekly.totalCashRevenue)}
            </p>
          </div>

          {/* Transfer Summary Card */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-sky-500/20 space-y-1">
            <div className="flex items-center justify-between text-sky-400 font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> TOTAL TRANSFER
              </span>
              <span className="font-mono text-[9px] bg-sky-500/20 px-1 rounded">
                {weekly.totalTransferTransactions} Trx
              </span>
            </div>
            <p className="text-sm font-bold text-white font-mono-num">
              {formatNumber(weekly.totalTransferTickets)} Orang
            </p>
            <p className="text-xs font-bold text-sky-400 font-mono-num">
              {formatRupiah(weekly.totalTransferRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* GRAFIK KUNJUNGAN 7 HARI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Grafik Kunjungan 7 Hari
          </span>
          <span className="text-[10px] text-slate-400">Tinggi bar = total pengunjung</span>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-36 pt-4 pb-2 px-1 border-b border-slate-800">
          {weekly.days.map((day) => {
            const heightPercent = Math.max(
              12,
              Math.round((day.totalTickets / maxDayTickets) * 100)
            );
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-bold font-mono-num text-slate-300">
                  {day.totalTickets}
                </span>

                <div className="w-full max-w-[28px] h-full flex flex-col justify-end rounded-t-lg overflow-hidden bg-slate-800/40">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-500 hover:brightness-110"
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.dayName}: ${day.totalTickets} tiket`}
                  ></div>
                </div>

                <span className="text-[10px] font-medium text-slate-400">
                  {day.dayName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABEL RINCIAN LENGKAP 7 HARI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            Tabel Rincian Harian (7 Hari)
          </span>
          <span className="text-[10px] text-slate-400">Klik hari untuk ke laporan harian</span>
        </div>

        <div className="space-y-1.5">
          {weekly.days.map((d) => (
            <div
              key={d.date}
              onClick={() => onSelectDayForDetail && onSelectDayForDetail(d.date)}
              className="bg-slate-950/80 hover:bg-slate-800/70 border border-slate-800/80 rounded-xl p-2.5 transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {d.dayName}, {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono-num">
                    {d.totalTickets} org
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-num">
                  <span className="text-emerald-400">Cash: {formatRupiah(d.cashRevenue)}</span>
                  <span>•</span>
                  <span className="text-sky-400">Transfer: {formatRupiah(d.transferRevenue)}</span>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-[10px] text-rose-400 font-mono-num">
                  Kopi: -{formatRupiah(d.coffeeDeduction)}
                </p>
                <p className="text-xs font-bold text-emerald-300 font-mono-num">
                  Bersih: {formatRupiah(d.netRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        <button
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          {copiedWA ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Laporan Disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Salin Laporan WA</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>Cetak Lap. Mingguan</span>
        </button>
      </div>
    </div>
  );
};
