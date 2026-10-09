import React from "react";
import { ILabourer } from "@/lib/models/labourer.model";

export interface ILabourerAllocation {
  labourerId: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  isOverridden: boolean;
}

interface LabourerSelectorProps {
  labourer: ILabourer;
  allocation: ILabourerAllocation;
  onUpdateAllocation: (labourerId: string, hours: number, cost: number, isOverridden: boolean) => void;
  currencySymbol: string;
  label?: string;
}

const LabourerSelector: React.FC<LabourerSelectorProps> = ({
  labourer,
  allocation,
  onUpdateAllocation,
  currencySymbol,
  label='Hours on production'
}) => {
  const hourlyRate = labourer.rate || 0;

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Math.max(0, parseFloat(e.target.value) || 0);
    const cost = allocation.isOverridden ? allocation.totalCost : hours * hourlyRate;
    onUpdateAllocation(labourer._id, hours, cost, allocation.isOverridden);
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = Math.max(0, parseFloat(e.target.value) || 0);
    onUpdateAllocation(labourer._id, allocation.hoursWorked, cost, true);
  };

  const handleResetOverride = () => {
    const calculatedCost = allocation.hoursWorked * hourlyRate;
    onUpdateAllocation(labourer._id, allocation.hoursWorked, calculatedCost, false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm w-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-semibold text-slate-800 text-sm">{labourer.name}</span>
        <span className="text-xs bg-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full">
          {currencySymbol}{hourlyRate.toFixed(2)} / hr
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={allocation.hoursWorked || ""}
            onChange={handleHoursChange}
            placeholder="0"
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-slate-500">Total Cost</label>
            {allocation.isOverridden && (
              <button
                type="button"
                onClick={handleResetOverride}
                className="text-[10px] text-indigo-600 hover:underline font-semibold"
              >
                Reset Auto
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              {currencySymbol}
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={allocation.totalCost || ""}
              onChange={handleCostChange}
              placeholder="0.00"
              className={`w-full pl-10 pr-3 py-1.5 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition ${
                allocation.isOverridden ? "border-amber-400 font-semibold text-amber-900 bg-amber-50/20" : "border-slate-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourerSelector;