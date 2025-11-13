import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
// import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import SearchSelectBatches from "../shared/inputs/dropdowns/SearchSelectBatches";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectUsers from "../shared/inputs/dropdowns/SearchSelectUsers";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import { IProduct } from "@/lib/models/product.model";
import SearchSelectAvMultipleRMaterials from "../shared/inputs/dropdowns/SearchSelectAvMultipleRMaterials";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import RMQSelector from "../misc/RMQSelector";
import { IIngredient } from "@/types/Types";
import SearchSelectMultipleProdItems from "../shared/inputs/dropdowns/SearchSelectMultipleProdItems";
import { IProduction } from "@/lib/models/production.model";
import { IProdItem } from "@/lib/models/proditem.model";
import { enqueueSnackbar } from "notistack";
import { createProduction } from "@/lib/actions/production.action";
import { useRouter } from "next/navigation";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

const NewProductionComp = () => {
    const [loading, setLoading] = useState(false);
    const [batch, setBatch] = useState<string>('');
    const [supervisor, setSupervisor] = useState<string>('');
    const [productToProduce, setProductToProduce] = useState<IProduct|null>(null);
    const [productBatchId, setProductBatchId] = useState<string>('');
    const [rawMaterials, setRawMaterials] = useState<IRMaterial[]>([]);
    const [ingredients, setIngredients] = useState<IIngredient[]>([]);
    const [proditems, setProditems] = useState<IProdItem[]>([]);
    const [data, setData] = useState<Partial<IProduction>>({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalProd, setTotalProd] = useState(0);
    const [productionCost, setProductionCost] = useState(0);

    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();



    useEffect(() => {
        const price = rawMaterials.reduce((sum, material) => {
            const ingredient = ingredients.find(ing => ing.materialId === material._id);
            const qUsed = ingredient?.qUsed || 0;
            return sum + (material.unitPrice * qUsed);
        }, 0);
        setTotalPrice(price);
    }, [rawMaterials, ingredients]);

   useEffect(() => {
        const prod = proditems.reduce((sum, item) => {
            return sum + (item?.price || 0);
        }, 0);
        setTotalProd(prod);
    }, [proditems]);

    // console.log('Total Price: ', totalPrice);
    useEffect(() => {
        setProductionCost(totalPrice + totalProd);
    }, [totalPrice, totalProd]);
 
    const onchangeProdCost = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target;
        setProductionCost(Number(value));
    }

    // alert(totalPrice + totalProd);

    useEffect(() => {
        const validIds = new Set(rawMaterials.map(rm => rm._id));
        setIngredients(prev => prev.filter(ing => validIds.has(ing.materialId)));
        setData(pre=>({
            ...pre,
            productionCost
        }));
    }, [rawMaterials, totalPrice, totalPrice, totalProd]);

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
            const prodData:Partial<IProduction> = {
                ...data,
                batch,
                productToProduce: productToProduce?._id,
                status:'New',
                org:user?.org,
                createdBy:user?._id,
                supervisor,
                ingredients: ingredients.map(ing=>({
                    materialId: ing.materialId,
                    quantity: ing.qUsed
                })),
                proditems: proditems?.map(item=>item._id),
                inputQuantity: rawMaterials?.length,
            }
            
          const res = await createProduction(prodData);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              const payload = res.payload as IProduction;
              router.push(`/dashboard/processing/production/${payload?._id}`);
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while starting a production', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }
    const onChangeInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {id, value} = e.target;
        const qty = parseInt(value, 10) || 0;
        setIngredients(pre=>{
            const existing = pre.find(ing=>ing.materialId === id);
            if(existing){
                return pre.map(ing=>ing.materialId === id ? {...ing, qUsed: qty} : ing);
            }else{
                return [...pre, {materialId:id, qUsed: qty}];
            }
        })
    }

    // console.log('Ingredients: ', ingredients)

  return (
     <div className={`flex p-4 lg:p-8 rounded-2xl w-full`}>
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Start a new production</span>
                    <span className="greyText" >You may need to come back to this page to add more details to production.</span>
                </div>
                

                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel onChange={onChange} name="name" required placeholder="eg. Coffee Production" label="Give it a name" className="w-full" />
                        <GenericLabel
                            label="Select batch"
                            input={<SearchSelectBatches type="Finished Good" required={true} setSelect={setBatch} />}
                        />
                        <GenericLabel
                            label="Select supervisor"
                            input={<SearchSelectUsers required={true} setSelect={setSupervisor} />}
                        />
                        <GenericLabel
                            label="Product to produce"
                            input={<SearchSelectProducts type="Finished Good" required={true} setSelect={setProductToProduce} />}
                        />
                        <InputWithLabel onChange={onChange} name="xquantity" required type="number" min={1} placeholder="10" label="Expected output quantity" className="w-full" />
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <GenericLabel
                                label="Pick a batch to select raw materials"
                                input={<SearchSelectBatches type="Raw Material" required={true} setSelect={setProductBatchId} />}
                            />
                            <GenericLabel
                                label="Select raw materials"
                                input={<SearchSelectAvMultipleRMaterials setSelection={setRawMaterials} batchId={productBatchId} />}
                            />

                            {
                                rawMaterials.length > 0 &&
                                <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                                    <span className="subtitle text-gray-500 gap-2" >Raw Materials</span>
                                    <div className="flex flex-row flex-wrap items-center gap-2">
                                        {
                                            rawMaterials.map((material, index)=>
                                                <RMQSelector key={index} material={material} inputId={material?._id} onChangeInput={onChangeInput} name={material?.materialName} />
                                            )
                                        }
                                    </div>
                                </div>
                            }
                            <GenericLabel
                                label="Add production items"
                                input={<SearchSelectMultipleProdItems setSelection={setProditems} />}
                            />
                            <InputWithLabel value={productionCost} onChange={onchangeProdCost} name="productionCost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={`Production cost ${currency?.symbol}`} className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                    </div>
                </div>
            </form>
        </div>
  )
}

export default NewProductionComp