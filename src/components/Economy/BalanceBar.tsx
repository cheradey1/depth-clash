import React from 'react';
import { DollarSign, Ship, Coins } from 'lucide-react';

interface BalanceBarProps {
  currencyBalance: number;
  premiumShips: number;
  balanceUsd: number;
}

export const BalanceBar: React.FC<BalanceBarProps> = ({ currencyBalance, premiumShips, balanceUsd }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl text-sm text-slate-200">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700">
        <DollarSign size={18} className="text-emerald-400" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Balance</div>
          <div className="font-semibold text-white">${balanceUsd.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700">
        <Coins size={18} className="text-amber-300" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Game Currency</div>
          <div className="font-semibold text-white">{currencyBalance}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700">
        <Ship size={18} className="text-sky-400" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Premium Ships</div>
          <div className="font-semibold text-white">{premiumShips}</div>
        </div>
      </div>
    </div>
  );
};
