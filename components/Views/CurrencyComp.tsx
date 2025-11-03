'use client'
import { LinearProgress } from "@mui/material"
import InputWithLabel from "../shared/inputs/InputWithLabel"
import PrimaryButton from "../shared/buttons/PrimaryButton"
import { useEffect, useRef, useState } from "react";
import { ICurrency } from "@/lib/models/currency.model";
import { useAuth } from "@/hooks/useAuth";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { createCurrency } from "@/lib/actions/currency.action";
import { enqueueSnackbar } from "notistack";

const CurrencyComp = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<ICurrency>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();

    const {currency, refetch, currencyLoading} = useCurrencyConfig();

    useEffect(() => {
        if(currency){
            setData({
                ...data,
                symbol: currency?.symbol,
            })
        }
    }, [currency])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
       }

      const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const confData:Partial<ICurrency> = {
            ...data,
            symbol: data.symbol || currency?.symbol,
            org: user?.org,
            createdBy: user?._id
          }
          const res = await createCurrency(confData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while saving currency', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }
  return (
    <div className={`flex p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >

            <div className="flex flex-col gap-1">
                <span className="title" >Set up currency</span>
                <span className="greyText" >This will be attached to all your production amounts</span>
            </div>
            {
              currencyLoading ? 
              <LinearProgress className='w-full' />
              :
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  <div className="flex gap-4 flex-col w-full">
                  <InputWithLabel required defaultValue={currency?.symbol} onChange={onChange} name="symbol"  placeholder="eg. $" label="Currency symbol" className="w-full" />
                  
                  <PrimaryButton loading={loading} type="submit" text={loading?"saving" : "Save"} className="w-fit px-4 mt-4" />
                  </div>
              </div>
            }
    
            
        </form>
    </div>
  )
}

export default CurrencyComp