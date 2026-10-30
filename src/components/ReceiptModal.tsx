import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Check,
  X,
  Ticket,
  Calendar,
  Clock,
  QrCode,
  MapPin,
} from 'lucide-react';
import { Transaction, TouristSpotConfig } from '../types';
import { formatRupiah, formatTime, formatIndonesianDate } from '../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  config: TouristSpotConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  config,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentLabel =
    transaction.paymentMethod === 'CASH'
      ? 'TUNAI (CASH)'
      : 'TRANSFER (+ADMIN RP 1.000)';

  const handleShare = () => {
    const adminLine =
      transaction.transferAdminFee && transaction.transferAdminFee > 0
        ? `\nBiaya Admin Transfer: +${formatRupiah(transaction.transferAdminFee)}`
        : '';

    const text = `🎟️ *TIKET MASUK RESMI*\n📍 *${config.spotName.toUpperCase()}*\nNomor: ${transaction.ticketCode}\nTanggal: ${formatIndonesianDate(transaction.date)} (${formatTime(transaction.timestamp)})\nNama: ${transaction.guestName} (${transaction.originCity})\nJumlah: ${transaction.guestCount} Tiket\nTarif: @ ${formatRupiah(transaction.unitPrice)} = ${formatRupiah(transaction.ticketSubtotal)}${adminLine}\nTotal Bayar: *${formatRupiah(transaction.totalAmount)}*\nMetode: *${paymentLabel}*\n\n_${config.receiptFooter}_`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Ticket className="w-4 h-4" /> Struk Tiket Resmi
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal / Paper Ticket Simulation */}
        <div className="p-4 overflow-y-auto">
          <div
            id="printable-receipt"
            className="bg-white text-slate-900 p-4 rounded-xl shadow-inner font-mono text-[11px] leading-relaxed border border-slate-300 relative select-text"
          >
            {/* Spot Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h2 className="font-bold text-sm uppercase tracking-wide text-slate-900">
                {config.spotName}
              </h2>
              <p className="text-[10px] text-slate-600">{config.location}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{config.tagline}</p>
            </div>

            {/* Ticket Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Tiket:</span>
                <span className="font-bold text-slate-900">{transaction.ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Tanggal:
                </span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Waktu:
                </span>
                <span>{formatTime(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{config.cashierName}</span>
              </div>
            </div>

            {/* Guest Info */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Pengunjung:</span>
                <span className="font-semibold truncate max-w-[150px]">{transaction.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asal / Kategori:</span>
                <span>{transaction.originCity} ({transaction.category})</span>
              </div>
            </div>

            {/* Item Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between font-semibold text-xs">
                <span>Tiket Masuk ({transaction.guestCount} Org)</span>
                <span>{formatRupiah(transaction.ticketSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>{transaction.guestCount} Orang × {formatRupiah(transaction.unitPrice)}</span>
              </div>
              {transaction.transferAdminFee && transaction.transferAdminFee > 0 && (
                <div className="flex justify-between text-sky-700 text-[10px] font-semibold pt-0.5">
                  <span>+ Biaya Transfer</span>
                  <span>+{formatRupiah(transaction.transferAdminFee)}</span>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>TOTAL DIBAYAR</span>
                <span className="text-sm font-extrabold">{formatRupiah(transaction.totalAmount)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-600">Metode:</span>
                <span className="font-bold text-emerald-800">
                  {transaction.paymentMethod === 'CASH' ? 'CASH (TUNAI)' : 'TRANSFER'}
                </span>
              </div>
              {transaction.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Uang Diterima:</span>
                    <span>{formatRupiah(transaction.cashPaid)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(transaction.cashChange)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-1.5">
              <div className="flex justify-center items-center gap-2 py-1">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <p className="text-[9px] text-slate-600 font-sans leading-tight">
                {config.receiptFooter}
              </p>
              <p className="text-[8px] text-slate-400 font-mono">
                *** TERIMA KASIH ATAS KUNJUNGAN ANDA ***
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Salin Struk / WA</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-md shadow-emerald-900/40"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
