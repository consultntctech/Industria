import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import {useCanUser } from "@/hooks/useAuth";
import { IEType } from "@/lib/models/etype.model";
import { IECategory } from "@/lib/models/ecategory.model";
import { createEType, updateEType } from "@/lib/actions/etype.action";
import SearchSelectEquipCats from "../shared/inputs/dropdowns/SearchSelectEquipCats";
import CloseButton from "../misc/CloseButton";
import { useFetchETypes } from "@/hooks/fetch/useFetchETypes";
;
// import { ISupplier } from "@/lib/models/supplier.model";

type EqupmentTypesCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentEType: IEType | null;
  setCurrentEType: Dispatch<SetStateAction<IEType | null>>;
}

const EqupmentTypesComp = ({openNew, setOpenNew, currentEType, setCurrentEType}:EqupmentTypesCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IEType>>({});
    const [category, setCategory] = useState<IECategory | null>(null);
    const {user} = useAuth();

    const {refetch} = useFetchETypes();

    const isCreator = useCanUser('92', 'CREATE');
    const isEditor = useCanUser('92', 'UPDATE');

    const savedCategory = currentEType?.category as IECategory;



    useEffect(() => {
        if(currentEType){
            setData({...currentEType});
            setCategory(savedCategory);
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentEType])

    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
      }

      const handleClose = ()=>{
        setOpenNew(false);
        setCurrentEType(null);
        formRef.current?.reset();
        setData({});
      }

      


     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const formData:Partial<IEType> = {
            ...data, creator:user?.name,
            org:user?.org, category:category?._id, createdBy:user?._id
          }
          const res = await createEType(formData);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating equipment type', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await updateEType({
            ...data,
            category: category?._id,
          });
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose()
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating equipment type', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    // console.log('Is visible: ', openNew && data?.type === 'Raw Material')

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentEType ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentEType ? 'Edit equipment type' : 'Add new equipment type'}</span>
          <span className="greyText" >These are sub categories of equipment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel defaultValue={data?.name} onChange={onChange} name="name" required placeholder="eg. Laptops" label="Name" className="w-full" />
            {
              openNew &&
              <GenericLabel
                label="Select category"
                input={<SearchSelectEquipCats value={savedCategory} setSelect={setCategory} required={true} />}
              />
            }
            
            {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
          
              <TextAreaWithLabel defaultValue={data?.description} name="description" onChange={onChange} placeholder="enter description" label="Note" className="w-full" />
            {
              (isCreator || isEditor) &&
              <PrimaryButton disabled={currentEType ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentEType ? "Update" : "Submit"} className="w-full mt-4" />
            }
          </div>
        </div>

        <CloseButton onClick={handleClose} />
      </form>
    </div>
  )
}

export default EqupmentTypesComp