import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Coffee,
  Banknote,
  QrCode,
  Share2,
  Printer,
  Check,
  Plus,
  Trash2,
  Scale,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  CoffeeExpenseItem,
  Employee,
} from '../types';
import {
  formatRupiah,
  formatNumber,
  formatIndonesianDate,
  getIndonesianDayName,
  getPastNDays,
  createDailyWhatsAppText,
} from '../utils/formatters';
import { calculateDailySummary } from '../services/storage';

interface DailyReportViewProps {
  transactions: Transaction[];
  dailyRecords: Record<string, DailyRecord>;
  employees: Employee[];
  config: TouristSpotConfig;
  onUpdateCoffee: (
    date: string,
    amount: number,
    expenses?: CoffeeExpenseItem[],
    notes?: string
  ) => void;
  onToggleAttendance: (date: string, employeeId: string) => void;
  onAddEmployee: (name: string, role: string) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  transactions,
  dailyRecords,
  employees,
  config,
  onUpdateCoffee,
  onToggleAttendance,
  onAddEmployee,
}) => {
  const past7Days = useMemo(() => getPastNDays(7), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    past7Days[past7Days.length - 1]
  );
  const [copiedWA, setCopiedWA] = useState<boolean>(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState<boolean>(false);
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<string>('Petugas Loket');

  const summary = useMemo(() => {
    return calculateDailySummary(selectedDate, transactions, dailyRecords);
  }, [selectedDate, transactions, dailyRecords]);

  const [coffeeInput, setCoffeeInput] = useState<string>(
    summary.coffeeDeduction.toString()
  );
  const [newCoffeeDesc, setNewCoffeeDesc] = useState<string>('');
  const [newCoffeeNominal, setNewCoffeeNominal] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setCoffeeInput(summary.coffeeDeduction.toString());
  }, [selectedDate, summary.coffeeDeduction]);

  const handleSaveCoffeeNominal = (amount: number) => {
    const validAmount = Math.max(0, isNaN(amount) ? 0 : amount);
    onUpdateCoffee(selectedDate, validAmount, summary.coffeeExpenses);
    setCoffeeInput(validAmount.toString());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddItemizedCoffee = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newCoffeeNominal);
    if (isNaN(amount) || amount <= 0) return;

    const newItem: CoffeeExpenseItem = {
      id: `coffee-${Date.now()}`,
      time: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      description: newCoffeeDesc.trim() || 'Uang kopi & konsumsi petugas',
      amount,
    };

    const updatedExpenses = [...summary.coffeeExpenses, newItem];
    const newTotal = updatedExpenses.reduce((sum, item) => sum + item.amount, 0);

    onUpdateCoffee(selectedDate, newTotal, updatedExpenses);
    setCoffeeInput(newTotal.toString());
    setNewCoffeeDesc('');
    setNewCoffeeNominal('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteItemizedCoffee = (itemId: string) => {
    const updatedExpenses = summary.coffeeExpenses.filter((it) => it.id !== itemId);
    const newTotal = updatedExpenses.reduce((sum, item) => sum + item.amount, 0);
    onUpdateCoffee(selectedDate, newTotal, updatedExpenses);
    setCoffeeInput(newTotal.toString());
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    onAddEmployee(newEmpName.trim(), newEmpRole.trim());
    setNewEmpName('');
    setShowAddEmpModal(false);
  };

  const handleShareWhatsApp = () => {
    const text = createDailyWhatsAppText(
      config.spotName,
      selectedDate,
      summary.totalTickets,
      summary.totalGrossRevenue,
      summary.cashTickets,
      summary.cashRevenue,
      summary.transferTickets,
      summary.transferRevenue,
      summary.coffeeDeduction,
      summary.netRevenue,
      summary.attendedEmployeeIds.length
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Date Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Pilih Hari Laporan
          </span>
          <span className="text-[11px] font-bold text-emerald-400">
            {getIndonesianDayName(selectedDate)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {past7Days.map((dStr, idx) => {
            const isSelected = selectedDate === dStr;
            const isToday = idx === past7Days.length - 1;
            const dayName = getIndonesianDayName(dStr);

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center text-xs font-semibold border transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <p className="text-[9px] uppercase tracking-tighter opacity-80">
                  {isToday ? 'Hari Ini' : dayName.slice(0, 3)}
                </p>
                <p className="font-mono-num font-bold text-[11px]">
                  {dStr.slice(8, 10)}/{dStr.slice(5, 7)}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-300 font-medium text-center pt-1 border-t border-slate-800">
          Laporan Transaksi: <span className="font-bold text-white">{formatIndonesianDate(selectedDate)}</span>
        </p>
      </div>

      {/* INPUT KARYAWAN MASUK (KEBERANGKATAN HARI INI) */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Input Karyawan Masuk (Keberangkatan)
              </h3>
              <p className="text-[10px] text-slate-400">
                Centang karyawan yang bertugas hari ini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-indigo-300 font-mono-num bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-800">
              {summary.attendedEmployeeIds.length} Masuk
            </span>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition cursor-pointer"
              title="Tambah Karyawan Baru"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Employee Checkboxes */}
        <div className="grid grid-cols-2 gap-2">
          {employees.map((emp) => {
            const isAttended = summary.attendedEmployeeIds.includes(emp.id);
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => onToggleAttendance(selectedDate, emp.id)}
                className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isAttended
                    ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold truncate leading-tight">{emp.name}</p>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{emp.role}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAttended
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isAttended && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-indigo-300/80 bg-indigo-950/40 p-2 rounded-xl border border-indigo-900/40">
          💡 Keberangkatan harian ini otomatis dihitung untuk <strong>pembayaran gaji mingguan</strong> pada hari Minggu.
        </p>
      </div>

      {/* ATURAN 2 LAPORAN HARIAN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            Aturan 2 Laporan Harian
          </span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            Transparan & Akurat
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Laporan 1 */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">
              1. SEBELUM POTONG KOPI
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total Kotor (Bruto)</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Jumlah Tiket:</span>
                <p className="text-lg font-black text-white font-mono-num leading-tight">
                  {formatNumber(summary.totalTickets)}{' '}
                  <span className="text-xs font-normal text-slate-400">Tiket</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Pendapatan Tiket:</span>
                <p className="text-sm font-bold text-amber-400 font-mono-num">
                  {formatRupiah(summary.totalGrossRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Laporan 2 */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
              2. SETELAH POTONG KOPI
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pendapatan Bersih</p>

            <div className="mt-2 space-y-1">
              <div>
                <span className="text-[10px] text-slate-500">Potongan Kopi:</span>
                <p className="text-xs font-bold text-rose-400 font-mono-num">
                  - {formatRupiah(summary.coffeeDeduction)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Total Bersih:</span>
                <p className="text-sm font-black text-emerald-300 font-mono-num">
                  {formatRupiah(summary.netRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono-num">
          <span className="text-slate-400">Rumus:</span>
          <span className="font-semibold text-white">
            {formatRupiah(summary.totalGrossRevenue)} - {formatRupiah(summary.coffeeDeduction)} ={' '}
            <span className="text-emerald-400 font-bold">{formatRupiah(summary.netRevenue)}</span>
          </span>
        </div>
      </div>

      {/* MENU POTONG UANG KOPI */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Coffee className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Menu Potong Uang Kopi
              </h3>
              <p className="text-[10px] text-slate-400">
                Bisa diisi sendiri per hari
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-amber-400 font-mono-num bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800">
            {formatRupiah(summary.coffeeDeduction)}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-[11px] text-slate-300 font-medium block">
            Isi / Edit Nominal Potongan Uang Kopi Hari Ini:
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">Rp</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={coffeeInput}
                onChange={(e) => setCoffeeInput(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono-num font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSaveCoffeeNominal(parseFloat(coffeeInput) || 0)}
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-amber-950/40"
            >
              Simpan
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 self-center mr-1">Preset:</span>
            {[0, 10000, 20000, 25000, 30000, 50000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSaveCoffeeNominal(val)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-num border transition cursor-pointer ${
                  summary.coffeeDeduction === val
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {val === 0 ? 'Nol (Rp 0)' : formatRupiah(val)}
              </button>
            ))}
          </div>

          {saveSuccess && (
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Berhasil disimpan & laporan langsung diperbarui!
            </p>
          )}
        </div>

        {/* Itemized Coffee List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rincian Pengeluaran Kopi / Snack Pos:</span>
            <span>{summary.coffeeExpenses.length} Rincian</span>
          </div>

          {summary.coffeeExpenses.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              {summary.coffeeExpenses.map((it) => (
                <div
                  key={it.id}
                  className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-slate-200 truncate">{it.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono-num">Pukul {it.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono-num">
                      {formatRupiah(it.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteItemizedCoffee(it.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      title="Hapus rincian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleAddItemizedCoffee}
            className="flex items-center gap-1.5 pt-1 text-xs"
          >
            <input
              type="text"
              placeholder="Catatan (mis: Kopi & gorengan pos 2)"
              value={newCoffeeDesc}
              onChange={(e) => setNewCoffeeDesc(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <input
              type="number"
              placeholder="Nominal"
              value={newCoffeeNominal}
              onChange={(e) => setNewCoffeeNominal(e.target.value)}
              className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono-num focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition cursor-pointer shrink-0"
              title="Tambah rincian kopi"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RINCIAN TRANSAKSI: CASH & TRANSFER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-400" />
          Rincian Transaksi: Cash & Transfer
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Card Cash */}
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Banknote className="w-3.5 h-3.5" /> PEMBAYARAN CASH
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 px-1 rounded">
                {summary.cashTransactionsCount} Trx
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400">Tiket Terjual:</span>
              <p className="text-base font-black text-white font-mono-num">
                {summary.cashTickets} <span className="text-xs font-normal text-slate-400">Tiket</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400">Total Kotor Cash:</span>
              <p className="text-xs font-bold text-emerald-400 font-mono-num">
                {formatRupiah(summary.cashRevenue)}
              </p>
            </div>

            <div className="pt-1 border-t border-slate-800 text-[10px] space-y-0.5">
              <span className="text-slate-400">Kas Fisik Bersih di Pos:</span>
              <p className="font-bold text-emerald-300 font-mono-num">
                {formatRupiah(summary.netCashOnHand)}
              </p>
            </div>
          </div>

          {/* Card Transfer */}
          <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-sky-400">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <QrCode className="w-3.5 h-3.5" /> PEMBAYARAN TRANSFER
              </span>
              <span className="text-[10px] font-mono bg-sky-500/20 px-1 rounded">
                {summary.transferTransactionsCount} Trx
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400">Tiket Terjual:</span>
              <p className="text-base font-black text-white font-mono-num">
                {summary.transferTickets} <span className="text-xs font-normal text-slate-400">Tiket</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400">Total Masuk Rekening:</span>
              <p className="text-xs font-bold text-sky-400 font-mono-num">
                {formatRupiah(summary.transferRevenue)}
              </p>
            </div>

            <div className="pt-1 border-t border-slate-800 text-[10px] space-y-0.5">
              <span className="text-slate-400">Status Kas Rekening:</span>
              <p className="font-bold text-sky-300 font-mono-num">
                {formatRupiah(summary.transferRevenue)} (Utuh)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share / Export Actions */}
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
              <span>Kirim Laporan WA</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-4 space-y-3.5 shadow-2xl">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Tambah Karyawan Baru
            </h3>
            <form onSubmit={handleAddNewEmployee} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nama Karyawan</label>
                <input
                  type="text"
                  placeholder="Contoh: Dani Suherman"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Jabatan / Bagian</label>
                <input
                  type="text"
                  placeholder="Contoh: Petugas Loket, Keamanan Sendang"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
