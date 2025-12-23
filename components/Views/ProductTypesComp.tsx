import { Activity, ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectProdCats from "../shared/inputs/dropdowns/SearchSelectProdCats";
import SearchSelectMultipleSuppliers from "../shared/inputs/dropdowns/SearchSelectMultipleSuppliers";
import { IProduct } from "@/lib/models/product.model";
import { createProduct, updateProduct } from "@/lib/actions/product.action";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import { useFetchProducts } from "@/hooks/fetch/useFetchProducts";
import { ISupplier } from "@/lib/models/supplier.model";
import { ICategory } from "@/lib/models/category.model";
// import { ISupplier } from "@/lib/models/supplier.model";

type ProductTypesCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentProduct: IProduct | null;
  setCurrentProduct: Dispatch<SetStateAction<IProduct | null>>;
}

const ProductTypesComp = ({openNew, setOpenNew, currentProduct, setCurrentProduct}:ProductTypesCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IProduct>>({type:'Raw Material'});
    const [category, setCategory] = useState<string>('');
    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [showSuppliers, setShowSuppliers] = useState(true);
    const {user} = useAuth();

    const {refetch} = useFetchProducts();

    const savedSuppliers = currentProduct?.suppliers as ISupplier[];
    const savedCategory = currentProduct?.category as ICategory;

    useEffect(()=>{
        if(data?.type === 'Finished Good'){
            setShowSuppliers(false);
        }else{
            setShowSuppliers(true);
        }
    }, [data?.type])

    useEffect(() => {
        if(currentProduct){
            setData({...currentProduct});// Set form data when currentUser changes
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentProduct])

    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
      }

      const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProduct(null);
        setData({type:'Raw Material'});
      }

      const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }));
      };


     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const formData = {...data, org:user?.org, category, suppliers, createdBy:user?._id}
          const res = await createProduct(formData);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating product', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const supplierIds = savedSuppliers.map(supplier=>supplier._id);
          const res = await updateProduct({
            ...data, 
            suppliers: suppliers.length ? suppliers : supplierIds,
            category: category || savedCategory._id,
          });
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose()
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating product', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    // console.log('Is visible: ', openNew && data?.type === 'Raw Material')

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentProduct ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentProduct ? 'Edit product' : 'Add new product'}</span>
          <span className="greyText" >These are the ones you buy for production or sell to customers</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel defaultValue={data?.name} onChange={onChange} name="name" required placeholder="eg. Cassava" label="Name" className="w-full" />
            {
              openNew &&
              <GenericLabel
                label="Select category"
                input={<SearchSelectProdCats value={savedCategory} setSelect={setCategory} required={true} />}
              />
            }
            {
              openNew &&
              <GenericLabel 
                label='Select product type'
                input={
                  <select defaultValue={currentProduct?.type} onChange={onSelectChange} name="type" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                    <option  value="Raw Material">Raw Material</option>
                    <option value="Finished Good">Finished Good</option>
                </select>
                }
              />
            }
            {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
            <InputWithLabel onChange={onChange} defaultValue={data?.threshold} name="threshold" required type="number" min={0} placeholder="enter threshold" label="Threshold" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            <div className="flex flex-col gap-4 w-full">
              <InputWithLabel defaultValue={data?.uom} onChange={onChange} name="uom"  placeholder="eg. kg, set, dozen, pair" label="Unit of measure" className="w-full" />
              <Activity mode={(showSuppliers) ? 'visible' : 'hidden'} >
                {
                  openNew &&
                  <GenericLabel
                    label="Select suppliers"
                    input={<SearchSelectMultipleSuppliers value={savedSuppliers} setSelection={setSuppliers} />}
                  />
                }
              </Activity>
              <TextAreaWithLabel defaultValue={data?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
            </div>
            <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentProduct ? "Update" : "Submit"} className="w-full mt-4" />
          </div>
        </div>

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
          <FaChevronUp />
        </div>
      </form>
    </div>
  )
}

export default ProductTypesComp