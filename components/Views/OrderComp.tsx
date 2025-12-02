

import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import SearchSelectCustomers from "../shared/inputs/dropdowns/SearchSelectCustomers";
import { ICustomer } from "@/lib/models/customer.model";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import { IProduct } from "@/lib/models/product.model";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import GenericLabel from "../shared/inputs/GenericLabel";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOrder } from "@/lib/models/order.model";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createOrder, updateOrder } from "@/lib/actions/order.action";
import { enqueueSnackbar } from "notistack";
import { formatDate } from "@/functions/dates";


type OrderCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentOrder:IOrder | null; 
  setCurrentOrder: Dispatch<SetStateAction<IOrder | null>>;
}

const OrderComp = ({openNew, setOpenNew, currentOrder, setCurrentOrder}:OrderCompProps) => {
  const [data, setData] = useState<Partial<IOrder>>({});
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [product, setProduct] = useState<IProduct | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const {currency} = useCurrencyConfig();
  const utils = useQueryClient();
  const {user} = useAuth();

  const savedCustomer = currentOrder?.customer as ICustomer;
  const savedProduct = currentOrder?.product as IProduct;

  const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setData((pre)=>({
      ...pre, [name]: value
    }))
  }

  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData:Partial<IOrder> = {
        ...data,
        customer: customer?._id,
        product: product?._id,
        org:user?.org,
        createdBy:user?._id
      }
      const res = await createOrder(formData);
      enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        utils.invalidateQueries({ queryKey: ['orders'] });
        handleClose();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while placing the order', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }
  const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData:Partial<IOrder> = {
        ...data,
        _id: currentOrder?._id,
        customer: customer?._id || savedCustomer?._id,
        product: product?._id || savedProduct?._id,
      }
      const res = await updateOrder(formData);
      enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        utils.invalidateQueries({ queryKey: ['orders'] });
        handleClose();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while updating the order', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpenNew(false);
    setCurrentOrder(null);
  }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
      {
        openNew &&
        <form ref={formRef} onSubmit={ currentOrder ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentOrder ? 'Edit order' : 'Add new order'}</span>
                <span className="greyText" >{currentOrder ? 'Edit the order details' : 'Place an order for requested products'}</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                  <GenericLabel
                    label="Select customer"
                    input={<SearchSelectCustomers value={savedCustomer} required={!currentOrder} setSelect={setCustomer} />}
                  />
                  <GenericLabel label="Select product"
                    input={<SearchSelectProducts value={savedProduct} setSelect={setProduct} type="Finished Good" />}
                  />
                  <InputWithLabel defaultValue={currentOrder?.quantity} onChange={onChange} name="quantity"  min={0} step={0.0001}  label="Enter quantity" className="w-full" />
                  <InputWithLabel defaultValue={currentOrder?.price} placeholder="this is optional"  onChange={onChange} name="price"  min={0} step={0.0001}  label={`Enter amount received from customer (${currency?.symbol || ''})`} className="w-full" />
                </div>
    
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                      <InputWithLabel defaultValue={formatDate(currentOrder?.deadline)} type="date" onChange={onChange} name="deadline" label="Deadline" />
                      <TextAreaWithLabel defaultValue={currentOrder?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    </div>
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentOrder ? 'Update' : "Submit"} className="w-full mt-4" />
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

export default OrderComp