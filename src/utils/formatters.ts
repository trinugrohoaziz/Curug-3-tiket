/**
 * Formatting helpers for Indonesian Rupiah, Dates, and WhatsApp reporting
 */

export const formatRupiah = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
};

export const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const getIndonesianDayName = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return INDO_DAYS[d.getDay()] || '';
};

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = INDO_DAYS[d.getDay()];
  const monthName = INDO_MONTHS[d.getMonth()];
  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = INDO_DAYS[d.getDay()];
  const shortMonth = INDO_MONTHS[d.getMonth()]?.slice(0, 3);
  return `${dayName.slice(0, 3)}, ${day} ${shortMonth}`;
};

export const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  } catch {
    return '00:00 WIB';
  }
};

export const generateTicketCode = (seq: number = 1): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `CT-${day}${month}-${String(seq).padStart(3, '0')}-${rand}`;
};

export const getIsoDateOnly = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getPastNDays = (numDays: number = 7, refDateStr?: string): string[] => {
  const result: string[] = [];
  const base = refDateStr ? new Date(refDateStr + 'T12:00:00') : new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    result.push(getIsoDateOnly(d));
  }
  return result;
};

/**
 * Format Daily Report for WhatsApp share
 */
export const createDailyWhatsAppText = (
  spotName: string,
  dateStr: string,
  totalTickets: number,
  gross: number,
  cashTickets: number,
  cashRev: number,
  transferTickets: number,
  transferRev: number,
  coffeeDeduction: number,
  netRev: number,
  attendanceCount: number
): string => {
  return `📊 *LAPORAN HARIAN LOKET WISATA*
📍 *${spotName.toUpperCase()}*
🗓️ Tanggal: *${formatIndonesianDate(dateStr)}*
━━━━━━━━━━━━━━━━━━
🎟️ *TOTAL TIKET MASUK:* ${formatNumber(totalTickets)} Orang
💰 *Total Pendapatan Tiket:* ${formatRupiah(gross)}

💳 *RINCIAN METODE PEMBAYARAN:*
• Tunai (Cash): ${formatNumber(cashTickets)} Tiket (${formatRupiah(cashRev)})
• Transfer: ${formatNumber(transferTickets)} Tiket (${formatRupiah(transferRev)})

☕ *POTONGAN UANG KOPI:*
• Biaya Uang Kopi: - ${formatRupiah(coffeeDeduction)}

✅ *TOTAL PENDAPATAN BERSIH:*
👉 *${formatRupiah(netRev)}*

👥 *Karyawan Masuk Hari Ini:* ${attendanceCount} Keberangkatan
━━━━━━━━━━━━━━━━━━
💵 *Fisik Kas Tunai Loket:* ${formatRupiah(Math.max(0, cashRev - coffeeDeduction))}
🏦 *Kas Masuk Rekening (Transfer):* ${formatRupiah(transferRev)}
_Wisata Curug Telu & Sendang Bidadari_`;
};

/**
 * Format Weekly Report for WhatsApp share
 */
export const createWeeklyWhatsAppText = (
  spotName: string,
  startStr: string,
  endStr: string,
  totalTickets: number,
  gross: number,
  cashTickets: number,
  cashRev: number,
  transferTickets: number,
  transferRev: number,
  totalCoffee: number,
  netRev: number
): string => {
  return `📋 *LAPORAN MINGGUAN LOKET WISATA*
📍 *${spotName.toUpperCase()}*
🗓️ Periode: *${formatShortDate(startStr)} s/d ${formatShortDate(endStr)}*
━━━━━━━━━━━━━━━━━━
🎟️ *AKUMULASI TIKET:* ${formatNumber(totalTickets)} Orang (x Rp 7.000)
💵 *Total Pendapatan Tiket:* ${formatRupiah(gross)}

📊 *METODE PEMBAYARAN 1 MINGGU:*
• Cash (Tunai): ${formatNumber(cashTickets)} Tiket (${formatRupiah(cashRev)})
• Transfer: ${formatNumber(transferTickets)} Tiket (${formatRupiah(transferRev)})

☕ *TOTAL POTONGAN UANG KOPI:*
• Akumulasi 7 Hari: - ${formatRupiah(totalCoffee)}

🏆 *TOTAL PENDAPATAN BERSIH SEMINGGU:*
👉 *${formatRupiah(netRev)}*
━━━━━━━━━━━━━━━━━━
_Transparan, Terdata, dan Akurat._`;
};

/**
 * Format Monthly Report for WhatsApp share
 */
export const createMonthlyWhatsAppText = (
  spotName: string,
  monthName: string,
  year: number,
  totalTickets: number,
  gross: number,
  cashRev: number,
  transferRev: number,
  totalCoffee: number,
  netRev: number
): string => {
  return `📅 *LAPORAN BULANAN LOKET WISATA*
📍 *${spotName.toUpperCase()}*
🗓️ Bulan: *${monthName.toUpperCase()} ${year}*
━━━━━━━━━━━━━━━━━━
🎟️ *TOTAL TIKET 1 BULAN:* ${formatNumber(totalTickets)} Orang
💰 *Total Pendapatan Tiket:* ${formatRupiah(gross)}

💳 *RINCIAN PEMBAYARAN BULANAN:*
• Tunai (Cash): ${formatRupiah(cashRev)}
• Transfer: ${formatRupiah(transferRev)}

☕ *TOTAL POTONGAN UANG KOPI:*
• Akumulasi Sebulan: - ${formatRupiah(totalCoffee)}

🏆 *TOTAL PENDAPATAN BERSIH SEBULAN:*
👉 *${formatRupiah(netRev)}*
━━━━━━━━━━━━━━━━━━
_Laporan Resmi Pembukuan Bulanan_`;
};

/**
 * Format Weekly Payroll WhatsApp share
 */
export const createPayrollWhatsAppText = (
  spotName: string,
  startDate: string,
  endDate: string,
  totalTickets: number,
  totalCoffee: number,
  equivalentCleanTickets: number,
  totalPayrollBudget: number,
  totalDepartures: number,
  salaryPerDeparture: number,
  items: Array<{ employeeName: string; attendanceDaysCount: number; salaryAmount: number }>
): string => {
  const staffList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.employeeName}*: ${item.attendanceDaysCount} Hari x ${formatRupiah(salaryPerDeparture)} = *${formatRupiah(item.salaryAmount)}*`
    )
    .join('\n');

  return `💼 *SLIP PEMBAYARAN GAJI MINGGUAN KARYAWAN*
📍 *${spotName.toUpperCase()}*
🗓️ Periode: *${formatShortDate(startDate)} - ${formatShortDate(endDate)}* (Hari Minggu)
━━━━━━━━━━━━━━━━━━
🎟️ Total Tiket Masuk: ${formatNumber(totalTickets)} Tiket
☕ Total Potong Uang Kopi: - ${formatRupiah(totalCoffee)}
🎯 Tiket Bersih Setelah Kopi: ${formatNumber(Math.round(equivalentCleanTickets))} Tiket

💰 *RUMUS PERHITUNGAN GAJI:*
(Tiket Bersih x Rp 2.100) ÷ Total Keberangkatan Karyawan
• Total Alokasi Dana Gaji: *${formatRupiah(totalPayrollBudget)}*
• Total Keberangkatan Karyawan: *${totalDepartures} Keberangkatan*
👉 *Gaji per Keberangkatan / Shift: ${formatRupiah(salaryPerDeparture)}*
━━━━━━━━━━━━━━━━━━
👥 *RINCIAN GAJI TIAP KARYAWAN:*
${staffList}
━━━━━━━━━━━━━━━━━━
_Dihitung & Dibayarkan Resmi Setiap Hari Minggu_`;
};
