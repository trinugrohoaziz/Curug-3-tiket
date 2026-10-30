import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Banknote,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';
import { Transaction, PaymentMethod, TouristSpotConfig } from '../types';
import {
  formatRupiah,
  formatTime,
  getIndonesianDayName,
  formatShortDate,
  formatIndonesianDate,
  getPastNDays,
  getIsoDateOnly,
  generateTicketCode,
} from '../utils/formatters';

interface GuestListWeeklyProps {
  transactions: Transaction[];
  config: TouristSpotConfig;
  onViewReceipt: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (trx: Transaction) => void;
}

export const GuestListWeekly: React.FC<GuestListWeeklyProps> = ({
  transactions,
  config,
  onViewReceipt,
  onDeleteTransaction,
  onAddTransaction,
}) => {
  const past7Days = useMemo(() => getPastNDays(7), []);
  const [selectedDate, setSelectedDate] = useState<string>(past7Days[past7Days.length - 1]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<'ALL' | PaymentMethod>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Manual Add Form State
  const [manualCount, setManualCount] = useState<number>(2);
  const [manualName, setManualName] = useState<string>('');
  const [manualOrigin, setManualOrigin] = useState<string>('');
  const [manualMethod, setManualMethod] = useState<PaymentMethod>('CASH');

  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const stats = useMemo(() => {
    let totalGuests = 0;
    let totalGross = 0;
    let cashGuests = 0;
    let cashGross = 0;
    let cashTrxCount = 0;

    let transferGuests = 0;
    let transferGross = 0;
    let transferTrxCount = 0;

    dayTransactions.forEach((t) => {
      totalGuests += t.guestCount;
      totalGross += t.totalAmount;
      if (t.paymentMethod === 'CASH') {
        cashGuests += t.guestCount;
        cashGross += t.totalAmount;
        cashTrxCount++;
      } else {
        transferGuests += t.guestCount;
        transferGross += t.totalAmount;
        transferTrxCount++;
      }
    });

    return {
      totalGuests,
      totalGross,
      cashGuests,
      cashGross,
      cashTrxCount,
      transferGuests,
      transferGross,
      transferTrxCount,
    };
  }, [dayTransactions]);

  const filteredList = useMemo(() => {
    return dayTransactions.filter((t) => {
      const matchMethod = filterMethod === 'ALL' || t.paymentMethod === filterMethod;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchMethod;
      const matchQuery =
        t.guestName.toLowerCase().includes(query) ||
        t.ticketCode.toLowerCase().includes(query) ||
        t.originCity.toLowerCase().includes(query);
      return matchMethod && matchQuery;
    });
  }, [dayTransactions, searchQuery, filterMethod]);

  const handleCreateManualGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCount < 1) return;
    const now = new Date();
    const isSelectedToday = selectedDate === getIsoDateOnly(now);
    const timestamp = isSelectedToday
      ? now.toISOString()
      : `${selectedDate}T10:00:00.000Z`;

    const unitPrice = config.ticketPrice || 7000;
    const ticketSubtotal = manualCount * unitPrice;
    const transferAdminFee = manualMethod === 'TRANSFER' ? 1000 : 0;
    const totalAmount = ticketSubtotal + transferAdminFee;

    const newTrx: Transaction = {
      id: `trx-manual-${Date.now()}`,
      ticketCode: generateTicketCode(dayTransactions.length + 1),
      timestamp,
      date: selectedDate,
      guestCount: manualCount,
      unitPrice,
      ticketSubtotal,
      transferAdminFee: transferAdminFee > 0 ? transferAdminFee : undefined,
      totalAmount,
      paymentMethod: manualMethod,
      cashPaid: manualMethod === 'CASH' ? totalAmount : undefined,
      cashChange: 0,
      guestName: manualName.trim() || `Tamu ${getIndonesianDayName(selectedDate)} #${dayTransactions.length + 1}`,
      originCity: manualOrigin.trim() || 'Lokal',
      category: 'Keluarga',
      notes: 'Pencatatan manual',
    };

    onAddTransaction(newTrx);
    setShowAddModal(false);
    setManualName('');
    setManualOrigin('');
    setManualCount(2);
  };

  return (
    <div className="p-3.5 space-y-3.5">
      {/* 7 Days Horizontal Tab Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Pendataan Tamu 1 Minggu
          </span>
          <span className="text-[11px] text-slate-400">Pilih hari untuk melihat tamu</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {past7Days.map((dStr, idx) => {
            const isSelected = selectedDate === dStr;
            const isToday = idx === past7Days.length - 1;
            const dayName = getIndonesianDayName(dStr);
            const countForDay = transactions
              .filter((t) => t.date === dStr)
              .reduce((sum, t) => sum + t.guestCount, 0);

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-xl border text-center transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-tighter opacity-80">
                  {isToday ? 'Hari Ini' : dayName.slice(0, 3)}
                </p>
                <p className="text-xs font-bold font-mono-num">{formatShortDate(dStr).split(',')[1]}</p>
                <p
                  className={`text-[10px] mt-0.5 font-bold font-mono-num px-1 rounded ${
                    isSelected ? 'bg-emerald-700 text-white' : 'text-emerald-400'
                  }`}
                >
                  {countForDay} org
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Stats: Cash vs Transfer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{formatIndonesianDate(selectedDate)}</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Total {stats.totalGuests} Orang Masuk • Total {formatRupiah(stats.totalGross)}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tamu</span>
          </button>
        </div>

        {/* 2 Stats Cards: Cash & Transfer */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Cash */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Banknote className="w-3.5 h-3.5" /> BAYAR CASH
              </span>
              <span className="text-[9px] bg-emerald-500/20 px-1 rounded font-mono">
                {stats.cashTrxCount} Trx
              </span>
            </div>
            <p className="text-base font-black text-white font-mono-num">
              {stats.cashGuests} <span className="text-xs font-normal text-slate-400">org</span>
            </p>
            <p className="text-xs font-bold text-emerald-400 font-mono-num mt-0.5">
              {formatRupiah(stats.cashGross)}
            </p>
          </div>

          {/* Transfer */}
          <div className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-sky-400 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <QrCode className="w-3.5 h-3.5" /> TRANSFER
              </span>
              <span className="text-[9px] bg-sky-500/20 px-1 rounded font-mono">
                {stats.transferTrxCount} Trx
              </span>
            </div>
            <p className="text-base font-black text-white font-mono-num">
              {stats.transferGuests} <span className="text-xs font-normal text-slate-400">org</span>
            </p>
            <p className="text-xs font-bold text-sky-400 font-mono-num mt-0.5">
              {formatRupiah(stats.transferGross)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, kode tiket, asal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterMethod('ALL')}
            className={`px-2 py-1 text-[11px] rounded-lg transition cursor-pointer font-medium ${
              filterMethod === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterMethod('CASH')}
            className={`px-2 py-1 text-[11px] rounded-lg transition cursor-pointer font-medium ${
              filterMethod === 'CASH'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setFilterMethod('TRANSFER')}
            className={`px-2 py-1 text-[11px] rounded-lg transition cursor-pointer font-medium ${
              filterMethod === 'TRANSFER'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-sky-400 hover:text-sky-300'
            }`}
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Guest Transactions List */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">Belum ada data tamu masuk untuk kriteria ini.</p>
          </div>
        ) : (
          filteredList.map((trx) => (
            <div
              key={trx.id}
              className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3 transition flex items-center justify-between gap-2 shadow-sm"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-white truncate max-w-[160px]">
                    {trx.guestName}
                  </span>
                  {trx.paymentMethod === 'CASH' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <Banknote className="w-2.5 h-2.5" /> Cash
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      <QrCode className="w-2.5 h-2.5" /> Transfer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono-num">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatTime(trx.timestamp).replace(' WIB', '')}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {trx.originCity}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {trx.ticketCode}
                  </span>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-white font-mono-num">
                    {trx.guestCount} Tiket
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-400 font-mono-num">
                    {formatRupiah(trx.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewReceipt(trx)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Lihat Struk"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus pencatatan tiket ${trx.guestName} (${trx.guestCount} tiket)?`)) {
                        onDeleteTransaction(trx.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                    title="Hapus data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                Catat Tamu Manual ({formatIndonesianDate(selectedDate)})
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateManualGuest} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Jumlah Orang / Tiket (@ {formatRupiah(config.ticketPrice)})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={manualCount}
                    onChange={(e) => setManualCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400">Total:</span>
                    <p className="text-sm font-bold text-amber-400 font-mono-num">
                      {formatRupiah(
                        manualCount * (config.ticketPrice || 7000) +
                          (manualMethod === 'TRANSFER' ? 1000 : 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nama Tamu / Rombongan</label>
                <input
                  type="text"
                  placeholder="Misal: Bpk. Bambang"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Asal Kota</label>
                <input
                  type="text"
                  placeholder="Misal: Purwokerto"
                  value={manualOrigin}
                  onChange={(e) => setManualOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualMethod('CASH')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      manualMethod === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualMethod('TRANSFER')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      manualMethod === 'TRANSFER'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Transfer (+1rb)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Simpan Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
