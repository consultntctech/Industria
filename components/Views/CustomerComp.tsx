import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import { Switch } from "@mui/material";
import { ICustomer } from "@/lib/models/customer.model";
import { createCustomer, updateCustomer } from "@/lib/actions/customer.action";
import { useAuth } from "@/hooks/useAuth";
import { enqueueSnackbar } from "notistack";
import { useFetchCustomers } from "@/hooks/fetch/useFetchCustomers";

type CustomerCompProps = {
    openNew:boolean;
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentCustomer:ICustomer | null;
    setCurrentCustomer:Dispatch<SetStateAction<ICustomer | null>>;
}

const CustomerComp = ({openNew, setOpenNew, currentCustomer, setCurrentCustomer}:CustomerCompProps) => {
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [data, setData] = useState<Partial<ICustomer>>({});

    const {user} = useAuth()
    const {refetch} = useFetchCustomers();

    const formRef = useRef<HTMLFormElement>(null);


    useEffect(() => {
        if(currentCustomer){
            setData({...currentCustomer});// Set form data when currentUser changes
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentCustomer])

    const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentCustomer(null);
        setData({});
    }

    const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createCustomer({...data, isActive, org:user?.org, createdBy:user?._id});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating customer', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateCustomer({...data, isActive});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating customer', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentCustomer ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >Add new Customer</span>
                <span className="greyText" >A Customer is a company or an individual you supply goods to</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                <InputWithLabel defaultValue={currentCustomer?.name} onChange={onChange} name="name" required placeholder="enter name" label="Company/Individual name" className="w-full" />
                <InputWithLabel defaultValue={currentCustomer?.person} onChange={onChange} name="person" required placeholder="enter name" label="Enter contact person's name" className="w-full" />
                <InputWithLabel defaultValue={currentCustomer?.email} onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
                <InputWithLabel defaultValue={currentCustomer?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
                <InputWithLabel defaultValue={currentCustomer?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
                </div>
    
                <div className="flex gap-4 flex-col w-full justify-between">
                <div className="flex flex-col gap-4 w-full">
                    <TextAreaWithLabel defaultValue={currentCustomer?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    <div className="flex items-center flex-row gap-4">
                        <span className="smallText">Customer is Active</span>
                        <Switch onChange={(e)=>setIsActive(e.target.checked)} defaultChecked={currentCustomer?.isActive} checked={ isActive} color="primary" />
                    </div>
                </div>
                <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentCustomer ? "Update" : "Submit"} className="w-full mt-4" />
                </div>
            </div>
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
        </form>
    </div>
  )
}

export default CustomerComp