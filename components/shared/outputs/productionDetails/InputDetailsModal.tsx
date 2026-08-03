import { FaChevronUp } from "react-icons/fa"
import ModalContainer from "../ModalContainer"
import { IoIosClose } from "react-icons/io"
import { useEffect, useRef, useState } from "react";
import { IProduction } from "@/lib/models/production.model";
import InputWithLabel from "../../inputs/InputWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import { updateProduction } from "@/lib/actions/production.action";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../../inputs/GenericLabel";
import { IProduct } from "@/lib/models/product.model";
import SearchSelectBatches from "../../inputs/dropdowns/SearchSelectBatches";
import SearchSelectUsers from "../../inputs/dropdowns/SearchSelectUsers";
import SearchSelectProducts from "../../inputs/dropdowns/SearchSelectProducts";
import { IBatch } from "@/lib/models/batch.model";
import { IUser } from "@/lib/models/user.model";
import {useCanUser } from "@/hooks/useAuth";;
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOriginalPrice } from "@/types/Types";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import SearchSelectCurrencies from "../../inputs/dropdowns/SearchSelectCurrencies";
import CustomCheckV2 from "@/components/misc/CustomCheckV2";

type InputDetailsModalProps = {
    openNew:boolean;
    setOpenNew: (open:boolean)=>void;
    production:IProduction | null;
}

const InputDetailsModal = ({production, openNew, setOpenNew}:InputDetailsModalProps) => {
    const {currency} = useCurrencyConfig();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IProduction>>({});

    const [batch, setBatch] = useState<string>('');
    const [productToProduce, setProductToProduce] = useState<IProduct|null>(null);
    const [supervisor, setSupervisor] = useState<IUser | null>(null);
    const [useRate, setUseRate] = useState(false);
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency|null>(null);
    // const [originalCost, setOriginalCost] = useState(0);
    const [pCost, setPCost] = useState(0);
    const [labourCost, setLabourCost] = useState(0);
    const isEditor = useCanUser('8', 'UPDATE');

    const formRef = useRef<HTMLFormElement>(null);

    const batched = production?.batch as IBatch;
    const productToProd = production?.productToProduce as IProduct;
    const supervisord = production?.supervisor as IUser;
    const original = production?.original as IOriginalPrice;
    const savedCurrency = original?.currency as IOtherCurrency;

    const pc = Number(production?.pCost || 0);
    const lc = Number(production?.labourCost || 0);


    const showRate = exposeRate(savedCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);

    const productionCost = (pCost + labourCost) * rate;

    const extra = Number(production?.productionCost || 0) - (pc + lc);

    const finalLabourCost = labourCost * rate;
    const finalPCost = pCost * rate;

    const ogRate = Number(original?.rate || 1);

    const ogAmount = Number(original?.amount || 0);

    const ogLabour  = lc / ogRate;
    const ogPCost = pc / ogRate;

    const ogExtra = ogAmount - (ogPCost + ogLabour);

    const finalOg = ogExtra + (pCost + labourCost);

    const finalPrice = productionCost + extra;
    console.log()

    useEffect(() => {
        if(production){
            setBatch(batched?._id);
            setProductToProduce(productToProd);
            setSupervisor(supervisord);
            setOtherCurrency(savedCurrency);
            setData({...production});
            // setOriginalCost(Number(original?.amount || 0));
            setPCost(ogPCost);
            setLabourCost(ogLabour);
        }
    }, [production]);

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const updateData:Partial<IProduction> = {
            ...production,
            ...data,
            status: production?.status === 'Completed' ? 'Completed' : 'In Progress',
            id:production?._id,
            batch, supervisor: supervisor?._id, productToProduce: productToProduce?._id,
            productionCost: finalPrice,
            pCost: finalPCost,
            labourCost: finalLabourCost,
            original:{
              amount: finalOg,
              rate,
              currency: otherCurrency?._id as string,
            },
          };
          const res = await updateProduction(updateData);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              window.location.reload();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating production', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const costLabel = `Production cost (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Production cost (${otherCurrency?.symbol || otherCurrency?.name})`;

    const labourLabel = `Labour cost (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabourLabel = `Labour cost (${otherCurrency?.symbol || otherCurrency?.name})`;

    // const otherTotalLabel = `Total cost (${otherCurrency?.symbol || otherCurrency?.name})`;
    const totalLabel = `Total cost (${currency?.symbol || currency?.name || 'Primary currency'})`;

  return (
     <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
      <div className={`flex w-[90%] md:w-[50%]`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
            <div className="flex flex-col gap-1">
                <span className="title" >Edit input details</span>
                <span className="greyText" >Edit the primary details of the production</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel defaultValue={production?.name} onChange={onChange} name="name" required placeholder="eg. Coffee Production" label="Give it a name" className="w-full" />
                    <GenericLabel
                        label="Select batch"
                        input={<SearchSelectBatches type="Finished Good" value={batched} required={true} setSelect={setBatch} />}
                    />
                    <GenericLabel
                        label="Select supervisor"
                        input={<SearchSelectUsers value={supervisord} required={true} setSelect={setSupervisor} />}
                    />
                    <GenericLabel
                        label="Product to produce"
                        input={<SearchSelectProducts value={productToProd} type="Finished Good" required={true} setSelect={setProductToProduce} />}
                    />
                </div>
            
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <InputWithLabel onChange={onChange} defaultValue={production?.xquantity} name="xquantity" required type="number" min={1} placeholder="10" label="Expected output quantity" className="w-full" />
                        <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!original} setSelect={setOtherCurrency} value={savedCurrency} />} />
                        {
                            showRate &&
                        <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                        }
                        <InputWithLabel defaultValue={ogPCost} onChange={(e)=>setPCost(Number(e.target.value))} name="pCost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={otherCurrency ? otherLabel : costLabel} className="w-full" />
                        <InputWithLabel defaultValue={ogLabour} onChange={(e)=>setLabourCost(Number(e.target.value))} name="labourCost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={otherCurrency ? otherLabourLabel : labourLabel} className="w-full" />
                        {
                            // otherCurrency &&
                            <InputWithLabel value={productionCost} readOnly type="number" min={1} placeholder={`${currency?.symbol}1000`} label={totalLabel} className="w-full" />
                        }
                    </div>
                    {
                        isEditor &&
                        <PrimaryButton disabled={!isEditor} loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                    }
                </div>
            </div>
    
            <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                <IoIosClose className="text-red-700" />
            </div>
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                <FaChevronUp />
            </div>
        </form>
      </div>
    </ModalContainer>
  )
}

export default InputDetailsModal