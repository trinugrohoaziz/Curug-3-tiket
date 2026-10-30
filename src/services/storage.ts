import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  CoffeeExpenseItem,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
  Employee,
  WeeklyPayrollSummary,
  EmployeePayrollItem,
  PaymentMethod,
} from '../types';
import {
  getIsoDateOnly,
  getPastNDays,
  getIndonesianDayName,
  formatIndonesianDate,
  INDO_MONTHS,
} from '../utils/formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'curug_telu_prod_trx_v5',
  DAILY_RECORDS: 'curug_telu_prod_records_v5',
  CONFIG: 'curug_telu_prod_config_v5',
  EMPLOYEES: 'curug_telu_prod_employees_v5',
};

export const DEFAULT_CONFIG: TouristSpotConfig = {
  spotName: 'Wisata Curug Telu & Sendang Bidadari',
  tagline: 'Pesona Air Terjun Alami & Sendang Bidadari Baturraden',
  location: 'Desa Karangsalam, Baturraden, Banyumas',
  ticketPrice: 7000,
  cashierName: 'Loket Curug Telu',
  receiptFooter: 'Tiket resmi Curug Telu & Sendang Bidadari. Harap simpan tiket & selalu jaga kebersihan kawasan alam.',
};

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Budi Santoso', role: 'Petugas Loket 1', active: true },
  { id: 'emp-2', name: 'Joko Susilo', role: 'Petugas Pintu Masuk', active: true },
  { id: 'emp-3', name: 'Siti Rahma', role: 'Petugas Loket 2', active: true },
  { id: 'emp-4', name: 'Agus Hidayat', role: 'Keamanan Curug & Sendang', active: true },
  { id: 'emp-5', name: 'Hendra Wijaya', role: 'Koordinator Lapangan', active: true },
];

export const getStoredConfig = (): TouristSpotConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed reading config', err);
  }
  return DEFAULT_CONFIG;
};

export const saveStoredConfig = (config: TouristSpotConfig): void => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

export const getStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading employees', err);
  }
  saveStoredEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
};

export const saveStoredEmployees = (employees: Employee[]): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const addEmployee = (name: string, role: string): Employee => {
  const current = getStoredEmployees();
  const newEmp: Employee = {
    id: `emp-${Date.now()}`,
    name,
    role,
    active: true,
  };
  current.push(newEmp);
  saveStoredEmployees(current);
  return newEmp;
};

/**
 * PRODUCTION MODE: Default is EMPTY clean data (0 transactions)
 * User can start real-world ticketing immediately!
 */
export const getStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading transactions', err);
  }
  // Clean empty initial state
  const cleanTrx: Transaction[] = [];
  saveStoredTransactions(cleanTrx);
  return cleanTrx;
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredDailyRecords = (): Record<string, DailyRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    if (raw) {
      const list: DailyRecord[] = JSON.parse(raw);
      const map: Record<string, DailyRecord> = {};
      list.forEach((r) => {
        map[r.date] = {
          ...r,
          employeeAttendance: r.employeeAttendance || [],
        };
      });
      return map;
    }
  } catch (err) {
    console.error('Failed reading daily records', err);
  }

  // Clean empty records
  const cleanRecords: Record<string, DailyRecord> = {};
  saveStoredDailyRecords([]);
  return cleanRecords;
};

export const saveStoredDailyRecords = (records: DailyRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
};

export const toggleEmployeeAttendance = (date: string, employeeId: string): string[] => {
  const currentMap = getStoredDailyRecords();
  const existing = currentMap[date] || {
    date,
    coffeeDeduction: 0,
    coffeeExpenses: [],
    employeeAttendance: [],
  };

  const currentAttended = new Set(existing.employeeAttendance || []);
  if (currentAttended.has(employeeId)) {
    currentAttended.delete(employeeId);
  } else {
    currentAttended.add(employeeId);
  }

  const updatedList = Array.from(currentAttended);
  currentMap[date] = {
    ...existing,
    employeeAttendance: updatedList,
  };

  saveStoredDailyRecords(Object.values(currentMap));
  return updatedList;
};

