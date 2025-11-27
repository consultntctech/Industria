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
    const formRef = useRef<HTMLFormElement>(null);

    const {currency} = useCurrencyConfig();

    useEffect(() => {
        if(currentLineItem){
            setData({...currentLineItem});// Set form data when currentUser changes
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
          const res = await updateLineItem({...data,});
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
  return (
    <ModalContainer open={showEdit} handleClose={()=>setShowEdit(false)}>
        <div className="flex w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentLineItem?.status !== 'Sold' ? 'Update line item' : 'This item is sold'}</span>
                    <span className="greyText" >{currentLineItem?.status === 'Sold' ? 'You cannot edit sold items':'Set the price and serial number for this line item'}</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                    <Tooltip title='Give it a unique name for easy identification' >
                        <InputWithLabel defaultValue={currentLineItem?.name} onChange={onChange} name="name" required placeholder="eg. item 1" label="Name" className="w-full" />
                    </Tooltip>
                    <InputWithLabel defaultValue={currentLineItem?.serialNumber} onChange={onChange} name="serialNumber" required placeholder="eg. S1234" label="Serial Number" className="w-full" />
                    <InputWithLabel defaultValue={currentLineItem?.price} onChange={onChange} name="price" required placeholder="eg. S1234" label={`Set price ${currency ? `(${currency?.symbol})`:'' } `} className="w-full" />
                    {
                        currentLineItem?.status !== 'Sold' &&
                        <PrimaryButton disabled={currentLineItem?.status === 'Sold'} loading={loading} type="submit" text={loading?"loading" : "Update" } className="w-full mt-4" />
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