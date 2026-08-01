import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import InputWithLabel from "@/components/shared/inputs/InputWithLabel";
import TextAreaWithLabel from "@/components/shared/inputs/TextAreaWithLabel";
import ModalContainer from "@/components/shared/outputs/ModalContainer";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useAuth } from "@/hooks/useAuth";
import { updateOrder } from "@/lib/actions/order.action";
import { createSales } from "@/lib/actions/sales.action";
import { ICustomer } from "@/lib/models/customer.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrder } from "@/lib/models/order.model";
import { ISales } from "@/lib/models/sales.model";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, Dispatch,  SetStateAction,  useEffect,  useRef, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import '@/styles/customscroll.css'
import {useCanUser } from "@/hooks/useAuth";import OrderLineItemsTable from "./OrderLineItemsTable";
import { IProduct } from "@/lib/models/product.model";
import { INeed, IOriginalPrice, OrderSelectType } from "@/types/Types";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import SearchSelectCurrencies from "@/components/shared/inputs/dropdowns/SearchSelectCurrencies";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
;

type OrdersFulfillCompModalProps = {
    currentOrder: IOrder | null;
    setCurrentOrder:Dispatch<SetStateAction<IOrder | null>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IOrder[], Error>>
}

const OrdersFulfillCompModal = ({currentOrder, refetch, setCurrentOrder, open, setOpen}:OrdersFulfillCompModalProps) => {
    const [loading, setLoading] = useState(false);
    // const [batch, setBatch] = useState<string>('');
    const [lineItems, setLineItems] = useState<ILineItem[]>([]);
    const [isExtraCharges, setIsExtraCharges] = useState(false);
    const [useRate, setUseRate] = useState(false);
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);
    const [data, setData] = useState<Partial<ISales>>({price:currentOrder?.price});
    const [constData, setCostData] = useState<{charges:number, discount:number}>({charges:0, discount:0});
    const original = currentOrder?.original as IOriginalPrice;
    const savedCurrency = original?.currency as IOtherCurrency;
    const items = currentOrder?.products as OrderSelectType[];

    const price = lineItems.reduce((acc, { price }) => acc + price, 0) || (currentOrder?.price||0);

    const {currency} = useCurrencyConfig();
    const utils = useQueryClient();
    const {user} = useAuth();
    const isEditor = useCanUser('86', 'UPDATE');
    const customer = currentOrder?.customer as ICustomer;

    const formRef = useRef<HTMLFormElement>(null);
    // const totalPrice = price + (Number(data.charges || 0)  - Number(data.discount || 0) );

    const showRate = exposeRate(savedCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);
    const charge = Number(constData.charges || 0) * (rate || 1);
    const discount = Number(constData.discount || 0) * (rate || 1);
    const netCharges = charge - discount;

    const totalPrice = price + netCharges;
    const totalChages = Number(constData.charges || 0) - Number(constData.discount || 0);

    const chargeLabel = `Charges (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const discountLabel = `Discount (${currency?.symbol || currency?.name || 'Primary currency'})`;

    const chargeOtherLabel = `Charges (${otherCurrency?.symbol || otherCurrency?.name})`;
    const discountOtherLabel = `Discount (${otherCurrency?.symbol || otherCurrency?.name})`;
    
    const needed:INeed[] = items?.map(item =>{
        const product = item.product as IProduct;
        return ({
            product:product?.name,
            quantity:item.quantity,
            selected: lineItems.filter(line => {
                const lineProduct = line.product as IProduct;
                return lineProduct?._id === product?._id;
            }).length
        })}
    );
    // const product = currentOrder?.product as IProduct;

    // console.log('Selected: ', lineItems?.length)



    
    
    const handleClose = ()=>{
        setOpen(false);
        setCurrentOrder(null);
        setCostData({charges:0, discount:0});
    }
    const handlecostChange = (e:ChangeEvent<HTMLInputElement>)=>{
        setCostData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }
    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    useEffect(()=>{
        if(currentOrder){
            setOtherCurrency(savedCurrency);
        }
    },[currentOrder]);

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const wrongSelection = needed.some((item)=>item.quantity !== item.selected);
        if(wrongSelection){
            enqueueSnackbar('Please select the required units for the products', {variant:'error'});
            setLoading(false);
            return;
        }
        
        try {
            const formData:Partial<ISales> = {
                ...data,
                customer: customer?._id,
                products: lineItems.map(item => item._id),
                quantity: lineItems?.length,
                price: totalPrice,
                org:user?.org,
                createdBy:user?._id,
                charges: constData.charges,
                discount: constData.discount,
                original:{
                    amount: totalChages,
                    rate: rate,
                    currency: otherCurrency?._id as string,
                }
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

    

    
  return (
    <ModalContainer open={open} handleClose={()=>setOpen(false)}>
        <div className="flex flex-center h-[100vh] w-[90%] md:w-[50%]">
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom h-[90%] p-4 flex-col gap-8 w-full relative" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Fulfill this order</span>
                    <span className="greyText" >This will create a sale record for the order, and can't be undone</span>
                </div>       
                <div className="flex flex-col  gap-4 items-stretch">
                    <div className="flex flex-col gap-4 w-full">
                
               

                        <OrderLineItemsTable currentOrder={currentOrder} needed={needed} setLines={setLineItems} />
                        {/* <span>{lineItems?.length} / {items?.length} products selected</span> */}
                        <GenericLabel className='flex-row-reverse items-center w-fit' label="Add charges and allowances"
                            input={<CustomCheckV2 uncheckedTip="Add extra charges and allowances" checkedTip="Remove extra charges and allowances" checked={isExtraCharges} setChecked={setIsExtraCharges} />}
                        />
                        {
                            isExtraCharges &&
                            <>
                                <div className="flex gap-4 flex-col w-full md:flex-row items-center">
                                    <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!isExtraCharges} setSelect={setOtherCurrency} value={savedCurrency} />} />
                                    {
                                        showRate &&
                                        <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                                    }
                                </div>
                                <div className="flex gap-4 flex-col w-full md:flex-row ">
                                    <InputWithLabel  min={0} step={0.0001} label={otherCurrency ? discountOtherLabel : discountLabel} type="number" onChange={handlecostChange} name="discount" />
                                    <InputWithLabel min={0} step={0.0001} label={otherCurrency ? chargeOtherLabel : chargeLabel} type="number" onChange={handlecostChange} name="charges" />
                                </div>
                                {
                                    otherCurrency &&
                                    <div className="flex gap-4 flex-col w-full md:flex-row ">
                                        <InputWithLabel value={discount} min={0} label={discountLabel} type="number" readOnly />
                                        <InputWithLabel value={charge} min={0} label={chargeLabel} type="number" readOnly />
                                    </div>
                                }

                            </>
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
                        {
                            isEditor &&
                            <PrimaryButton disabled={!isEditor} loading={loading} type="submit" text={loading?"loading" : "Proceed"} className="w-full mt-4" />
                        }
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