export const updateCoffeeDeduction = (
  date: string,
  newTotal: number,
  expenses?: CoffeeExpenseItem[],
  notes?: string
): void => {
  const currentMap = getStoredDailyRecords();
  const existing = currentMap[date] || {
    date,
    coffeeDeduction: 0,
    coffeeExpenses: [],
    employeeAttendance: [],
  };

  currentMap[date] = {
    ...existing,
    coffeeDeduction: Math.max(0, newTotal),
    coffeeExpenses: expenses !== undefined ? expenses : existing.coffeeExpenses,
    notes: notes !== undefined ? notes : existing.notes,
  };

  saveStoredDailyRecords(Object.values(currentMap));
};

export const addTransaction = (newTrx: Transaction): void => {
  const current = getStoredTransactions();
  current.unshift(newTrx);
  saveStoredTransactions(current);
};

export const deleteTransaction = (id: string): void => {
  const current = getStoredTransactions();
  const filtered = current.filter((t) => t.id !== id);
  saveStoredTransactions(filtered);
};

/**
 * Calculates summary for a single day:
 * Penambahan 1000 transfer tidak dimasukkan dalam laporan, cukup dalam tiketing.
 */
export const calculateDailySummary = (
  dateStr: string,
  transactions: Transaction[],
  dailyRecords: Record<string, DailyRecord>
): DailySummary => {
  const dayTrx = transactions.filter((t) => t.date === dateStr);
  const record = dailyRecords[dateStr];
  const coffeeDeduction = record ? record.coffeeDeduction : 0;
  const coffeeExpenses = record ? record.coffeeExpenses : [];
  const attendedEmployeeIds = record ? record.employeeAttendance || [] : [];

  let totalTickets = 0;
  let cashCount = 0;
  let cashTickets = 0;
  let transferCount = 0;
  let transferTickets = 0;

  dayTrx.forEach((t) => {
    totalTickets += t.guestCount;
    if (t.paymentMethod === 'CASH') {
      cashCount++;
      cashTickets += t.guestCount;
    } else {
      transferCount++;
      transferTickets += t.guestCount;
    }
  });

  const cashRev = cashTickets * 7000;
  const transferRev = transferTickets * 7000;
  const totalGross = totalTickets * 7000;

  const netRevenue = Math.max(0, totalGross - coffeeDeduction);
  const netCashOnHand = Math.max(0, cashRev - coffeeDeduction);

  return {
    date: dateStr,
    dayName: getIndonesianDayName(dateStr),
    formattedDate: formatIndonesianDate(dateStr),
    totalTickets,
    totalGrossRevenue: totalGross,
    cashTransactionsCount: cashCount,
    cashTickets,
    cashRevenue: cashRev,
    transferTransactionsCount: transferCount,
    transferTickets,
    transferRevenue: transferRev,
    coffeeDeduction,
    netRevenue,
    netCashOnHand,
    transactions: dayTrx,
    coffeeExpenses,
    attendedEmployeeIds,
  };
};

/**
 * Calculates 1-week summary based on given 7 dates (Murni tiket 7.000)
 */
export const calculateWeeklySummary = (
  dates: string[],
  transactions: Transaction[],
  dailyRecords: Record<string, DailyRecord>
): WeeklySummary => {
  const days: DailySummary[] = dates.map((d) =>
    calculateDailySummary(d, transactions, dailyRecords)
  );

  let totalTickets = 0;
  let totalGross = 0;
  let totalCashTickets = 0;
  let totalCashRev = 0;
  let totalCashTrx = 0;
  let totalTransferTickets = 0;
  let totalTransferRev = 0;
  let totalTransferTrx = 0;
  let totalCoffee = 0;

  days.forEach((day) => {
    totalTickets += day.totalTickets;
    totalGross += day.totalGrossRevenue;

    totalCashTickets += day.cashTickets;
    totalCashRev += day.cashRevenue;
    totalCashTrx += day.cashTransactionsCount;

    totalTransferTickets += day.transferTickets;
    totalTransferRev += day.transferRevenue;
    totalTransferTrx += day.transferTransactionsCount;

    totalCoffee += day.coffeeDeduction;
  });

  const totalNetRevenue = Math.max(0, totalGross - totalCoffee);

  return {
    startDate: dates[0] || getIsoDateOnly(),
    endDate: dates[dates.length - 1] || getIsoDateOnly(),
    totalTickets,
    totalGrossRevenue: totalGross,
    totalCashTickets,
    totalCashRevenue: totalCashRev,
    totalCashTransactions: totalCashTrx,
    totalTransferTickets,
    totalTransferRevenue: totalTransferRev,
    totalTransferTransactions: totalTransferTrx,
    totalCoffeeDeduction: totalCoffee,
    totalNetRevenue,
    days,
  };
};

/**
 * Calculates Weekly Payroll on Sunday
 */
export const calculateWeeklyPayroll = (
  weekDates: string[],
  transactions: Transaction[],
  dailyRecords: Record<string, DailyRecord>,
  employees: Employee[]
): WeeklyPayrollSummary => {
  const weekly = calculateWeeklySummary(weekDates, transactions, dailyRecords);

  const totalTickets = weekly.totalTickets;
  const totalCoffee = weekly.totalCoffeeDeduction;
  const equivalentCleanTickets = Math.max(0, (weekly.totalGrossRevenue - totalCoffee) / 7000);
  const ratePerTicket = 2100;
  const totalPayrollBudget = Math.round(equivalentCleanTickets * ratePerTicket);

  const empAttendanceMap: Record<string, string[]> = {};
  employees.forEach((emp) => {
    empAttendanceMap[emp.id] = [];
  });

  weekDates.forEach((dateStr) => {
    const record = dailyRecords[dateStr];
    const attended = record ? record.employeeAttendance || [] : [];
    attended.forEach((empId) => {
      if (empAttendanceMap[empId]) {
        empAttendanceMap[empId].push(dateStr);
      }
    });
  });

  let totalDepartures = 0;
  employees.forEach((emp) => {
    totalDepartures += (empAttendanceMap[emp.id] || []).length;
  });

  const salaryPerDeparture =
    totalDepartures > 0 ? Math.round(totalPayrollBudget / totalDepartures) : 0;

  const items: EmployeePayrollItem[] = employees.map((emp) => {
    const attendedDates = empAttendanceMap[emp.id] || [];
    const count = attendedDates.length;
    const salaryAmount = count * salaryPerDeparture;
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      attendanceDaysCount: count,
      attendedDates,
      salaryAmount,
    };
  });

  return {
    startDate: weekDates[0] || getIsoDateOnly(),
    endDate: weekDates[weekDates.length - 1] || getIsoDateOnly(),
    totalTickets,
    totalCoffeeDeduction: totalCoffee,
    equivalentCleanTickets,
    ratePerTicket,
    totalPayrollBudget,
    totalDepartures,
    salaryPerDeparture,
    items,
  };
};

/**
 * Calculates Monthly Summary for a specific year and month (Murni tiket 7.000)
 */
export const calculateMonthlySummary = (
  year: number,
  month: number,
  transactions: Transaction[],
  dailyRecords: Record<string, DailyRecord>
): MonthlySummary => {
  const monthStr = String(month).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    monthDates.push(`${year}-${monthStr}-${String(d).padStart(2, '0')}`);
  }

  const days: DailySummary[] = monthDates.map((d) =>
    calculateDailySummary(d, transactions, dailyRecords)
  );

  let totalTickets = 0;
  let totalGross = 0;
  let totalCashTickets = 0;
  let totalCashRev = 0;
  let totalTransferTickets = 0;
  let totalTransferRev = 0;
  let totalCoffee = 0;

  days.forEach((day) => {
    totalTickets += day.totalTickets;
    totalGross += day.totalGrossRevenue;

    totalCashTickets += day.cashTickets;
    totalCashRev += day.cashRevenue;
    totalTransferTickets += day.transferTickets;
    totalTransferRev += day.transferRevenue;
    totalCoffee += day.coffeeDeduction;
  });

  const totalNetRevenue = Math.max(0, totalGross - totalCoffee);

  return {
    year,
    month,
    monthName: INDO_MONTHS[month - 1] || '',
    startDate: monthDates[0],
    endDate: monthDates[monthDates.length - 1],
    totalTickets,
    totalGrossRevenue: totalGross,
    totalCashTickets,
    totalCashRevenue: totalCashRev,
    totalTransferTickets,
    totalTransferRevenue: totalTransferRev,
    totalCoffeeDeduction: totalCoffee,
    totalNetRevenue,
    days,
  };
};

