import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import TextAreaWithLabel from "@/components/shared/inputs/TextAreaWithLabel";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IProduction } from "@/lib/models/production.model";
import { ChangeEvent } from "react";

type OldStepOutputProps = {
  production: IProduction | null;
  onchange:(e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>void;
  currency: IOtherCurrency | null;
  savedCurrency: IOtherCurrency | null;
}

const OldStepOutput = ({production, onchange, currency, savedCurrency}:OldStepOutputProps) => {
 const rawExtraCost = Number(production?.extraCost || 0) / Number(savedCurrency?.rate || 1);
  return (
    <div className="space-y-5 animate-fadeIn" >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel defaultValue={production?.outputQuantity} onChange={onchange} label="Actual output quantity *"
          name="outputQuantity" type="number" min={0.0001} step={0.0001} placeholder="10" required={!production?.outputQuantity} 
        />
        <InputWithLabel defaultValue={production?.rejQuantity} onChange={onchange} label="Rejected quantity"
          name="rejQuantity" type="number" min={0} step={0.0001} placeholder="10" required 
        />
        <InputWithLabel defaultValue={production?.lossQuantity} onChange={onchange} label="Loss quantity"
          name="lossQuantity" type="number" min={0} step={0.0001} placeholder="10" required 
        />
        <InputWithLabel defaultValue={rawExtraCost} onChange={onchange} label={`Extra cost on production (${currency?.symbol})`}
          name="extraCost" type="number" min={0} step={0.0001} placeholder="10" required 
        />
      </div>

      <TextAreaWithLabel defaultValue={production?.notes} onChange={onchange} label="Production note"
        name="notes" placeholder="enter note" 
      />
    </div>
  )
}

export default OldStepOutput