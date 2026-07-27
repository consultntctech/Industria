import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import TextAreaWithLabel from "@/components/shared/inputs/TextAreaWithLabel";
import ModalContainer from "@/components/shared/outputs/ModalContainer";
import { useAuth, useCanUser } from "@/hooks/useAuth";
import { createOtherCurrency, updateOtherCurrency } from "@/lib/actions/othercurrency.action";
import { ICurrency } from "@/lib/models/currency.model";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import '@/styles/customscroll.css'

type OtherCurrencyCompProps = {
    openNew: boolean;
    setOpenNew: Dispatch<SetStateAction<boolean>>;
    currentOtherCurrency: IOtherCurrency | null;
    setCurrentOtherCurrency: Dispatch<SetStateAction<IOtherCurrency | null>>;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<IOtherCurrency[], Error>>;
    currency: ICurrency | null | undefined;
}

const OtherCurrencyComp = ({openNew, setOpenNew, currentOtherCurrency, setCurrentOtherCurrency, refetch, currency}:OtherCurrencyCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IOtherCurrency>>({});
    const {user} = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const isConfigurer = useCanUser('48', 'UPDATE');
    const isConfigAdmin = useCanUser('48', 'CREATE');
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentOtherCurrency(null);
    }

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    useEffect(() => {
        if(currentOtherCurrency){
            setData(currentOtherCurrency);
        }
    }, [currentOtherCurrency])

    const handleSubmit = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createOtherCurrency({...data, org:user?.org, createdBy:user?._id, creator:user?.name});
            enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                setOpenNew(false);
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating batch code', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await updateOtherCurrency(data);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating batch code', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const conv = `${data?.rate} x ${currency?.symbol || currency?.name || 'Prmiaray Currency'} = ${data?.symbol || data?.name || 'This Currency'}1`;

  return (
    <ModalContainer open={openNew} handleClose={handleClose}>
        <div className="flex max-h-[90%] w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={currentOtherCurrency ? handleUpdate : handleSubmit} className="flex-col overflow-y-scroll scrollbar-custom w-full gap-8 p-4 formBox">
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentOtherCurrency ? 'Edit currency' : 'Add new currency'}</span>
                    <span className="greyText" >Currencies are used to convert financial values</span>
                </div>

                <div className="flex flex-col w-full gap-4">
                    <InputWithLabel name="name" placeholder="eg. Dollar" label="Currency name" defaultValue={currentOtherCurrency?.name} onChange={onChange} required className="w-full" />
                    <InputWithLabel name="symbol" placeholder="eg. $" label="Symbol" defaultValue={currentOtherCurrency?.symbol} onChange={onChange} required className="w-full" />
                    <div className="flex flex-col gap-1.5">
                        <InputWithLabel name="rate" type="number" min={0} placeholder="eg. 5" label="Exchange Rate" defaultValue={currentOtherCurrency?.rate} onChange={onChange} required className="w-full" />
                        {
                            data?.rate  &&
                            <span className="greyText2">{conv}</span>
                        }
                    </div>
                    <TextAreaWithLabel name="note" placeholder="eg. This is a note" label="Note" defaultValue={currentOtherCurrency?.note} onChange={onChange} className="w-full" />
                    {
                        (isConfigurer || isConfigAdmin) &&
                        <PrimaryButton loading={loading} disabled={currentOtherCurrency ? !isConfigurer : !isConfigAdmin} type="submit" text={loading?"saving" : currentOtherCurrency ? 'Update' : 'Submit'} className="w-full mt-4" />
                    }
                </div>

                <div className="flex self-end p-2 transition-all border border-gray-200 rounded-full cursor-pointer w-fit hover:bg-gray-100" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        </div>
    </ModalContainer>
  )
}

export default OtherCurrencyComp