import React, { Dispatch, SetStateAction } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectMultipleLabourers from "@/components/shared/inputs/dropdowns/SearchSelectMultipleLabourers";
import { ILabourer } from "@/lib/models/labourer.model";
import LabourerSelector, { ILabourerAllocation } from "./LabourerSelector";

interface StepLabourersProps {
  labourers: ILabourer[];
  setLabourers: Dispatch<SetStateAction<ILabourer[]>>;
  labourAllocations: Record<string, ILabourerAllocation>;
  handleUpdateLabourerAllocation: (
    labourerId: string,
    hours: number,
    cost: number,
    isOverridden: boolean
  ) => void;
  computedLabourCost: number;
  currencySymbol: string;
}

const StepLabourers: React.FC<StepLabourersProps> = ({
  labourers,
  setLabourers,
  labourAllocations,
  handleUpdateLabourerAllocation,
  computedLabourCost,
  currencySymbol,
}) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <GenericLabel
        label="Select labourers"
        input={<SearchSelectMultipleLabourers setSelection={setLabourers} placeholder="labourers" />}
      />

      {labourers.length > 0 ? (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Labour Cost Allocations</h4>
          {labourers.map((labourer) => (
            <LabourerSelector
              key={labourer._id}
              labourer={labourer}
              allocation={
                labourAllocations[labourer._id] || {
                  labourerId: labourer._id,
                  hoursWorked: 0,
                  hourlyRate: labourer.rate || 0,
                  totalCost: 0,
                  isOverridden: false,
                }
              }
              onUpdateAllocation={handleUpdateLabourerAllocation}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No labourers selected yet.</p>
        </div>
      )}

      <div className="flex justify-between items-center p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
        <span className="text-sm font-semibold text-indigo-900">Total Calculated Labour Cost</span>
        <span className="text-lg font-bold text-indigo-600">
          {currencySymbol}{computedLabourCost.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default StepLabourers;