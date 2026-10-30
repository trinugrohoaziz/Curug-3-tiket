import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Users,
  FileSpreadsheet,
  Coins,
  Settings,
  Wifi,
  BatteryCharging,
  Smartphone,
  Maximize2,
  TreePine,
} from 'lucide-react';
import { TouristSpotConfig } from '../types';
import { AndroidInstallModal } from './AndroidInstallModal';

export type NavTab = 'pos' | 'guests' | 'reports' | 'payroll' | 'settings';

interface AndroidFrameProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  config: TouristSpotConfig;
  todayTicketsCount: number;
  todayCashRevenue: number;
  todayTransferRevenue: number;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onTabChange,
  config,
  todayTicketsCount,
  children,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('08:00');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'pos' as NavTab,
      label: 'Loket Tiket',
      icon: Ticket,
      badge: null,
    },
    {
      id: 'guests' as NavTab,
      label: 'Buku Tamu',
      icon: Users,
      badge: todayTicketsCount > 0 ? `${todayTicketsCount}` : null,
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'payroll' as NavTab,
      label: 'Gaji Karyawan',
      icon: Coins,
      badge: 'Minggu',
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-0 md:p-3 transition-colors">
      {/* Desktop Helper Toggle */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md px-4 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <TreePine className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            {config.spotName}
          </span>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
            Rp 7.000/org
          </span>
        </div>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 hover:text-emerald-400 transition cursor-pointer px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
          title="Ubah mode tampilan Android / Layar Penuh"
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Mode Lebar</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Frame Android</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Mobile or Framed */}
      <div
        className={`w-full bg-slate-950 flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-md h-[92vh] max-h-[880px] rounded-[38px] border-[8px] border-slate-800 ring-1 ring-slate-700/50'
            : 'max-w-lg min-h-screen md:min-h-[94vh] md:rounded-3xl md:border md:border-slate-800'
        }`}
      >
        {/* Android Native Status Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md px-5 pt-2 pb-1.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/40 select-none z-30">
          <span className="font-semibold tracking-wider text-slate-300 font-mono text-[11px]">
            {currentTime}
          </span>
          {/* Android Camera Punch Hole / Speaker Notch */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner"></div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-bold tracking-tighter text-emerald-400">
              4G+
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Dynamic App Header */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-emerald-950 px-4 py-2.5 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Ticket className="w-5 h-5 text-slate-950 stroke-[2.4]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight">
                {config.spotName}
              </h1>
              <p className="text-[11px] text-emerald-300/80 font-medium">
                {config.cashierName} •{' '}
                <span className="text-emerald-400 font-bold">Rp 7.000</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-1 bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-full text-[11px] shadow-sm hover:bg-emerald-300 transition cursor-pointer active:scale-95"
              title="Install aplikasi ke HP Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install .APK</span>
            </button>
          </div>
        </div>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-slate-950">
          {children}
        </div>

        {/* Android Bottom Navigation Bar */}
        <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shrink-0 z-40 select-none pb-safe">
          <div className="grid grid-cols-5 gap-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`relative p-1 rounded-full transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 scale-105'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 min-w-[14px] h-3.5 rounded-full flex items-center justify-center shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight ${
                      isActive ? 'font-bold text-emerald-300' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 w-6 h-0.5 bg-emerald-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Android Gesture Bar */}
          <div className="w-full flex justify-center pt-1.5 pb-0.5">
            <div className="w-28 h-1 rounded-full bg-slate-700/60"></div>
          </div>
        </div>

        {/* Android Install / APK Modal */}
        <AndroidInstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      </div>
    </div>
  );
};
