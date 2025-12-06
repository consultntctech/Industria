import { updateGood } from "@/lib/actions/good.action";
import { IGood } from "@/lib/models/good.model";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ModalContainer from "../shared/outputs/ModalContainer";
import { useFetchGoods } from "@/hooks/fetch/useFetchGoods";
import { IoIosClose } from "react-icons/io";
import { FaChevronUp } from "react-icons/fa";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
// import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

type GoodsCompProps = {
    openNew:boolean;
    setOpenNew: Dispatch<SetStateAction<boolean>>;
    currentGood:IGood | null;
    setCurrentGood:Dispatch<SetStateAction<IGood | null>>;
}


const GoodsComp = ({openNew, setOpenNew, currentGood, setCurrentGood}:GoodsCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IGood>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {refetch} = useFetchGoods();
    // const {currency} = useCurrencyConfig();


    useEffect(() => {
        if(currentGood){
            setData({...currentGood});// Set form data when currentUser changes
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentGood])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentGood(null);
        setData({});
    }

    

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateGood({...data});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              refetch();
              handleClose();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating finished goods', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }
  return (
    <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
        <div className="flex w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={handleUpdate}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Update finished goods</span>
                    <span className="greyText" >Add more to the finished goods</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                    {/* <InputWithLabel type="number" min={0} defaultValue={currentGood?.unitPrice} onChange={onChange} name="unitPrice"  label={currency ? `Unit Price (${currency?.symbol})` : 'Unit Price'} className="w-full" /> */}
                    <InputWithLabel type="number" min={0} defaultValue={currentGood?.threshold} onChange={onChange} name="threshold"  label="Threshold" className="w-full" />
                    <TextAreaWithLabel defaultValue={currentGood?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" :  "Update"} className="w-full mt-4" />
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

export default GoodsComp