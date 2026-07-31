import { ILineItem } from "@/lib/models/lineitem.model";
import ModalContainer from "../../ModalContainer"
import { useEffect, useRef, useState } from "react";
import { updateLineItem } from "@/lib/actions/lineitem.action";
import { enqueueSnackbar } from "notistack";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import { IoIosClose } from "react-icons/io";
import { FaChevronUp } from "react-icons/fa";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { Tooltip } from "@mui/material";
import {useCanUser } from "@/hooks/useAuth";import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import { IOriginalPrice } from "@/types/Types";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectCurrencies from "@/components/shared/inputs/dropdowns/SearchSelectCurrencies";
import '@/styles/customscroll.css'
import CustomCheckV2 from "@/components/misc/CustomCheckV2";


type LineItemEditCompProps = {
    showEdit:boolean;
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
    currentLineItem:ILineItem | null;
    setCurrentLineItem:React.Dispatch<React.SetStateAction<ILineItem | null>>;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<ILineItem[], Error>>
}

const LineItemEditComp = ({showEdit, refetch, setShowEdit, currentLineItem, setCurrentLineItem}:LineItemEditCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<ILineItem>>({});
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);
    const [useRate, setUseRate] = useState(false);
    const [price, setPrice] = useState<number>(0);
    const formRef = useRef<HTMLFormElement>(null);
    const isEditor = useCanUser('44', 'UPDATE');
    const {currency} = useCurrencyConfig();

    const original = currentLineItem?.original as IOriginalPrice;
    const currentCurrency = original?.currency as IOtherCurrency;
    const showRate = exposeRate(currentCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);

    const cost = price * rate;


    useEffect(() => {
        if(currentLineItem){
            setData({...currentLineItem});
            setOtherCurrency(currentCurrency);
            setPrice(original?.amount || 0);
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentLineItem])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleClose = ()=>{
        setShowEdit(false);
        setCurrentLineItem(null);
        setData({});
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateLineItem({...data, price:cost, original:{amount:price, rate, currency:otherCurrency?._id as string}});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setShowEdit(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating category', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const costLabel = `Price (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Price (${otherCurrency?.symbol || otherCurrency?.name})`;

  return (
    <ModalContainer open={showEdit} handleClose={()=>setShowEdit(false)}>
        <div className="flex w-[90%] md:w-[50%] h-[90%] items-center">
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full h-full overflow-y-scroll scrollbar-custom " >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentLineItem?.status !== 'Sold' ? 'Update line item' : 'This item is sold'}</span>
                    <span className="greyText" >{currentLineItem?.status === 'Sold' ? 'You cannot edit sold items':'Set the price and serial number for this line item'}</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                    <Tooltip title='Give it a unique name for easy identification' >
                        <InputWithLabel defaultValue={currentLineItem?.name} onChange={onChange} name="name" required placeholder="eg. item 1" label="Name" className="w-full" />
                    </Tooltip>
                    <InputWithLabel defaultValue={currentLineItem?.serialNumber} onChange={onChange} name="serialNumber" placeholder="eg. S1234" label="Serial Number" className="w-full" />
                    <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!original} setSelect={setOtherCurrency} value={currentCurrency} />} />
                    {
                        showRate &&
                        <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                    }
                    <InputWithLabel step={0.0001} defaultValue={price} onChange={(e)=>setPrice(Number(e.target.value))} name="price" placeholder="eg. S1234" label={otherCurrency ? otherLabel : costLabel} className="w-full" />
                    {
                        otherCurrency &&
                        <InputWithLabel readOnly value={cost} placeholder="eg. S1234" label={costLabel} className="w-full" />
                    }
                    {
                        currentLineItem?.status !== 'Sold' && isEditor &&
                        <PrimaryButton disabled={(currentLineItem?.status === 'Sold') || !isEditor} loading={loading} type="submit" text={loading?"loading" : "Update" } className="w-full mt-4" />
                    }
                    </div>

                </div>
        
                <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <IoIosClose className="text-red-700" />
                </div>
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        </div>
    </ModalContainer>
  )
}

export default LineItemEditComp