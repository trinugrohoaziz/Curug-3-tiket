import React, { useState } from 'react';
import { CalendarDays, FileSpreadsheet, Calendar, Sparkles } from 'lucide-react';
import { DailyReportView } from './DailyReportView';
import { WeeklyReportView } from './WeeklyReportView';
import { MonthlyReportView } from './MonthlyReportView';
import {
  Transaction,
  DailyRecord,
  TouristSpotConfig,
  CoffeeExpenseItem,
  Employee,
} from '../types';

export type ReportSubTab = 'daily' | 'weekly' | 'monthly';

interface ReportsHubProps {
  initialSubTab?: ReportSubTab;
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
  onGoToPayroll: () => void;
}

export const ReportsHub: React.FC<ReportsHubProps> = ({
  initialSubTab = 'daily',
  transactions,
  dailyRecords,
  employees,
  config,
  onUpdateCoffee,
  onToggleAttendance,
  onAddEmployee,
  onGoToPayroll,
}) => {
  const [subTab, setSubTab] = useState<ReportSubTab>(initialSubTab);

  return (
    <div className="flex flex-col flex-1">
      {/* Top Segmented Sub-Nav */}
      <div className="p-3 pb-0 bg-slate-950 sticky top-0 z-20">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSubTab('daily')}
            className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Harian</span>
          </button>

          <button
            onClick={() => setSubTab('weekly')}
            className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'weekly'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Mingguan</span>
          </button>

          <button
            onClick={() => setSubTab('monthly')}
            className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'monthly'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bulanan</span>
          </button>
        </div>
      </div>

      {/* Sub-tab view */}
      <div className="flex-1">
        {subTab === 'daily' && (
          <DailyReportView
            transactions={transactions}
            dailyRecords={dailyRecords}
            employees={employees}
            config={config}
            onUpdateCoffee={onUpdateCoffee}
            onToggleAttendance={onToggleAttendance}
            onAddEmployee={onAddEmployee}
          />
        )}

        {subTab === 'weekly' && (
          <WeeklyReportView
            transactions={transactions}
            dailyRecords={dailyRecords}
            config={config}
            onSelectDayForDetail={() => setSubTab('daily')}
            onGoToPayroll={onGoToPayroll}
          />
        )}

        {subTab === 'monthly' && (
          <MonthlyReportView
            transactions={transactions}
            dailyRecords={dailyRecords}
            config={config}
            onSelectDayForDetail={() => setSubTab('daily')}
          />
        )}
      </div>
    </div>
  );
};
