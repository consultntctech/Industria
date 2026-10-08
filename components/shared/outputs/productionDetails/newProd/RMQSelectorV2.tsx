// import { IBatch } from "@/lib/models/batch.model";
// import { IProduct } from "@/lib/models/product.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";

interface RMQSelectorV2Props {
  material: IRMaterial;
  inputId: string;
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  quantity?: number;
  weight?: number;
}

const RMQSelectorV2: React.FC<RMQSelectorV2Props> = ({
  material,
  inputId,
  onChangeInput,
  quantity = 0,
  weight = 0,
}) => {
  // const product = material?.product as unknown as IProduct
  // const batch = material?.batch as unknown as IBatch
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800 text-sm truncate" title={material.materialName}>
          {material?.materialName}
          {/* {`${product?.name || material?.materialName} (${batch?.code})`} */}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
          Raw Mat
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
            required
            step={0.0001}
            max={material?.qAccepted}
            name={`qty-${inputId}`}
            value={quantity || ""}
            onChange={onChangeInput}
            placeholder="0"
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
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
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};

export default RMQSelectorV2;