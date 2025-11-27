import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";

import { enqueueSnackbar } from "notistack";
import { IProduct } from "@/lib/models/product.model";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import SearchSelectBatches from "../shared/inputs/dropdowns/SearchSelectBatches";
import { ILineItem } from "@/lib/models/lineitem.model";
import SearchSelectAvMultipleLineItems from "../shared/inputs/dropdowns/SearchSelectAvMultipleLineItems";
import CustomCheckV2 from "../misc/CustomCheckV2";
import { ICustomer } from "@/lib/models/customer.model";
import SearchSelectCustomers from "../shared/inputs/dropdowns/SearchSelectCustomers";
import { useFetchAvailableLineItemsByProduct } from "@/hooks/fetch/useFetchLineItems";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ISales } from "@/lib/models/sales.model";
import { createSales, updateSales } from "@/lib/actions/sales.action";
import { useRouter } from "next/navigation";
import { useFetchSales } from "@/hooks/fetch/useFetchSales";
// import { useFetchSaless } from "@/hooks/fetch/useFetchSaless";

type SalesCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentSales:ISales | null;
  setCurrentSales:Dispatch<SetStateAction<ISales | null>>;
}

const SalesComp = ({openNew, setOpenNew, currentSales, setCurrentSales}:SalesCompProps) => {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<IProduct | null>(null);
    const [lineItems, setLineItems] = useState<ILineItem[]>([]);
    const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [data, setData] = useState<Partial<ISales>>({});
    const [batch, setBatch] = useState<string>('');
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();

    const {lineItems:items, isPending} = useFetchAvailableLineItemsByProduct(product?._id as string, batch);

    // console.log('Items: ', items.length)
    const formRef = useRef<HTMLFormElement>(null);
    const {refetch} = useFetchSales();
    const router = useRouter();
    const savedItems = currentSales?.products as ILineItem[];
    const savedCustomer = currentSales?.customer as ICustomer;

    useEffect(()=>{
         if(isSelectedAll){
            setLineItems(prev =>
                [
                    ...prev,
                    ...items.filter(item => 
                    !prev.some(line => line._id === item._id)
                    )
                ]
            );

        }else{
            setLineItems([]);
        }
    }, [isSelectedAll])

    useEffect(()=>{
        if(currentSales){
            setData({...currentSales});
            setLineItems(savedItems);
            setCustomer(savedCustomer);
        }
        return ()=>{
            setData({});
        }
    }, [currentSales])

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentSales(null);
        setData({});
        router.refresh();
    }

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }
    
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formData:Partial<ISales> = {
                ...data,
                customer: customer?._id,
                products: lineItems.map(item => item._id),
                quantity: lineItems?.length,
                price: totalPrice,
                org:user?.org,
                createdBy:user?._id
            }
            const res = await createSales(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating storage', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formData:Partial<ISales> = {
                ...data,
                customer: customer?._id,
                products: lineItems.map(item => item._id),
                quantity: lineItems?.length,
                price: totalPrice,
            }
            const res = await updateSales(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating storage location', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

   const price = lineItems.reduce((acc, { price }) => acc + price, 0);

    const totalPrice = price + (Number(data.charges || 0)  - Number(data.discount || 0) );

    // console.log('Data: ', data)

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={ currentSales ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                
                <div className="flex flex-col  gap-4 items-stretch">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <GenericLabel label="Product"
                                input={<SearchSelectProducts required type="Finished Good" setSelect={setProduct} />}
                            />
                            <GenericLabel label="Batch (optional)"
                                input={<SearchSelectBatches type="Finished Good" setSelect={setBatch} />}
                            />
                        </div>
                        <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <InputWithLabel onChange={onChange} name="quantity"  min={1} placeholder="eg. 10" label="Quantity" className="w-full" />
                            <div className="flex flex-row gap-2 items-center w-full">
                                <GenericLabel label="Pick products"
                                    input={<SearchSelectAvMultipleLineItems selection={lineItems} items={items} required isPending={isPending} productId={product?._id as string}  setSelection={setLineItems} />}
                                />
                            {
                                items?.length > 0 &&
                                <CustomCheckV2 uncheckedTip="Select all products in the list" checkedTip="Unselect all products" checked={isSelectedAll && lineItems.length>0} setChecked={setIsSelectedAll} />
                            }
                                
                            </div>
                        </div>
                        <span>{lineItems?.length} / {items?.length} products selected</span>

                        <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <InputWithLabel min={0} label={currency ? `Discount amount ${currency?.symbol}`:`Discount amount`} type="number" onChange={onChange} name="discount" />
                            <InputWithLabel min={0} label={currency ? `Charges ${currency?.symbol}`:`Charges`} type="number" onChange={onChange} name="charges" />
                        </div>
                        {
                            lineItems?.length > 0 &&
                            <span className="font-semibold">Total price: {totalPrice} {currency?.symbol || ''}</span>
                        }
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <SearchSelectCustomers required setSelect={setCustomer} />
                            <TextAreaWithLabel name="narration" onChange={onChange} placeholder="enter narration" label="Narration" className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentSales ? 'Update': "Proceed"} className="w-full mt-4" />
                    </div>
                </div>
        
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        }
    </div>
  )
}

export default SalesComp