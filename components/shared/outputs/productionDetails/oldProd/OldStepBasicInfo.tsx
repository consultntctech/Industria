import React, { Dispatch } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectProducts from "@/components/shared/inputs/dropdowns/SearchSelectProducts";
import SearchSelectBatches from "@/components/shared/inputs/dropdowns/SearchSelectBatches";
import SearchSelectCurrencies from "@/components/shared/inputs/dropdowns/SearchSelectCurrencies";
import { IProduct } from "@/lib/models/product.model";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IProduction } from "@/lib/models/production.model";
import { IBatch } from "@/lib/models/batch.model";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";

interface OldStepBasicInfoProps {
  setProductToProduce: Dispatch<React.SetStateAction<IProduct | null>>;
  setBatch: Dispatch<React.SetStateAction<string>>;
  setOtherCurrency: Dispatch<React.SetStateAction<IOtherCurrency | null>>;
  production: IProduction | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OldStepBasicInfo: React.FC<OldStepBasicInfoProps> = ({
  setProductToProduce,
  setBatch,
  setOtherCurrency,
  production,
  onChange,
}) => {
  const productToProduce = production?.productToProduce as IProduct;
  const batch = production?.batch as IBatch;
  // const original = production?.original as IOriginalPrice;
  const currency = production?.original?.currency as IOtherCurrency;
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <GenericLabel
          label="Product to Produce *"
          input={<SearchSelectProducts value={productToProduce} type="Finished Good" required={!productToProduce} setSelect={setProductToProduce} />}
        />
        <GenericLabel
          label="Select Batch *"
          input={<SearchSelectBatches value={batch} type="Finished Good" required={!batch} setSelect={setBatch} />}
        />
        <GenericLabel
          label="Select Currency *"
          input={<SearchSelectCurrencies value={currency} required={!currency} setSelect={setOtherCurrency} />}
        />
        <InputWithLabel
            onChange={onChange}
            name="xquantity"
            defaultValue={production?.xquantity}
            required
            type="number"
            min={1}
            placeholder="10"
            label="Expected output quantity *"
            className="w-full"
        />
      </div>
    </div>
  );
};

export default OldStepBasicInfo;