import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ModalContainer from "../shared/outputs/ModalContainer";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import { IECategory } from "@/lib/models/ecategory.model";
import { createECategory, updateECategory } from "@/lib/actions/ecategory.action";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import {useCanUser } from "@/hooks/useAuth";import CloseButton from "../misc/CloseButton";
import { useFetchECategories } from "@/hooks/fetch/useFetchECategories";
;

type EquipCatCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentCategory:IECategory | null;
  setCurrentCategory:Dispatch<SetStateAction<IECategory | null>>;
}

const EquipCatComp = ({openNew, setOpenNew, currentCategory, setCurrentCategory}:EquipCatCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IECategory>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {refetch} = useFetchECategories();
    const isCreator = useCanUser('93', 'CREATE');
    const isEditor = useCanUser('93', 'UPDATE');


    useEffect(() => {
        if(currentCategory){
            setData({...currentCategory});// Set form data when currentUser changes
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentCategory])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentCategory(null);
        setData({});
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createECategory({...data, creator:user?.name, org:user?.org, createdBy:user?._id});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating category', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateECategory({...data});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              refetch();
              handleClose();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating category', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


  return (
    <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
        <div className="flex w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={currentCategory ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentCategory ? 'Edit category' : 'Add new category'}</span>
                    <span className="greyText" >Categories are used to group equipment</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel defaultValue={currentCategory?.name} onChange={onChange} name="name" required placeholder="eg. utilities, safety, IT" label="Category name" className="w-full" />
                    <TextAreaWithLabel defaultValue={currentCategory?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    {
                      (isCreator || isEditor) &&
                      <PrimaryButton disabled={currentCategory ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentCategory ? "Update" : "Submit"} className="w-full mt-4" />
                    }
                    </div>

                </div>
        
                
                <CloseButton className="absolute top-1 right-1" onClick={handleClose} />
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        </div>
    </ModalContainer>
  )
}

export default EquipCatComp