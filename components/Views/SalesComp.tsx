import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";

import { enqueueSnackbar } from "notistack";
import { ILineItem } from "@/lib/models/lineitem.model";
import { ICustomer } from "@/lib/models/customer.model";
import SearchSelectCustomers from "../shared/inputs/dropdowns/SearchSelectCustomers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ISales } from "@/lib/models/sales.model";
import { createSales, updateSales } from "@/lib/actions/sales.action";
import { useRouter } from "next/navigation";
// import { useFetchSales } from "@/hooks/fetch/useFetchSales";
import { useQueryClient } from "@tanstack/react-query";
// import SearchSelectBatchesWithLineItems from "../shared/inputs/dropdowns/SearchSelectBatchesWithLineItems";
import {useCanUser } from "@/hooks/useAuth";import { getProductCounts } from "@/functions/helpers";
import SalesLineItemsTable from "../tables/sales/SalesLineItemsTable";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import { IOriginalPrice } from "@/types/Types";
import GenericLabel from "../shared/inputs/GenericLabel";
import CustomCheckV2 from "../misc/CustomCheckV2";
import SearchSelectCurrencies from "../shared/inputs/dropdowns/SearchSelectCurrencies";
;

type SalesCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentSales:ISales | null;
  setCurrentSales:Dispatch<SetStateAction<ISales | null>>;
}

const SalesComp = ({openNew, setOpenNew, currentSales, setCurrentSales}:SalesCompProps) => {
    const [loading, setLoading] = useState(false);
    // const [product, setProduct] = useState<IProduct | null>(null);
    const [lineItems, setLineItems] = useState<ILineItem[]>([]);
    // const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [data, setData] = useState<Partial<ISales>>({});
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);
    const [useRate, setUseRate] = useState(false);
    // const [batch, setBatch] = useState<string>('');
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();

    // const {lineItems:items, isPending} = useFetchAvailableLineItemsByProduct(product?._id as string, batch);

    const isCreator = useCanUser('82', 'CREATE');
    const isEditor = useCanUser('82', 'UPDATE');
    // const {refetch} = useFetchSales();

    // console.log('Items: ', items.length)
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const savedItems = (currentSales?.products || []) as ILineItem[];
    const savedCustomer = currentSales?.customer as ICustomer;
    const utils = useQueryClient();

    const original = currentSales?.original as IOriginalPrice;
    const currentCurrency = original?.currency as IOtherCurrency;

    // console.log('LineItems: ', currentSales);
    const showRate = exposeRate(currentCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);

    const needed= useMemo(()=>getProductCounts(lineItems), [lineItems]);

    const price = lineItems.reduce((acc, { price }) => acc + price, 0);
    const charge = Number(data.charges || 0) * (rate || 1);
    const discount = Number(data.discount || 0) * (rate || 1);
    const netCharges = charge - discount;

    const totalPrice = price + netCharges;

    const chargeLabel = `Charges (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const discountLabel = `Discount (${currency?.symbol || currency?.name || 'Primary currency'})`;

    const chargeOtherLabel = `Charges (${otherCurrency?.symbol || otherCurrency?.name})`;
    const discountOtherLabel = `Discount (${otherCurrency?.symbol || otherCurrency?.name})`;

    const beforeRateNetCharge = Number(data.charges || 0) + Number(data.discount || 0);
    // console.log('Saved Customer: ', savedCustomer)

   

    useEffect(()=>{
        if(currentSales){
            setData({...currentSales});
            setLineItems(savedItems);
            setCustomer(savedCustomer);
            setOtherCurrency(currentCurrency);
        }
       else{
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
        if(!lineItems || lineItems.length === 0){
            enqueueSnackbar('Please select at least one product', {variant:'error'});
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
                original:{
                    amount: beforeRateNetCharge,
                    rate: rate,
                    currency: otherCurrency?._id as string,
                }
            }
            const res = await createSales(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                utils.invalidateQueries({ queryKey: ['allsales'] });
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
                original:{
                    amount: beforeRateNetCharge,
                    rate: rate,
                    currency: otherCurrency?._id as string,
                }
            }
            const res = await updateSales(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                utils.invalidateQueries({ queryKey: ['allsales'] });
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating storage location', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

   

    // console.log('Data: ', data)

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={ currentSales ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                
                <div className="flex flex-col  gap-4 items-stretch">
                    <div className="flex flex-col gap-4 w-full">
                        {/* <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <GenericLabel label="Product"
                                input={<SearchSelectProducts required={!currentSales} type="Finished Good" setSelect={setProduct} />}
                            />
                            <GenericLabel label="Batch (optional)"
                                input={<SearchSelectBatchesWithLineItems setSelect={setBatch} />}
                            />
                        </div> */}
                        {/* <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <InputWithLabel onChange={onChange} name="quantity"  min={1} placeholder="eg. 10" label="Quantity to search for" className="w-full" />
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
                        <span>{lineItems?.length} / {items?.length} products selected</span> */}
                        
                        <SalesLineItemsTable currentSales={currentSales} needed={needed} lines={lineItems} setLines={setLineItems} />
                        <div className="flex gap-4 flex-col w-full md:flex-row">
                            <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!currentSales} setSelect={setOtherCurrency} value={currentCurrency} />} />
                            {
                                showRate &&
                                <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                            }
                        </div>

                        <div className="flex gap-4 flex-col w-full md:flex-row ">
                            <InputWithLabel defaultValue={currentSales?.discount} min={0} step={0.0001} label={otherCurrency ? discountOtherLabel : discountLabel} type="number" onChange={onChange} name="discount" />
                            <InputWithLabel defaultValue={currentSales?.charges} min={0} step={0.0001} label={otherCurrency ? chargeOtherLabel : chargeLabel} type="number" onChange={onChange} name="charges" />
                        </div>
                        {
                            otherCurrency &&
                            <div className="flex gap-4 flex-col w-full md:flex-row ">
                                <InputWithLabel value={discount} min={0} step={0.0001} label={discountLabel} type="number" readOnly name="discount" />
                                <InputWithLabel value={charge} min={0} step={0.0001} label={chargeLabel} type="number" readOnly name="charges" />
                            </div>
                        }
                        {
                            lineItems?.length > 0 &&
                            <span className="font-semibold">Total price: {totalPrice} {currency?.symbol || ''}</span>
                        }
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <SearchSelectCustomers required={!currentSales} value={savedCustomer} setSelect={setCustomer} />
                            <TextAreaWithLabel defaultValue={currentSales?.narration} name="narration" onChange={onChange} placeholder="enter narration" label="Narration" className="w-full" />
                        </div>
                        {
                            (isCreator || isEditor) &&
                            <PrimaryButton disabled={currentSales ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentSales ? 'Update': "Proceed"} className="w-full mt-4" />
                        }
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