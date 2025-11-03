import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import { IStorage } from "@/lib/models/storage.model";
import { createStorage } from "@/lib/actions/storage.action";
import { enqueueSnackbar } from "notistack";

type StorageCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}

const StorageComp = ({openNew, setOpenNew}:StorageCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IStorage>>({});
    const {user} = useAuth();

    const formRef = useRef<HTMLFormElement>(null);

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }
    
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formData:Partial<IStorage> = {
                ...data,
                org:user?.org,
                createdBy:user?._id
            }
            const res = await createStorage(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                setOpenNew(false);
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating storage', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >Add new storage location</span>
                <span className="greyText" >These are where your finished goods are stored</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel onChange={onChange} name="name" required placeholder="eg. Warehouse A" label="Storage name" className="w-full" />
                    <InputWithLabel onChange={onChange} name="location"  min={1} placeholder="eg. Main Site" label="Enter location" className="w-full" />
                </div>
    
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <TextAreaWithLabel name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    </div>
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                </div>
            </div>
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                <FaChevronUp />
            </div>
        </form>
    </div>
  )
}

export default StorageComp