"use client";

import { useAuth, useCanUser } from "@/hooks/useAuth";
import { Activity, useEffect, useRef, useState } from "react";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { IProduct } from "@/lib/models/product.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { IIngredient } from "@/types/Types";
import { IProduction } from "@/lib/models/production.model";
import { enqueueSnackbar } from "notistack";
import { createProduction } from "@/lib/actions/production.action";
import { useRouter } from "next/navigation";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { ILabourer } from "@/lib/models/labourer.model";
import { IEmployee } from "@/lib/models/employee.model";
import { IGood } from "@/lib/models/good.model";
import { ILabourerAllocation } from "../shared/outputs/productionDetails/newProd/LabourerSelector";
import StepBasicInfo from "../shared/outputs/productionDetails/newProd/StepBasicInfo";
import StepMaterialsAndGoods from "../shared/outputs/productionDetails/newProd/StepMaterialsAndGoods";
import StepLabourers from "../shared/outputs/productionDetails/newProd/StepLabourers";
import StepPersonnel from "../shared/outputs/productionDetails/newProd/StepPersonnel";
import StepFinalReview from "../shared/outputs/productionDetails/newProd/StepFinalReview";

// Step Components

const WIZARD_STEPS = [
  { step: 1, title: "Basic Info", desc: "Product, Batch & Currency" },
  { step: 2, title: "Materials & Goods", desc: "Raw materials & Processed goods" },
  { step: 3, title: "Labour Costs", desc: "Labourers & spend allocation" },
  { step: 4, title: "Personnel", desc: "Supervisors & employees" },
  { step: 5, title: "Final Review", desc: "Output qty & submission" },
];

const NewProductionCompV2 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [batch, setBatch] = useState<string>("");
  const [productToProduce, setProductToProduce] = useState<IProduct | null>(null);
  const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);

  const [productBatchId, setProductBatchId] = useState<string>("");
  const [rawMaterials, setRawMaterials] = useState<IRMaterial[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);

  const [goodBatch, setGoodBatch] = useState<string>("");
  const [goods, setGoods] = useState<IGood[]>([]);
  const [finishedIngredients, setFinishedIngredients] = useState<IIngredient[]>([]);

  const [productionCost, setProductionCost] = useState(0);
  const [userOverrodeCost, setUserOverrodeCost] = useState(false);

  const [labourers, setLabourers] = useState<ILabourer[]>([]);
  const [labourAllocations, setLabourAllocations] = useState<Record<string, ILabourerAllocation>>({});

  const [supervisors, setSupervisors] = useState<IEmployee[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  const [data, setData] = useState<Partial<IProduction>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuth();
  const { currency } = useCurrencyConfig();
  const isCreator = useCanUser("8", "CREATE");

  // Calculate Raw Material Cost Base
  useEffect(() => {
    const price = rawMaterials.reduce((sum, material) => {
      const ingredient = ingredients.find((ing) => ing.materialId === material._id);
      const qUsed = ingredient?.qUsed || 0;
      return sum + (material.unitPrice || 0) * qUsed;
    }, 0);
    setTotalPrice(price);
  }, [rawMaterials, ingredients]);

  // Sync Production Cost unless overridden
  useEffect(() => {
    if (!userOverrodeCost) {
      setProductionCost(totalPrice);
    }
  }, [totalPrice, userOverrodeCost]);

  // Clean raw materials ingredients on selection change
  useEffect(() => {
    const validIds = new Set(rawMaterials.map((rm) => rm._id));
    setIngredients((prev) => prev.filter((ing) => validIds.has(ing.materialId)));
  }, [rawMaterials]);

  // Clean finished goods ingredients on selection change
  useEffect(() => {
    const validIds = new Set(goods.map((gd) => gd._id));
    setFinishedIngredients((prev) => prev.filter((ing) => validIds.has(ing.materialId)));
  }, [goods]);

  // Handle Labourers allocation changes
  useEffect(() => {
    setLabourAllocations((prev) => {
      const updated: Record<string, ILabourerAllocation> = {};
      labourers.forEach((lab) => {
        if (prev[lab._id]) {
          updated[lab._id] = prev[lab._id];
        } else {
          updated[lab._id] = {
            labourerId: lab._id,
            hoursWorked: 0,
            hourlyRate: lab.rate || 0,
            totalCost: 0,
            isOverridden: false,
          };
        }
      });
      return updated;
    });
  }, [labourers]);

  // Derived Values
  const computedLabourCost = Object.values(labourAllocations).reduce(
    (acc, curr) => acc + (curr.totalCost || 0),
    0
  );

  const rawQuantity = ingredients.reduce((acc, cur) => acc + (cur.qUsed || 0), 0);
  const finishedQuantity = finishedIngredients.reduce((acc, cur) => acc + (cur.qUsed || 0), 0);
  const inputQuantity = rawQuantity + finishedQuantity;

  const currencyRate = Number(otherCurrency?.rate || 1);
  const labourCostInCurrency = computedLabourCost * currencyRate;
  const pCostInCurrency = productionCost * currencyRate;
  const finalPrice = pCostInCurrency + labourCostInCurrency;
  const rawCostTotal = computedLabourCost + productionCost;

  const onchangeProdCost = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductionCost(Number(e.target.value));
    setUserOverrodeCost(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    if (name.startsWith("qty-")) {
      const materialId = name.replace("qty-", "");
      const qty = Number(value) || 0;
      setIngredients((pre) => {
        const existing = pre.find((ing) => ing.materialId === materialId);
        return existing
          ? pre.map((ing) => (ing.materialId === materialId ? { ...ing, qUsed: qty } : ing))
          : [...pre, { materialId, qUsed: qty, weight: 0 }];
      });
    } else if (name.startsWith("wt-")) {
      const materialId = name.replace("wt-", "");
      const weightVal = Number(value) || 0;
      setIngredients((pre) => {
        const existing = pre.find((ing) => ing.materialId === materialId);
        return existing
          ? pre.map((ing) => (ing.materialId === materialId ? { ...ing, weight: weightVal } : ing))
          : [...pre, { materialId, qUsed: 0, weight: weightVal }];
      });
    }
  };

  const onChangeFinishedInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    if (name.startsWith("qty-")) {
      const materialId = name.replace("qty-", "");
      const qty = Number(value) || 0;
      setFinishedIngredients((pre) => {
        const existing = pre.find((ing) => ing.materialId === materialId);
        return existing
          ? pre.map((ing) => (ing.materialId === materialId ? { ...ing, qUsed: qty } : ing))
          : [...pre, { materialId, qUsed: qty, weight: 0 }];
      });
    } else if (name.startsWith("wt-")) {
      const materialId = name.replace("wt-", "");
      const weightVal = Number(value) || 0;
      setFinishedIngredients((pre) => {
        const existing = pre.find((ing) => ing.materialId === materialId);
        return existing
          ? pre.map((ing) => (ing.materialId === materialId ? { ...ing, weight: weightVal } : ing))
          : [...pre, { materialId, qUsed: 0, weight: weightVal }];
      });
    }
  };

  const handleUpdateLabourerAllocation = (
    labourerId: string,
    hours: number,
    cost: number,
    isOverridden: boolean
  ) => {
    setLabourAllocations((prev) => ({
      ...prev,
      [labourerId]: {
        ...prev[labourerId],
        hoursWorked: hours,
        totalCost: cost,
        isOverridden,
      },
    }));
  };

