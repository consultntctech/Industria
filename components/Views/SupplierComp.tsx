import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import { Switch } from "@mui/material";
import { ISupplier } from "@/lib/models/supplier.model";
import { createSupplier, updateSupplier } from "@/lib/actions/supplier.action";
import { useAuth } from "@/hooks/useAuth";
import { enqueueSnackbar } from "notistack";
import { useFetchSuppliers } from "@/hooks/fetch/useFetchSuppliers";
import { canUser } from "@/Data/roles/permissions";

type SupplierCompProps = {
    openNew:boolean;
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentSupplier:ISupplier | null;
    setCurrentSupplier:Dispatch<SetStateAction<ISupplier | null>>;
}

const SupplierComp = ({openNew, setOpenNew, currentSupplier, setCurrentSupplier}:SupplierCompProps) => {
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [data, setData] = useState<Partial<ISupplier>>({});

    const {user} = useAuth()
    const {refetch} = useFetchSuppliers();

    const isCreator = canUser(user, '41', 'CREATE');
    const isEditor = canUser(user, '41', 'UPDATE');

    const formRef = useRef<HTMLFormElement>(null);


    useEffect(() => {
        if(currentSupplier){
            setData({...currentSupplier});// Set form data when currentUser changes
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentSupplier])

    const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentSupplier(null);
        setData({});
    }

    const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createSupplier({...data, isActive, org:user?.org, createdBy:user?._id});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating supplier', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateSupplier({...data, isActive});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating supplier', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentSupplier ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >Add new supplier</span>
                <span className="greyText" >A supplier is a company or an individual who supplies you goods</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                <InputWithLabel defaultValue={currentSupplier?.name} onChange={onChange} name="name" required placeholder="enter name" label="Company/Individual name" className="w-full" />
                <InputWithLabel defaultValue={currentSupplier?.person} onChange={onChange} name="person" required placeholder="enter name" label="Enter contact person's name" className="w-full" />
                <InputWithLabel defaultValue={currentSupplier?.email} onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
                <InputWithLabel defaultValue={currentSupplier?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
                <InputWithLabel defaultValue={currentSupplier?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
                </div>
    
                <div className="flex gap-4 flex-col w-full justify-between">
                <div className="flex flex-col gap-4 w-full">
                    <TextAreaWithLabel defaultValue={currentSupplier?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    <div className="flex items-center flex-row gap-4">
                        <span className="smallText">Supplier is Active</span>
                        <Switch onChange={(e)=>setIsActive(e.target.checked)} defaultChecked={currentSupplier?.isActive} checked={ isActive} color="primary" />
                    </div>
                </div>
                {
                  (isCreator || isEditor) &&
                  <PrimaryButton disabled={currentSupplier ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentSupplier ? "Update" : "Submit"} className="w-full mt-4" />
                }
                </div>
            </div>
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
        </form>
    </div>
  )
}

export default SupplierComp