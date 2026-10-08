import React from "react";
import { IGood } from "@/lib/models/good.model";
// import { IBatch } from "@/lib/models/batch.model";
// import { IProduct } from "@/lib/models/product.model";

interface GoodQSelectorV2Props {
  material: IGood;
  inputId: string;
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  quantity?: number;
  weight?: number;
}

const GoodQSelectorV2: React.FC<GoodQSelectorV2Props> = ({
  material,
  inputId,
  onChangeInput,
  quantity = 0,
  weight = 0,
}) => {
  // const product = material?.product as unknown as IProduct
  // const batch = material?.batch as unknown as IBatch
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all shadow-sm w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800 text-sm truncate" title={material.serialName}>
          {material?.serialName}
          {/* {`${product?.name || material?.serialName} (${batch?.code})`} */}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">
          Unfin Good
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`qty-${inputId}`} className="block text-[11px] font-semibold text-slate-500 mb-1">
            Qty <span className="text-rose-500">*</span>
          </label>
          <input
            id={`qty-${inputId}`}
            type="number"
            min={0.0001}
            step={0.0001}
            required
            max={material?.raw}
            name={`qty-${inputId}`}
            value={quantity || ""}
            onChange={onChangeInput}
            placeholder="0"
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
          />
        </div>
        <div>
          <label htmlFor={`wt-${inputId}`} className="block text-[11px] font-semibold text-slate-500 mb-1">
            Weight <span className="text-rose-500">*</span>
          </label>
          <input
            id={`wt-${inputId}`}
            type="number"
            step="0.0001"
            min={0.0001}
            required
            name={`wt-${inputId}`}
            value={weight || ""}
            onChange={onChangeInput}
            placeholder="0.00"
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};

export default GoodQSelectorV2;