/**
 * Resets database to 100% EMPTY clean data (0 tickets, 0 revenue)
 */
export const clearAllDataToEmpty = (): void => {
  saveStoredTransactions([]);
  saveStoredDailyRecords([]);
  saveStoredEmployees(DEFAULT_EMPLOYEES);
  saveStoredConfig(DEFAULT_CONFIG);
};

/**
 * Optional helper to load simulation demo data if user explicitly wants to test
 */
export const loadDemoSampleData = (): {
  transactions: Transaction[];
  dailyRecords: DailyRecord[];
} => {
  const past7Days = getPastNDays(7);
  const transactions: Transaction[] = [];
  const dailyRecords: DailyRecord[] = [];

  const sampleNames = [
    { name: 'Rombongan Bpk. Agus', origin: 'Purwokerto', cat: 'Rombongan' as const },
    { name: 'Keluarga Ibu Ratna', origin: 'Jakarta', cat: 'Keluarga' as const },
    { name: 'Dimas & Rekan', origin: 'Cilacap', cat: 'Individu' as const },
    { name: 'Komunitas Motor Baturraden', origin: 'Banyumas', cat: 'Rombongan' as const },
    { name: 'Bpk. Hendra Wijaya', origin: 'Semarang', cat: 'Keluarga' as const },
    { name: 'Siti Nurhaliza & Teman', origin: 'Purbalingga', cat: 'Umum' as const },
    { name: 'Rombongan Mahasiswa Unsoed', origin: 'Purwokerto', cat: 'Pelajar' as const },
  ];

  past7Days.forEach((dateStr, dayIndex) => {
    const isToday = dayIndex === past7Days.length - 1;
    const isWeekend = dayIndex === 1 || dayIndex === 2;
    const guestCounts = isWeekend ? [12, 6, 20, 8, 4] : [4, 2, 8, 3, 5];

    let dayCoffeeTotal = 25000;
    const coffeeItems: CoffeeExpenseItem[] = [
      { id: `c-${dateStr}-1`, time: '09:00', description: 'Uang kopi pagi petugas piket', amount: 25000 },
    ];

    const attendedIds = ['emp-1', 'emp-2', 'emp-3', 'emp-4'];

    dailyRecords.push({
      date: dateStr,
      coffeeDeduction: dayCoffeeTotal,
      coffeeExpenses: coffeeItems,
      employeeAttendance: attendedIds,
      notes: 'Simulasi demo',
    });

    guestCounts.forEach((count, idx) => {
      if (isToday && idx > 3) return;
      const sample = sampleNames[(dayIndex * 2 + idx) % sampleNames.length];
      const isCash = idx % 2 === 0;
      const timestamp = `${dateStr}T${String(8 + idx).padStart(2, '0')}:15:00.000Z`;
      const ticketSubtotal = count * 7000;
      const transferAdminFee = !isCash ? 1000 : 0;
      const totalAmount = ticketSubtotal + transferAdminFee;

      transactions.push({
        id: `trx-${dateStr.replace(/-/g, '')}-${String(idx + 1).padStart(3, '0')}`,
        ticketCode: `CT-${dateStr.slice(8, 10)}${dateStr.slice(5, 7)}-${String(idx + 1).padStart(3, '0')}`,
        timestamp,
        date: dateStr,
        guestCount: count,
        unitPrice: 7000,
        ticketSubtotal,
        transferAdminFee: transferAdminFee > 0 ? transferAdminFee : undefined,
        totalAmount,
        paymentMethod: isCash ? 'CASH' : 'TRANSFER',
        cashPaid: isCash ? totalAmount : undefined,
        cashChange: 0,
        guestName: sample.name,
        originCity: sample.origin,
        category: sample.cat,
      });
    });
  });

  saveStoredTransactions(transactions);
  saveStoredDailyRecords(dailyRecords);
  return { transactions, dailyRecords };
};

export const resetAllData = (): void => {
  clearAllDataToEmpty();
};
