import React from "react";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";

interface StepFinalReviewProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  pCostInCurrency: number;
  labourCostInCurrency: number;
  finalPrice: number;
  currencySymbol: string;
}

const StepFinalReview: React.FC<StepFinalReviewProps> = ({
  onChange,
  pCostInCurrency,
  labourCostInCurrency,
  finalPrice,
  currencySymbol,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          onChange={onChange}
          name="name"
          required
          placeholder="eg. Coffee Production"
          label="Give it a name *"
          className="w-full"
        />
        <InputWithLabel
          onChange={onChange}
          name="xquantity"
          required
          type="number"
          min={1}
          placeholder="10"
          label="Expected output quantity *"
          className="w-full"
        />
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-lg">
        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Cost Breakdown</h4>
        <div className="space-y-2 border-b border-slate-800 pb-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Production Cost:</span>
            <span>{currencySymbol}{pCostInCurrency.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Labour Cost:</span>
            <span>{currencySymbol}{labourCostInCurrency.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-semibold">Total Cost</span>
          <span className="text-2xl font-black text-emerald-400">
            {currencySymbol}{finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepFinalReview;