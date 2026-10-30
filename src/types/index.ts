/**
 * Types for Wisata Curug Telu & Sendang Bidadari App
 */

export type PaymentMethod = 'CASH' | 'TRANSFER';

export type GuestCategory = 'Individu' | 'Keluarga' | 'Rombongan' | 'Pelajar' | 'Umum';

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  active: boolean;
}

export interface CoffeeExpenseItem {
  id: string;
  time: string;
  description: string;
  amount: number;
}

export interface Transaction {
  id: string;
  ticketCode: string;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD
  guestCount: number; // Jumlah tiket / orang
  unitPrice: number; // Rp 7.000
  ticketSubtotal: number; // guestCount * unitPrice (Murni omzet tiket untuk laporan)
  transferAdminFee?: number; // Rp 1.000 hanya saat tiketing
  totalAmount: number; // Yang dibayar tamu di loket (ticketSubtotal + transferAdminFee)
  paymentMethod: PaymentMethod; // 'CASH' | 'TRANSFER'
  cashPaid?: number; // Nominal uang tunai diserahkan
  cashChange?: number; // Kembalian
  guestName: string; // Nama pemesan / rombongan
  originCity: string; // Asal kota / wilayah
  category: GuestCategory;
  notes?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  coffeeDeduction: number; // Total potong uang kopi hari tersebut
  coffeeExpenses: CoffeeExpenseItem[];
  employeeAttendance: string[]; // List of employee IDs who worked / entered on this day (keberangkatan)
  notes?: string;
}

export interface TouristSpotConfig {
  spotName: string;
  tagline: string;
  location: string;
  ticketPrice: number;
  cashierName: string;
  receiptFooter: string;
}

export interface DailySummary {
  date: string;
  dayName: string;
  formattedDate: string;
  totalTickets: number;
  totalGrossRevenue: number; // Murni: totalTickets * 7000
  cashTransactionsCount: number;
  cashTickets: number;
  cashRevenue: number; // cashTickets * 7000
  transferTransactionsCount: number;
  transferTickets: number;
  transferRevenue: number; // Murni omzet tiket: transferTickets * 7000
  coffeeDeduction: number;
  netRevenue: number; // totalGrossRevenue - coffeeDeduction
  netCashOnHand: number; // cashRevenue - coffeeDeduction (kas fisik loket)
  transactions: Transaction[];
  coffeeExpenses: CoffeeExpenseItem[];
  attendedEmployeeIds: string[];
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  totalTickets: number;
  totalGrossRevenue: number; // totalTickets * 7000
  totalCashTickets: number;
  totalCashRevenue: number;
  totalCashTransactions: number;
  totalTransferTickets: number;
  totalTransferRevenue: number;
  totalTransferTransactions: number;
  totalCoffeeDeduction: number;
  totalNetRevenue: number;
  days: DailySummary[];
}

export interface MonthlySummary {
  year: number;
  month: number; // 1 - 12
  monthName: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  totalGrossRevenue: number; // totalTickets * 7000
  totalCashTickets: number;
  totalCashRevenue: number;
  totalTransferTickets: number;
  totalTransferRevenue: number;
  totalCoffeeDeduction: number;
  totalNetRevenue: number;
  days: DailySummary[];
}

export interface EmployeePayrollItem {
  employeeId: string;
  employeeName: string;
  role: string;
  attendanceDaysCount: number; // Jumlah keberangkatan
  attendedDates: string[];
  salaryAmount: number; // attendanceDaysCount * salaryPerAttendance
}

export interface WeeklyPayrollSummary {
  startDate: string;
  endDate: string;
  totalTickets: number;
  totalCoffeeDeduction: number;
  equivalentCleanTickets: number; // (Total Gross - Total Coffee) / 7000
  ratePerTicket: number; // 2100
  totalPayrollBudget: number; // equivalentCleanTickets * 2100
  totalDepartures: number; // Total seluruh keberangkatan karyawan minggu ini
  salaryPerDeparture: number; // totalPayrollBudget / totalDepartures
  items: EmployeePayrollItem[];
  isPaid?: boolean;
  paidDate?: string;
}
