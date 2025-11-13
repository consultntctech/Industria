import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectMultipleSuppliers from "../shared/inputs/dropdowns/SearchSelectMultipleSuppliers";
import { createProdItem, updateProdItem } from "@/lib/actions/proditem.action";
import { IProdItem } from "@/lib/models/proditem.model";
import { enqueueSnackbar } from "notistack";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ISupplier } from "@/lib/models/supplier.model";
import { useFetchProditem } from "@/hooks/fetch/useFetchProditem";

type ProdItemCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentProdItem:IProdItem | null;
  setCurrentProdItem:Dispatch<SetStateAction<IProdItem | null>>;
}

const ProdItemComp = ({openNew, setOpenNew, currentProdItem, setCurrentProdItem}:ProdItemCompProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [data, setData] = useState<Partial<IProdItem>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();
    const {refetch} = useFetchProditem();

    const savedSuppliers = currentProdItem?.suppliers as unknown as ISupplier[];


    useEffect(() => {
        if(currentProdItem){
            setData({...currentProdItem});
            setSuppliers(savedSuppliers.map(supplier=>supplier._id));
        }else{
            setData({});
            setSuppliers([]);
        }
    }, [currentProdItem])

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProdItem(null);
    }

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createProdItem({...data, org:user?.org, suppliers, createdBy:user?._id});
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating production item', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateProdItem({...data, suppliers});
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch()
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating production item', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentProdItem ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentProdItem ? 'Edit production item' : 'Add new production item'}</span>
                <span className="greyText" >These are extra materials you used for production. Eg. sacks, bottles, etc</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel defaultValue={currentProdItem?.name} onChange={onChange} name="name" required placeholder="enter name" label="Item name" className="w-full" />
                    {
                      openNew &&
                      <GenericLabel
                          label="Select suppliers"
                          input={<SearchSelectMultipleSuppliers value={savedSuppliers} setSelection={setSuppliers} />}
                      />
                    }
                    <InputWithLabel defaultValue={currentProdItem?.quantity} onChange={onChange} name="quantity" required type="number" min={1} placeholder="10" label="Enter quantity" className="w-full" />
                    <InputWithLabel defaultValue={currentProdItem?.price} onChange={onChange} name="price" required type="number" min={0} placeholder={`${currency?.symbol}25.5`} label={'Enter price ' + currency?.symbol} className="w-full" />
                </div>
    
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <TextAreaWithLabel defaultValue={currentProdItem?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    </div>
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentProdItem ? "Update" : "Submit"} className="w-full mt-4" />
                </div>
            </div>
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
        </form>
    </div>
  )
}

export default ProdItemComp