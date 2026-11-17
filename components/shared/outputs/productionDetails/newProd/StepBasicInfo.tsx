import React, { Dispatch } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectProducts from "@/components/shared/inputs/dropdowns/SearchSelectProducts";
import SearchSelectBatches from "@/components/shared/inputs/dropdowns/SearchSelectBatches";
import { ActiveCurrencyField } from "@/components/currency/CurrencyProvider";
import { IProduct } from "@/lib/models/product.model";

interface StepBasicInfoProps {
  setProductToProduce: Dispatch<React.SetStateAction<IProduct | null>>;
  setBatch: Dispatch<React.SetStateAction<string>>;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  setProductToProduce,
  setBatch,
}) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <GenericLabel
        label="Product to Produce *"
        input={<SearchSelectProducts type="Finished Good" required setSelect={setProductToProduce} />}
      />
      <GenericLabel
        label="Select Batch *"
        input={<SearchSelectBatches type="Finished Good" required setSelect={setBatch} />}
      />
      <ActiveCurrencyField label="Currency *" />
    </div>
  );
};

export default StepBasicInfo;