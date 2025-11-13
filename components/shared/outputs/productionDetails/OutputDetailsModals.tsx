import { FaChevronUp } from "react-icons/fa"
import ModalContainer from "../ModalContainer"
import { IoIosClose } from "react-icons/io"
import { useEffect, useRef, useState } from "react";
import { IProduction } from "@/lib/models/production.model";
import InputWithLabel from "../../inputs/InputWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import TextAreaWithLabel from "../../inputs/TextAreaWithLabel";
import { updateProduction } from "@/lib/actions/production.action";
import { enqueueSnackbar } from "notistack";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

type OutputDetailsModalsProps = {
    openNew:boolean;
    setOpenNew: (open:boolean)=>void;
    production:IProduction | null;
}

const OutputDetailsModals = ({production, openNew, setOpenNew}:OutputDetailsModalsProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IProduction>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {currency} = useCurrencyConfig();

    useEffect(() => {
        if(production){
            setData({...production});
        }
    }, [production])

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
            ...data,
            status:'Completed',
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

  return (
     <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
      <div className={`flex w-[90%] md:w-[50%]`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
            <div className="flex flex-col gap-1">
                <span className="title" >Edit output details</span>
                <span className="greyText" >Enter the output details of the production</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel defaultValue={production?.outputQuantity} type="number" onChange={onChange} name="outputQuantity" min={0} required placeholder="eg. 20" label="Actual output quantity" className="w-full" />
                    <InputWithLabel defaultValue={production?.rejQuantity} type="number" onChange={onChange} name="rejQuantity" min={0}  placeholder="eg. 2" label="Rejected quantity" className="w-full" />
                    <InputWithLabel defaultValue={production?.lossQuantity} type="number" onChange={onChange} name="lossQuantity" min={0}  placeholder="eg. 1" label="Loss quantity" className="w-full" />
                </div>
            
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <InputWithLabel defaultValue={production?.extraCost} type="number" onChange={onChange} name="extraCost" min={0}  placeholder={`eg. ${currency?.symbol}200`} label={`Extra cost on production ${currency?.symbol}`} className="w-full" />
                        <TextAreaWithLabel defaultValue={production?.notes} name="notes" onChange={onChange} placeholder="enter note" label="Production note" className="w-full" />
                    </div>
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
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

export default OutputDetailsModals