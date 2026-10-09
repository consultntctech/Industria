import React, { Dispatch, SetStateAction } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import SearchSelectAvMultipleRMaterials from "@/components/shared/inputs/dropdowns/SearchSelectAvMultipleRMaterials";
import SearchSelectMultipleGoodsWithRM from "@/components/shared/inputs/dropdowns/SearchSelectMultipleGoodsWithRM";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { IGood } from "@/lib/models/good.model";
import { IIngredient } from "@/types/Types";
import RMQSelectorV2 from "./OldRMQSelector";
import GoodQSelectorV2 from "./OldGoodQSelector";
import SearchSelectBatches from "@/components/shared/inputs/dropdowns/SearchSelectBatches";

interface OldStepMaterialsAndGoodsProps {
  productBatchId: string;
  setProductBatchId: Dispatch<SetStateAction<string>>;
  rawMaterials: IRMaterial[];
  setRawMaterials: Dispatch<SetStateAction<IRMaterial[]>>;
  ingredients: IIngredient[];
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  goodBatch: string;
  setGoodBatch: Dispatch<SetStateAction<string>>;
  goods: IGood[];
  setGoods: Dispatch<SetStateAction<IGood[]>>;
  finishedIngredients: IIngredient[];
  onChangeFinishedInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productionCost: number;
  onchangeProdCost: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currencySymbol: string;
  savedRawRawMaterials: IRMaterial[];
  savedFinishedGoods: IGood[];
  // production: IProduction | null;
  // currency: IOtherCurrency | null;
  setUserOverrodeCost: Dispatch<SetStateAction<boolean>>;
  setUserResetCost: Dispatch<SetStateAction<boolean>>;
  userOverrodeCost: boolean;
  // userResetCost: boolean;
}

const OldStepMaterialsAndGoods: React.FC<OldStepMaterialsAndGoodsProps> = ({
  productBatchId,
  setProductBatchId,
  rawMaterials,
  setRawMaterials,
  ingredients,
  onChangeInput,
  goodBatch,
  setGoodBatch,
  goods,
  setGoods,
  finishedIngredients,
  onChangeFinishedInput,
  productionCost,
  onchangeProdCost,
  currencySymbol,
  savedRawRawMaterials,
  savedFinishedGoods,
  // production,
  // currency,
  setUserOverrodeCost,
  setUserResetCost,
  userOverrodeCost,
}) => {
  
  const handleResetOverride = () => {
    setUserResetCost(true);
    setUserOverrodeCost(false);
  }

  const handleDefaultCost = () => {
    setUserResetCost(false);
    setUserOverrodeCost(false);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Raw Materials Section */}
      <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Raw Materials</h3>
        <GenericLabel
          label="Pick a batch to select raw materials"
          input={<SearchSelectBatches type="Raw Material" setSelect={setProductBatchId} />}
        />
        <GenericLabel
          label="Select raw materials"
          input={<SearchSelectAvMultipleRMaterials value={savedRawRawMaterials} setSelection={setRawMaterials} batchId={productBatchId} />}
        />

        {rawMaterials.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {rawMaterials.map((material, idx) => {
              const ingredient = ingredients.find((ing) => ing.materialId === material._id);
              return (
                <RMQSelectorV2
                  key={idx}
                  material={material}
                  inputId={material._id}
                  onChangeInput={onChangeInput}
                  quantity={ingredient?.qUsed}
                  weight={ingredient?.weight}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Finished Goods Section */}
      <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Unfinished Goods</h3>
        <GenericLabel
          label="Select unfinished batch"
          input={<SearchSelectBatches type="Finished Good" setSelect={setGoodBatch} />}
        />
        <GenericLabel
          label="Select unfinished goods"
          input={<SearchSelectMultipleGoodsWithRM value={savedFinishedGoods} setSelection={setGoods} batchId={goodBatch} />}
        />

        {goods.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {goods.map((good, idx) => {
              const ingredient = finishedIngredients.find((ing) => ing.materialId === good._id);
              return (
                <GoodQSelectorV2
                  key={idx}
                  material={good}
                  inputId={good._id}
                  onChangeInput={onChangeFinishedInput}
                  quantity={ingredient?.qUsed}
                  weight={ingredient?.weight}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="flex relative">
        <InputWithLabel
          step={0.01}
          value={productionCost}
          // defaultValue={Number(production?.pCost || 0)/Number(currency?.rate || 1)}
          onChange={onchangeProdCost}
          name="productionCost"
          type="number"
          min={0}
          placeholder={`${currencySymbol}1000`}
          label={`Production cost (${currencySymbol})`}
          className="w-full"
        />

        <button
          type="button"
          onClick={userOverrodeCost ? handleResetOverride : handleDefaultCost}
          className="text-[10px] absolute top-1/4 right-1 -translate-y-1/2 text-indigo-600 hover:underline font-semibold cursor-pointer"
        >
          {userOverrodeCost ? `Reset Auto-calculated` : `Reset to Default`}
        </button>
      </div>
    </div>
  );
};

export default OldStepMaterialsAndGoods;