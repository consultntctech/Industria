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
import { PACKAGING_CATEGORY, PACKAGING_SUBCATEGORY, TPackagingProcess } from "@/Data/PackagingProcesses";
import SearchSelectPackagingType from "../shared/inputs/dropdowns/SearchSelectPackagingType";
import CustomCheckV2 from "../misc/CustomCheckV2";

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
    const [category, setCategory] = useState<TPackagingProcess | null>(null);
    const [subcategory, setSubcategory] = useState<TPackagingProcess | null>(null);
    const [reusable, setReusable] = useState<boolean>(false);
    const [price, setPrice] = useState<number>(0);
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();
    const {refetch} = useFetchProditem();

    const savedSuppliers = currentProdItem?.suppliers as unknown as ISupplier[];


    useEffect(() => {
        if(currentProdItem){
            setData({...currentProdItem});
            setSuppliers(savedSuppliers.map(supplier=>supplier._id));
            setReusable(currentProdItem?.reusable);
            setCategory({label:currentProdItem?.category});
            setSubcategory({label:currentProdItem?.subcategory});
            setPrice(currentProdItem?.price);
        }else{
            setData({});
            setSuppliers([]);
        }
    }, [currentProdItem])

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProdItem(null);
    }

    useEffect(() => {
      if(data.quantity && data.unitPrice && !currentProdItem){
        setPrice(data.quantity * data.unitPrice);
      }
    }, [data.quantity, data.unitPrice, currentProdItem])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const prod: Partial<IProdItem> = {
            ...data, 
            org:user?.org, suppliers, createdBy:user?._id,
            stock: data.quantity, reusable,
            used: 0, category: category?.label, subcategory: subcategory?.label,
            price
          }
          const res = await createProdItem(prod);
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
          const prod: Partial<IProdItem> = {
            ...data, 
            suppliers,
            stock: data.quantity, reusable,
            category: category?.label, subcategory: subcategory?.label,
            price
          }
          const res = await updateProdItem(prod);
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

    // console.log('Reusable: ', reusable)

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentProdItem ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentProdItem ? 'Edit production item' : 'Add new production item'}</span>
                <span className="greyText" >These are extra materials you used for production. Eg. sacks, bottles, etc</span>
            </div>

            {
                openNew &&
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentProdItem?.name} onChange={onChange} name="name" required placeholder="enter name" label="Item name" className="w-full" />
                        <GenericLabel
                            label="Select category"
                            input={<SearchSelectPackagingType dfValue={category} list={PACKAGING_CATEGORY} caption="Packaging category" value={category} setValue={setCategory} />}
                        />
                        <GenericLabel
                            label="Select subcategory"
                            input={<SearchSelectPackagingType dfValue={subcategory} list={PACKAGING_SUBCATEGORY} caption="Packaging subcategory" value={subcategory} setValue={setSubcategory} />}
                        />
                        
                        <GenericLabel
                            label="Select suppliers"
                            input={<SearchSelectMultipleSuppliers value={savedSuppliers} setSelection={setSuppliers} />}
                        />
                        <GenericLabel 
                            label='Select quality status'
                            input={
                                <select defaultValue={currentProdItem?.qStatus}  onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                                <option  value="Pass">Pass</option>
                                <option value="Partial">Partial</option>
                                <option value="Fail">Fail</option>
                            </select>
                            }
                        />
                        <InputWithLabel defaultValue={currentProdItem?.threshold} onChange={onChange} name="threshold" required type="number" min={0} placeholder="0" label="Reorder threshold" className="w-full" />
                        <InputWithLabel defaultValue={currentProdItem?.quantity} onChange={onChange} name="quantity" required type="number" min={1} placeholder="10" label="Enter quantity" className="w-full" />
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                          <InputWithLabel defaultValue={currentProdItem?.unitPrice} onChange={onChange} name="unitPrice" required type="number" min={0} placeholder={`${currency?.symbol}25.5`} label={'Enter unit price ' + (currency?.symbol || '')} className="w-full" />
                          <InputWithLabel value={price} onChange={(e)=>setPrice(Number(e.target.value))} name="price" required type="number" min={0} placeholder={`${currency?.symbol}25.5`} label={'Enter total price ' + (currency?.symbol || '')} className="w-full" />
                          <InputWithLabel defaultValue={currentProdItem?.uom} onChange={onChange} name="uom" placeholder='eg. liters' label='Unit of measure' className="w-full" />
                          <div className="flex flex-row items-center gap-4">
                              <span className="smallText">This item is reusable</span>
                              <CustomCheckV2 checked={reusable} setChecked={setReusable} />
                          </div>
                          
                          <TextAreaWithLabel defaultValue={currentProdItem?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentProdItem ? "Update" : "Submit"} className="w-full mt-4" />
                    </div>
                </div>
            }
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
        </form>
    </div>
  )
}

export default ProdItemComp