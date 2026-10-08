import React, { Dispatch } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectProducts from "@/components/shared/inputs/dropdowns/SearchSelectProducts";
import SearchSelectBatches from "@/components/shared/inputs/dropdowns/SearchSelectBatches";
import SearchSelectCurrencies from "@/components/shared/inputs/dropdowns/SearchSelectCurrencies";
import { IProduct } from "@/lib/models/product.model";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";

interface StepBasicInfoProps {
  setProductToProduce: Dispatch<React.SetStateAction<IProduct | null>>;
  setBatch: Dispatch<React.SetStateAction<string>>;
  setOtherCurrency: Dispatch<React.SetStateAction<IOtherCurrency | null>>;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  setProductToProduce,
  setBatch,
  setOtherCurrency,
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
      <GenericLabel
        label="Select Currency *"
        input={<SearchSelectCurrencies required setSelect={setOtherCurrency} />}
      />
    </div>
  );
};

export default StepBasicInfo;