//   console.log(currentStep)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep !== 5) return;

    setLoading(true);
    try {
      const prodData: Partial<IProduction> = {
        ...data,
        batch,
        productToProduce: productToProduce?._id,
        status: "New",
        org: user?.org,
        createdBy: user?._id,
        creator: user?.name,
        supervisors: supervisors?.map((sup) => sup._id),
        employees: employees?.map((emp) => emp._id),
        ingredients: ingredients.map((ing) => ({
          materialId: ing.materialId,
          quantity: ing.qUsed,
          weight: ing.weight,
        })),
        goods: finishedIngredients.map((ing) => ({
          materialId: ing.materialId,
          quantity: ing.qUsed,
          weight: ing.weight,
        })),
        inputQuantity,
        labourCost: labourCostInCurrency,
        extraCost: 0,
        pCost: pCostInCurrency,
        labourerAllocations: Object.values(labourAllocations).map((alloc) => ({labourer: alloc.labourerId, hoursWorked: alloc.hoursWorked, cost: alloc.totalCost, isOverridden: alloc.isOverridden})),  
        productionCost: finalPrice,
        original: {
          amount: rawCostTotal,
          rate: currencyRate,
          currency: (otherCurrency?._id as string) || "",
        },
      };
    //   console.log('Prod Data: ', prodData)

      const res = await createProduction(prodData);
      enqueueSnackbar(res.message, { variant: res.error ? "error" : "success" });
      if (!res.error) {
        formRef.current?.reset();
        const payload = res.payload as IProduction;
        router.push(`/dashboard/processing/production/${payload?._id}`);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("An error occurred while creating production", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

const validateAndNext = () => {
  if (currentStep === 1) {
    if (!productToProduce || !batch || !otherCurrency) {
      enqueueSnackbar("Please complete all required fields on this step.", { variant: "warning" });
      return;
    }
  } else if (currentStep === 2) {
    let hasStockError = false;

    for (const ing of ingredients) {
      const material = rawMaterials.find((rm) => rm._id === ing.materialId);
      if (ing.qUsed > 0 && Number(material?.qAccepted || 0) < ing.qUsed) {
        enqueueSnackbar(
          `Insufficient raw material for ${material?.materialName}. Available: ${material?.qAccepted}, Required: ${ing.qUsed}`,
          { variant: "warning" }
        );
        hasStockError = true;
      }
    }

    for (const ing of finishedIngredients) {
      const material = goods.find((rm) => rm._id === ing.materialId);
      if (ing.qUsed > 0 && Number(material?.raw || 0) < ing.qUsed) {
        enqueueSnackbar(
          `Insufficient processed goods for ${material?.serialName}. Available: ${material?.raw}, Required: ${ing.qUsed}`,
          { variant: "warning" }
        );
        hasStockError = true;
      }
    }

    if (hasStockError) return;

    if (
      ingredients?.some((ing) => ing.qUsed === 0 || ing.weight === 0) ||
      finishedIngredients?.some((ing) => ing?.qUsed === 0 || ing?.weight === 0)
    ) {
      enqueueSnackbar("Please complete all required fields on this step.", { variant: "warning" });
      return;
    }
  }

  setCurrentStep((prev) => Math.min(prev + 1, 5));
};

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const currencySymbol = otherCurrency?.symbol || otherCurrency?.name || "$";

//   console.log('Raw Materials: ', ingredients);
//   console.log('Finished Ingredients: ', finishedIngredients);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Navigation Bar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Start New Production</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Step {currentStep} of 5: {WIZARD_STEPS[currentStep - 1].desc}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 relative">
            {WIZARD_STEPS.map((s) => {
              const isActive = currentStep === s.step;
              const isPassed = currentStep > s.step;
              return (
                <div key={s.step} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? "bg-indigo-600" : isPassed ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium hidden sm:block truncate ${
                      isActive ? "text-indigo-600 font-semibold" : isPassed ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Children Content */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <Activity mode={currentStep === 1 ? 'visible': 'hidden'} >
                <StepBasicInfo
                    setProductToProduce={setProductToProduce}
                    setBatch={setBatch}
                    setOtherCurrency={setOtherCurrency}
                />
            </Activity>
                
            
            <Activity mode={currentStep === 2 ? 'visible': 'hidden'} >
                <StepMaterialsAndGoods
                    productBatchId={productBatchId}
                    setProductBatchId={setProductBatchId}
                    rawMaterials={rawMaterials}
                    setRawMaterials={setRawMaterials}
                    ingredients={ingredients}
                    onChangeInput={onChangeInput}
                    goodBatch={goodBatch}
                    setGoodBatch={setGoodBatch}
                    goods={goods}
                    setGoods={setGoods}
                    finishedIngredients={finishedIngredients}
                    onChangeFinishedInput={onChangeFinishedInput}
                    productionCost={productionCost}
                    onchangeProdCost={onchangeProdCost}
                    currencySymbol={currencySymbol}
                />
            </Activity>

            <Activity mode={currentStep === 3 ? 'visible': 'hidden'} >
                <StepLabourers
                    labourers={labourers}
                    setLabourers={setLabourers}
                    labourAllocations={labourAllocations}
                    handleUpdateLabourerAllocation={handleUpdateLabourerAllocation}
                    computedLabourCost={computedLabourCost}
                    currencySymbol={currencySymbol}
                />
            </Activity>

            <Activity mode={currentStep === 4 ? 'visible': 'hidden'} >
                <StepPersonnel
                    setSupervisors={setSupervisors}
                    setEmployees={setEmployees}
                    requireSupervisors={supervisors.length === 0}
                />
            </Activity>
                

            <Activity mode={currentStep === 5 ? 'visible': 'hidden'} >
                <StepFinalReview
                    onChange={onChange}
                    pCostInCurrency={pCostInCurrency}
                    labourCostInCurrency={labourCostInCurrency}
                    finalPrice={finalPrice}
                    currencySymbol={currency?.symbol || 'GH₵'}
                />
            </Activity>

          <button type="submit" className="hidden" />
        </form>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            }`}
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={validateAndNext}
              className="px-6 cursor-pointer py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all"
            >
              Next Step
            </button>
          ) : (
            isCreator && (
              <PrimaryButton
                disabled={!isCreator || loading}
                loading={loading}
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                text={loading ? "Creating..." : "Create Production"}
                className="px-8 py-2.5 rounded-xl text-sm shadow-md"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProductionCompV2;