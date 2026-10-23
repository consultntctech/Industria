import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectMultipleSuppliers from "../shared/inputs/dropdowns/SearchSelectMultipleSuppliers";
import { enqueueSnackbar } from "notistack";
import { ISupplier } from "@/lib/models/supplier.model";
import { PACKAGING_CATEGORY, PACKAGING_SUBCATEGORY, TPackagingProcess } from "@/Data/PackagingProcesses";
import SearchSelectPackagingType from "../shared/inputs/dropdowns/SearchSelectPackagingType";
import CustomCheckV2 from "../misc/CustomCheckV2";
import {useCanUser } from "@/hooks/useAuth";
import { IProdType } from "@/lib/models/prodtype.model";
import { createProdType, updateProdType } from "@/lib/actions/prodtype.action";
import CloseButton from "../misc/CloseButton";
import { useFetchProdTypes } from "@/hooks/fetch/useFetchProdTypes";
;

type ProdTypeCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentProdType:IProdType | null;
  setCurrentProdType:Dispatch<SetStateAction<IProdType | null>>;
}

const ProdTypeComp = ({openNew, setOpenNew, currentProdType, setCurrentProdType}:ProdTypeCompProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [data, setData] = useState<Partial<IProdType>>({});
    const [category, setCategory] = useState<TPackagingProcess | null>(null);
    const [subcategory, setSubcategory] = useState<TPackagingProcess | null>(null);
    const [reusable, setReusable] = useState<boolean>(false);

    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {refetch} = useFetchProdTypes();

    const isCreator = useCanUser('17', 'CREATE');
    const isEditor = useCanUser('17', 'UPDATE');

    const savedSuppliers = currentProdType?.suppliers as unknown as ISupplier[];


    // const originalCost = (data?.quantity || 0) * (data?.unitPrice || 0);


    useEffect(() => {
        if(currentProdType){
            setData({...currentProdType});
            setSuppliers(savedSuppliers.map(supplier=>supplier._id));
            setReusable(currentProdType?.reusable);
            setCategory({label:currentProdType?.category});
            setSubcategory({label:currentProdType?.subcategory ?? ''});
        }else{
            setData({});
            setSuppliers([]);
            setCategory({label:''});
            setSubcategory({label:''});
        }
    }, [currentProdType])

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProdType(null);
        setSuppliers([]);
        setCategory({label:''});
        setSubcategory({label:''});
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
          const prod: Partial<IProdType> = {
            ...data,
            name: data?.name?.trim(),
            code: data?.code?.trim(),
            org:user?.org, suppliers, createdBy:user?._id, creator: user?.name,
            reusable,
            stock: 0, available: 0,
            used: 0, category: category?.label, subcategory: subcategory?.label,
          }
          const res = await createProdType(prod);
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
          const prod: Partial<IProdType> = {
            ...data, 
            suppliers,
            name: data?.name?.trim(),
            code: data?.code?.trim(),
            reusable,
            category: category?.label, subcategory: subcategory?.label,
          }
          const res = await updateProdType(prod);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch()
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating packaging material type', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    // console.log('Reusable: ', reusable)

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentProdType ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentProdType ? 'Edit packaging material type' : 'Add new packaging material type'}</span>
                <span className="greyText" >These are type of materials you use for packaging. Eg. sacks, bottles, etc</span>
            </div>

            {
                openNew &&
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentProdType?.name} onChange={onChange} name="name" required placeholder="enter name" label="Item name" className="w-full" />
                        <InputWithLabel defaultValue={currentProdType?.code} onChange={onChange} name="code" required placeholder="enter code" label="Item code" className="w-full" />
                        <GenericLabel
                            label="Select category"
                            input={<SearchSelectPackagingType require={!currentProdType?.category} dfValue={category} list={PACKAGING_CATEGORY} caption="Packaging category" value={category} setValue={setCategory} />}
                        />
                        <GenericLabel
                            label="Select subcategory"
                            input={<SearchSelectPackagingType dfValue={subcategory} list={PACKAGING_SUBCATEGORY} caption="Packaging subcategory" value={subcategory} setValue={setSubcategory} />}
                        />
                        
                        <GenericLabel
                            label="Select suppliers"
                            input={<SearchSelectMultipleSuppliers value={savedSuppliers} setSelection={setSuppliers} />}
                        />
                        
                        <InputWithLabel defaultValue={currentProdType?.threshold} onChange={onChange} name="threshold" type="number" min={0} placeholder="0" label="Reorder level" className="w-full" />
                       
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                          <InputWithLabel defaultValue={currentProdType?.uom} onChange={onChange} name="uom" placeholder='eg. liters' label='Unit of measure' className="w-full" />
                          <div className="flex flex-row items-center gap-4">
                              <span className="smallText">This item is reusable</span>
                              <CustomCheckV2 checked={reusable} setChecked={setReusable} />
                          </div>
                          
                          <TextAreaWithLabel defaultValue={currentProdType?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        {
                          (isCreator || isEditor) &&
                          <PrimaryButton disabled={currentProdType ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentProdType ? "Update" : "Submit"} className="w-full mt-4" />
                        }
                    </div>
                </div>
            }
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
            <CloseButton onClick={handleClose} />
        </form>
    </div>
  )
}

export default ProdTypeComp