import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import SearchSelectAvMultipleLineItems from "@/components/shared/inputs/dropdowns/SearchSelectAvMultipleLineItems";
import SearchSelectBatches from "@/components/shared/inputs/dropdowns/SearchSelectBatches";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import TextAreaWithLabel from "@/components/shared/inputs/TextAreaWithLabel";
import ModalContainer from "@/components/shared/outputs/ModalContainer";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useFetchAvailableLineItemsByProduct } from "@/hooks/fetch/useFetchLineItems";
import { useAuth } from "@/hooks/useAuth";
import { updateOrder } from "@/lib/actions/order.action";
import { createSales } from "@/lib/actions/sales.action";
import { ICustomer } from "@/lib/models/customer.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrder } from "@/lib/models/order.model";
import { IProduct } from "@/lib/models/product.model";
import { ISales } from "@/lib/models/sales.model";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch,  SetStateAction, useEffect, useRef, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import '@/styles/customscroll.css'

type OrdersFulfillCompModalProps = {
    currentOrder: IOrder | null;
    setCurrentOrder:Dispatch<SetStateAction<IOrder | null>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IOrder[], Error>>
}

const OrdersFulfillCompModal = ({currentOrder, refetch, setCurrentOrder, open, setOpen}:OrdersFulfillCompModalProps) => {
    const [loading, setLoading] = useState(false);
    const [batch, setBatch] = useState<string>('');
    const [lineItems, setLineItems] = useState<ILineItem[]>([]);
    const [isSelectedAll, setIsSelectedAll] = useState(false);
    const [isExtraCharges, setIsExtraCharges] = useState(false);
    const [data, setData] = useState<Partial<ISales>>({price:currentOrder?.price});
    
    
    const product = currentOrder?.product as IProduct;


    const {lineItems:items, isPending} = useFetchAvailableLineItemsByProduct(product?._id, batch, currentOrder?.quantity);
    const {currency} = useCurrencyConfig();
    const utils = useQueryClient();
    const {user} = useAuth();
    const customer = currentOrder?.customer as ICustomer;

    const formRef = useRef<HTMLFormElement>(null);

    
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
    
    
    const handleClose = ()=>{
        setOpen(false);
        setCurrentOrder(null);
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
            // enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                const orderData:Partial<IOrder> = {
                    _id: currentOrder?._id,
                    status: 'Fulfilled',
                    fulfilledAt: new Date().toISOString(),
                }
                const orderRes = await updateOrder(orderData);
                if(!orderRes.error){
                    enqueueSnackbar('Order fulfilled', {variant:'success'});
                    formRef.current?.reset();
                    refetch();
                    utils.invalidateQueries({ queryKey: ['orders'] });
                    handleClose();
                }else{
                    enqueueSnackbar(orderRes.message, {variant:'error'});
                }
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating storage', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const price = lineItems.reduce((acc, { price }) => acc + price, 0) || (currentOrder?.price||0);

    const totalPrice = price + (Number(data.charges || 0)  - Number(data.discount || 0) );

    
  return (
    <ModalContainer open={open} handleClose={()=>setOpen(false)}>
        <div className="flex flex-center h-[100vh] w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom h-[90%] p-4 flex-col gap-8 w-full relative" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Fulfill this order</span>
                    <span className="greyText" >This will create a sale record for the order</span>
                </div>       
                            <div className="flex flex-col  gap-4 items-stretch">
                                <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-4 flex-col w-full md:flex-row ">
                    <GenericLabel label="Batch (optional)"
                        input={<SearchSelectBatches type="Finished Good" setSelect={setBatch} />}
                    />
                </div>
                <div className="flex gap-4 flex-col w-full md:flex-row ">
                    <div className="flex flex-row gap-2 items-center w-full">
                        <GenericLabel label="Pick products"
                            input={<SearchSelectAvMultipleLineItems selection={lineItems} items={items} isPending={isPending} productId={product?._id as string}  setSelection={setLineItems} />}
                        />
                    {
                        items?.length > 0 &&
                        <CustomCheckV2 uncheckedTip="Select all products in the list" checkedTip="Unselect all products" checked={isSelectedAll && lineItems.length>0} setChecked={setIsSelectedAll} />
                    }
                        
                    </div>
                </div>
                <span>{lineItems?.length} / {items?.length} products selected</span>
                <GenericLabel label="Add charges and allowances"
                    input={<CustomCheckV2 uncheckedTip="Add extra charges and allowances" checkedTip="Remove extra charges and allowances" checked={isExtraCharges} setChecked={setIsExtraCharges} />}
                />
                {
                    isExtraCharges &&
                    <div className="flex gap-4 flex-col w-full md:flex-row ">
                        <InputWithLabel  min={0} step={0.001} label={currency ? `Discount amount ${currency?.symbol}`:`Discount amount`} type="number" onChange={onChange} name="discount" />
                        <InputWithLabel min={0} step={0.001} label={currency ? `Charges ${currency?.symbol}`:`Charges`} type="number" onChange={onChange} name="charges" />
                    </div>
                }
                {
                    lineItems?.length > 0 &&
                    <span className="font-semibold">Total price: {totalPrice} {currency?.symbol || ''}</span>
                }
            </div>

            <div className="flex gap-4 flex-col w-full justify-between">
                <div className="flex flex-col gap-4 w-full">
                    <TextAreaWithLabel name="narration" onChange={onChange} placeholder="enter narration" label="Narration" className="w-full" />
                </div>
                <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Proceed"} className="w-full mt-4" />
            </div>
        </div>

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
            <FaChevronUp />
        </div>
    </form>
        </div>
    </ModalContainer>
  )
}

export default OrdersFulfillCompModal