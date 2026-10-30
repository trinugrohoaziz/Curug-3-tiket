import React, { useState, useEffect, useMemo } from 'react';
import { AndroidFrame, NavTab } from './components/AndroidFrame';
import { PosTicketCounter } from './components/PosTicketCounter';
import { GuestListWeekly } from './components/GuestListWeekly';
import { ReportsHub } from './components/ReportsHub';
import { PayrollView } from './components/PayrollView';
import { SettingsModal } from './components/SettingsModal';
import { ReceiptModal } from './components/ReceiptModal';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  CoffeeExpenseItem,
  Employee,
} from './types';
import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredDailyRecords,
  updateCoffeeDeduction,
  getStoredConfig,
  saveStoredConfig,
  getStoredEmployees,
  addEmployee,
  toggleEmployeeAttendance,
  resetAllData,
  loadDemoSampleData,
  calculateDailySummary,
} from './services/storage';
import { getIsoDateOnly } from './utils/formatters';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('pos');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [config, setConfig] = useState<TouristSpotConfig>(getStoredConfig());
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedTrx = getStoredTransactions();
    const loadedRecords = getStoredDailyRecords();
    const loadedConfig = getStoredConfig();
    const loadedEmployees = getStoredEmployees();

    setTransactions(loadedTrx);
    setDailyRecords(loadedRecords);
    setConfig(loadedConfig);
    setEmployees(loadedEmployees);
  }, []);

  // Today's summary for header pill
  const todayDateStr = useMemo(() => getIsoDateOnly(), []);

  const todaySummary = useMemo(() => {
    return calculateDailySummary(todayDateStr, transactions, dailyRecords);
  }, [todayDateStr, transactions, dailyRecords]);

  // Handler: New Transaction Complete
  const handleTransactionComplete = (newTrx: Transaction) => {
    const updated = [newTrx, ...transactions];
    setTransactions(updated);
    saveStoredTransactions(updated);
    setActiveReceipt(newTrx);
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
  };

  // Handler: Update Coffee
  const handleUpdateCoffee = (
    date: string,
    amount: number,
    expenses?: CoffeeExpenseItem[],
    notes?: string
  ) => {
    updateCoffeeDeduction(date, amount, expenses, notes);
    setDailyRecords(getStoredDailyRecords());
  };

  // Handler: Toggle Employee Attendance
  const handleToggleAttendance = (date: string, employeeId: string) => {
    toggleEmployeeAttendance(date, employeeId);
    setDailyRecords(getStoredDailyRecords());
  };

  // Handler: Add New Employee
  const handleAddEmployee = (name: string, role: string) => {
    addEmployee(name, role);
    setEmployees(getStoredEmployees());
  };

  // Handler: Save Config
  const handleSaveConfig = (newConfig: TouristSpotConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
  };

  // Handler: Reset Data to 100% EMPTY clean data
  const handleResetData = () => {
    resetAllData();
    setTransactions([]);
    setDailyRecords({});
    setConfig(getStoredConfig());
    setEmployees(getStoredEmployees());
    setCurrentTab('pos');
  };

  // Handler: Load Demo Simulation Data (Optional)
  const handleLoadDemoData = () => {
    const demo = loadDemoSampleData();
    setTransactions(demo.transactions);
    setDailyRecords(getStoredDailyRecords());
  };

  return (
    <AndroidFrame
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      config={config}
      todayTicketsCount={todaySummary.totalTickets}
      todayCashRevenue={todaySummary.cashRevenue}
      todayTransferRevenue={todaySummary.transferRevenue}
    >
      {/* 1. Loket POS (Cash & Transfer Sederhana) */}
      {currentTab === 'pos' && (
        <PosTicketCounter
          config={config}
          onTransactionComplete={handleTransactionComplete}
          todaySummary={{
            totalTickets: todaySummary.totalTickets,
            cashRevenue: todaySummary.cashRevenue,
            transferRevenue: todaySummary.transferRevenue,
          }}
        />
      )}

      {/* 2. Buku Tamu (1 Minggu) */}
      {currentTab === 'guests' && (
        <GuestListWeekly
          transactions={transactions}
          config={config}
          onViewReceipt={(trx) => setActiveReceipt(trx)}
          onDeleteTransaction={handleDeleteTransaction}
          onAddTransaction={handleTransactionComplete}
        />
      )}

      {/* 3. Laporan Hub (Harian, Mingguan, Bulanan) */}
      {currentTab === 'reports' && (
        <ReportsHub
          transactions={transactions}
          dailyRecords={dailyRecords}
          employees={employees}
          config={config}
          onUpdateCoffee={handleUpdateCoffee}
          onToggleAttendance={handleToggleAttendance}
          onAddEmployee={handleAddEmployee}
          onGoToPayroll={() => setCurrentTab('payroll')}
        />
      )}

      {/* 4. Menu Pembayaran Gaji Karyawan (Dihitung Hari Minggu) */}
      {currentTab === 'payroll' && (
        <PayrollView
          transactions={transactions}
          dailyRecords={dailyRecords}
          employees={employees}
          config={config}
          onGoToDaily={() => setCurrentTab('reports')}
        />
      )}

      {/* 5. Pengaturan */}
      {currentTab === 'settings' && (
        <SettingsModal
          config={config}
          employees={employees}
          onSaveConfig={handleSaveConfig}
          onResetData={handleResetData}
          onLoadDemoData={handleLoadDemoData}
        />
      )}

      {/* Digital & Thermal Printable Receipt Modal */}
      <ReceiptModal
        transaction={activeReceipt}
        config={config}
        onClose={() => setActiveReceipt(null)}
      />
    </AndroidFrame>
  );
}
