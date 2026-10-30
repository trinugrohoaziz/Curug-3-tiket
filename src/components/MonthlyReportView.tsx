import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Share2,
  Printer,
  Scale,
  Banknote,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  MonthlySummary,
} from '../types';
import {
  formatRupiah,
  formatNumber,
  createMonthlyWhatsAppText,
} from '../utils/formatters';
import { calculateMonthlySummary } from '../services/storage';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  dailyRecords: Record<string, DailyRecord>;
  config: TouristSpotConfig;
  onSelectDayForDetail?: (date: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  dailyRecords,
  config,
  onSelectDayForDetail,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [copiedWA, setCopiedWA] = useState(false);

  const monthly = useMemo<MonthlySummary>(() => {
    return calculateMonthlySummary(selectedYear, selectedMonth, transactions, dailyRecords);
  }, [selectedYear, selectedMonth, transactions, dailyRecords]);

  const weeklySegments = useMemo(() => {
    const days = monthly.days;
    const segments: Array<{ label: string; days: typeof days; totalTickets: number; gross: number; coffee: number; net: number }> = [];

    const segmentRanges = [
      { label: 'Minggu I (Tgl 1 - 7)', start: 1, end: 7 },
      { label: 'Minggu II (Tgl 8 - 14)', start: 8, end: 14 },
      { label: 'Minggu III (Tgl 15 - 21)', start: 15, end: 21 },
      { label: 'Minggu IV (Tgl 22 - 28)', start: 22, end: 28 },
      { label: 'Minggu V (Tgl 29 - akhir)', start: 29, end: 31 },
    ];

    segmentRanges.forEach((range) => {
      const segDays = days.filter((d) => {
        const dayNum = parseInt(d.date.slice(8, 10), 10);
        return dayNum >= range.start && dayNum <= range.end;
      });

      if (segDays.length > 0) {
        const totalTickets = segDays.reduce((acc, d) => acc + d.totalTickets, 0);
        const gross = segDays.reduce((acc, d) => acc + d.totalGrossRevenue, 0);
        const coffee = segDays.reduce((acc, d) => acc + d.coffeeDeduction, 0);
        const net = segDays.reduce((acc, d) => acc + d.netRevenue, 0);

        segments.push({
          label: range.label,
          days: segDays,
          totalTickets,
          gross,
          coffee,
          net,
        });
      }
    });

    return segments;
  }, [monthly]);

  const handleChangeMonth = (delta: number) => {
    let newM = selectedMonth + delta;
    let newY = selectedYear;
    if (newM > 12) {
      newM = 1;
      newY++;
    } else if (newM < 1) {
      newM = 12;
      newY--;
    }
    setSelectedMonth(newM);
    setSelectedYear(newY);
  };

  const handleShareWhatsApp = () => {
    const text = createMonthlyWhatsAppText(
      config.spotName,
      monthly.monthName,
      monthly.year,
      monthly.totalTickets,
      monthly.totalGrossRevenue,
      monthly.totalCashRevenue,
      monthly.totalTransferRevenue,
      monthly.totalCoffeeDeduction,
      monthly.totalNetRevenue
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
      'Pendapatan Cash (Rp)',
      'Pendapatan Transfer (Rp)',
      'Total Kotor (Rp)',
      'Potongan Kopi (Rp)',
      'Pendapatan Bersih (Rp)',
    ];

    const rows = monthly.days.map((d) => [
      d.date,
      d.dayName,
      d.totalTickets,
      d.cashRevenue,
      d.transferRevenue,
      d.totalGrossRevenue,
      d.coffeeDeduction,
      d.netRevenue,
    ]);

    const totalRow = [
      `TOTAL BULAN ${monthly.monthName.toUpperCase()} ${monthly.year}`,
      '1 Bulan Penuh',
      monthly.totalTickets,
      monthly.totalCashRevenue,
      monthly.totalTransferRevenue,
      monthly.totalGrossRevenue,
      monthly.totalCoffeeDeduction,
      monthly.totalNetRevenue,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), totalRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Bulanan_${config.spotName.replace(/\s+/g, '_')}_${monthly.monthName}_${monthly.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Month Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <button
          onClick={() => handleChangeMonth(-1)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
            Laporan Rekap Bulanan
          </span>
          <h2 className="text-sm font-bold text-white">
            {monthly.monthName} {monthly.year}
          </h2>
        </div>

        <button
          onClick={() => handleChangeMonth(1)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ATURAN 2 LAPORAN: VERSI BULANAN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            Aturan 2 Laporan Bulanan
          </span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            Transparansi Bulanan
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Laporan 1: Sebelum Potong Kopi */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">
              1. SEBELUM POTONG KOPI
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total Kotor Sebulan</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Tiket Masuk:</span>
                <p className="text-lg font-black text-white font-mono-num leading-tight">
                  {formatNumber(monthly.totalTickets)}{' '}
                  <span className="text-xs font-normal text-slate-400">Orang</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Pendapatan Tiket:</span>
                <p className="text-sm font-bold text-amber-400 font-mono-num">
                  {formatRupiah(monthly.totalGrossRevenue)}
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
            <p className="text-[11px] text-slate-400 mt-0.5">Pendapatan Bersih</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Potongan Uang Kopi:</span>
                <p className="text-xs font-bold text-rose-400 font-mono-num">
                  - {formatRupiah(monthly.totalCoffeeDeduction)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Total Bersih:</span>
                <p className="text-base font-black text-emerald-300 font-mono-num">
                  {formatRupiah(monthly.totalNetRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono-num">
          <span className="text-slate-400">Transparansi 1 Bulan:</span>
          <span className="font-semibold text-white">
            {formatRupiah(monthly.totalGrossRevenue)} - {formatRupiah(monthly.totalCoffeeDeduction)} ={' '}
            <span className="text-emerald-400 font-bold">{formatRupiah(monthly.totalNetRevenue)}</span>
          </span>
        </div>
      </div>

      {/* METODE PEMBAYARAN SEBULAN: CASH & TRANSFER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-400" />
          Rincian Pembayaran 1 Bulan
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Cash */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
            <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> TOTAL CASH
            </span>
            <p className="text-sm font-bold text-white font-mono-num">
              {formatNumber(monthly.totalCashTickets)} Orang
            </p>
            <p className="text-xs font-bold text-emerald-400 font-mono-num">
              {formatRupiah(monthly.totalCashRevenue)}
            </p>
          </div>

          {/* Transfer */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-sky-500/20 space-y-1">
            <span className="font-bold text-sky-400 text-[11px] flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> TOTAL TRANSFER
            </span>
            <p className="text-sm font-bold text-white font-mono-num">
              {formatNumber(monthly.totalTransferTickets)} Orang
            </p>
            <p className="text-xs font-bold text-sky-400 font-mono-num">
              {formatRupiah(monthly.totalTransferRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* BREAKDOWN PER MINGGU DALAM BULAN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Rincian Per Minggu ({monthly.monthName} {monthly.year})
        </h3>

        <div className="space-y-2">
          {weeklySegments.map((seg, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">{seg.label}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono-num font-bold">
                  {seg.totalTickets} Tiket
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] pt-1 border-t border-slate-800/80 font-mono-num">
                <div>
                  <span className="text-slate-500 block">Kotor:</span>
                  <span className="font-semibold text-slate-300">{formatRupiah(seg.gross)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kopi:</span>
                  <span className="font-semibold text-rose-400">-{formatRupiah(seg.coffee)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bersih:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(seg.net)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: CSV, WhatsApp, Cetak */}
      <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Unduh CSV</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          {copiedWA ? (
            <span className="text-emerald-400 font-bold">Tersalin!</span>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salin WA</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-sky-400" />
          <span>Cetak Lap.</span>
        </button>
      </div>
    </div>
  );
};
