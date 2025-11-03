import { Dispatch, SetStateAction, useRef, useState } from "react";
import ModalContainer from "../shared/outputs/ModalContainer";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import { IoIosClose } from "react-icons/io";
import { ICategory } from "@/lib/models/category.model";
import { createCategory } from "@/lib/actions/category.action";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";

type ProdCatCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}

const ProdCatComp = ({openNew, setOpenNew}:ProdCatCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<ICategory>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createCategory({...data,  org:user?.org, createdBy:user?._id});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating category', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
    <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
        <div className="flex w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Add new category</span>
                    <span className="greyText" >Categories are used to group products</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel onChange={onChange} name="name" required placeholder="eg. flavour, oil" label="Category name" className="w-full" />
                    <TextAreaWithLabel name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
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

export default ProdCatComp