import { Dispatch, FormEvent, SetStateAction, useEffect,  useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import { FaChevronUp } from "react-icons/fa";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import SearchSelectBatches from "../shared/inputs/dropdowns/SearchSelectBatches";
import { formatDate, today } from "@/functions/dates";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { enqueueSnackbar } from "notistack";
import { createRMaterial, updateRMaterial } from "@/lib/actions/rmaterial.action";
import { IProduct } from "@/lib/models/product.model";
import { useAuth } from "@/hooks/useAuth";
import { useFetchRMaterials } from "@/hooks/fetch/useRMaterials";
import { ISupplier } from "@/lib/models/supplier.model";
import { IBatch } from "@/lib/models/batch.model";
import {useCanUser } from "@/hooks/useAuth";import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import SearchSelectCurrencies from "../shared/inputs/dropdowns/SearchSelectCurrencies";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import CustomCheckV2 from "../misc/CustomCheckV2";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import { IOriginalPrice } from "@/types/Types";
import { IStorage } from "@/lib/models/storage.model";
import SearchSelectMultipleStorages from "../shared/inputs/dropdowns/SearchSelectMultipleStorages";
import SearchSelectLtdMultipleSuppliers from "../shared/inputs/dropdowns/SearchSelectLtdMultipleSuppliers";
;

type RMCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  setCurrentMaterial: Dispatch<SetStateAction<IRMaterial | null>>,
  currentMaterial: IRMaterial | null
}

const RMComp = ({openNew, setOpenNew, setCurrentMaterial, currentMaterial}:RMCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IRMaterial>>({dateReceived:new Date(), qStatus:'Pass', qReceived:0, qRejected:0, charges:0, discount:0});

    const [product, setProduct] = useState<IProduct|null>(null);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [batch, setBatch] = useState<string>('')
    const [showReason, setShowReason] = useState(false);
    const [useRate, setUseRate] = useState(false);
    const [storages, setStorages] = useState<IStorage[]>([]);
    // const [showRate, setShowRate] = useState(false);

    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency|null>(null);

    const {user} = useAuth();
    const {refetch} = useFetchRMaterials();
    const {currency} = useCurrencyConfig();

    const isCreator = useCanUser('87', 'CREATE');
    const isEditor = useCanUser('87', 'UPDATE');

    const formRef = useRef<HTMLFormElement>(null);
    const savedProduct = currentMaterial?.product as IProduct;
    const savedSuppliers = currentMaterial?.suppliers as ISupplier[];
    const savedBatch = currentMaterial?.batch as IBatch;
    const savedCurrency = currentMaterial?.original?.currency as IOtherCurrency;
    const savedStorages = currentMaterial?.storages as IStorage[];
    const original = currentMaterial?.original as IOriginalPrice;

    // const rate = useRate ? (otherCurrency?.rate || 1) : (currentMaterial?.original?.rate || 1);
    const originalAmount = ((data?.unitPrice! * data.qReceived!) - (data.discount! - data?.charges!)) || 0;

    const showRate = exposeRate(savedCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);
    const price = ( originalAmount * rate);
    const currencyLabel = `Total cost (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Total cost (${otherCurrency?.symbol || otherCurrency?.name})`;

    // console.log('Other Currency: ', otherCurrency)

    const handleClose = () => {
      setCurrentMaterial(null);
      setOpenNew(false);
      // setShowRate(false);
      setUseRate(false);
    };


    useEffect(() => {
      if(currentMaterial){
        setData({ ...currentMaterial});
        setOtherCurrency(savedCurrency);
        setStorages(savedStorages);
        setSuppliers(savedSuppliers);
        if(currentMaterial?.product){
          setProduct(savedProduct);
        }
      }else{
        setData({dateReceived:new Date(), qStatus:'Pass', qReceived:0, qRejected:0, charges:0, discount:0});
      } 
    }, [currentMaterial])


    useEffect(() => {
      if(data?.qRejected && data?.qRejected > 0){
        setShowReason(true);
      }else{
        setShowReason(false);
      }
    }, [data.qRejected])

    useEffect(() => {
      if(product){
        setData((pre)=>({
          ...pre, product: product._id || savedProduct?._id,
          price: (data?.unitPrice! * data.qReceived!) - (data.discount! - data?.charges!),
          qAccepted: data.qReceived! - data.qRejected!
        }))
      } 
    }, [data.qReceived, data.qRejected, data.discount, data.charges, product?.id, data?.unitPrice])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

// alert(data.charges)

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
          const rmData:Partial<IRMaterial> = {
            ...data, product: product?._id, batch, createdBy:user?._id, org:user?.org,
            original:{
              amount: originalAmount,
              rate,
              currency: otherCurrency?._id as string,
            },
            price,
            storages: storages.map((item)=>item._id),
            suppliers: suppliers.map((item)=>item._id)
          }
          // console.log('Data: ', rmData)
          const res = await createRMaterial(rmData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating raw material', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const resData = {
            ...data, 
            batch: batch || savedBatch?._id,
            product: product?._id || savedProduct?._id,
             original:{
              amount: originalAmount,
              rate,
              currency: otherCurrency?._id || savedCurrency?._id
            },
            price,
            storages: storages.map((item)=>item._id),
            suppliers: suppliers.map((item)=>item._id)
          }
          // console.log('Raw Data: ', resData)
          const res = await updateRMaterial(resData);
          // console.log('Res: ', res)
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose()
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating raw material', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }



  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      {
        openNew &&
        <form ref={formRef} onSubmit={currentMaterial ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
          <div className="flex flex-col gap-1">
            <span className="title" >{currentMaterial ? 'Edit raw material' : 'Add new raw material'}</span>
            <span className="greyText" >These are the goods you buy for production</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex gap-4 flex-col w-full">
            
                  <GenericLabel
                    label="Select product"
                    input={<SearchSelectProducts value={savedProduct} type="Raw Material" setSelect={setProduct} required={!currentMaterial} />}
                  />
                  <GenericLabel
                  label="Select supplier"
                  input={<SearchSelectLtdMultipleSuppliers value={savedSuppliers} required={!currentMaterial} setSelection={setSuppliers} productId={product?._id || ''} />}
                  />
                  <GenericLabel 
                    label='Select batch'
                    input={
                      <SearchSelectBatches value={savedBatch} type="Raw Material" required={!currentMaterial} setSelect={setBatch} />
                    }
                  />
                  <GenericLabel 
                    label='Select storages'
                    input={
                      <SearchSelectMultipleStorages value={savedStorages} required={!currentMaterial} setSelection={setStorages} />
                    }
                    />
                <GenericLabel 
                    label='Select quality status'
                    input={
                    <select defaultValue={currentMaterial?.qStatus} onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                        <option  value="Pass">Pass</option>
                        <option value="Partial">Partial</option>
                        <option value="Fail">Fail</option>
                    </select>
                    }
                />
              <InputWithLabel defaultValue={currentMaterial?.yield} onChange={onChange} name="yield"  type="number" min={1} placeholder="eg. 2" label="Expected yield rate" className="w-full" />
              <InputWithLabel defaultValue={currentMaterial? formatDate(currentMaterial?.dateReceived) : today()} onChange={onChange} max={today()} name="dateReceived" type="date" required={!currentMaterial} label="Date received" className="w-full" />
              <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!currentMaterial} setSelect={setOtherCurrency} value={savedCurrency} />} />
              {
                showRate &&
                <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
              }
              <InputWithLabel step={0.0001} required={!currentMaterial} defaultValue={currentMaterial?.unitPrice} onChange={onChange} name="unitPrice"  type="number" min={0} placeholder="eg. 25" label="Enter unit price" className="w-full" />
              <InputWithLabel step={0.0001} required={!currentMaterial} defaultValue={currentMaterial?.qReceived} onChange={onChange} name="qReceived" type="number" min={0} placeholder="eg. 1000" label="Quantity received" className="w-full" />
            </div>

            <div className="flex gap-4 flex-col w-full justify-between">
              <InputWithLabel step={0.0001} onChange={onChange} defaultValue={currentMaterial?.qRejected || 0} name="qRejected" type="number" min={0} placeholder="eg. 50" label="Quantity rejected" className="w-full" />
              <div className="flex flex-col gap-4 w-full">
                {
                    showReason &&
                    <TextAreaWithLabel defaultValue={currentMaterial?.reason} name="reason" onChange={onChange} placeholder="enter reason for rejection (if any)" label="Reason for rejection" className="w-full" />
                }
                <InputWithLabel step={0.0001} defaultValue={currentMaterial?.charges} onChange={onChange} name="charges"  type="number" min={0} placeholder="eg. 20" label="Addtional Charges" className="w-full" />
                <InputWithLabel step={0.0001} defaultValue={currentMaterial?.discount} onChange={onChange} name="discount"  type="number" min={0} placeholder="eg. 20" label="Discount" className="w-full" />
                <InputWithLabel step={0.0001} value={originalAmount} readOnly   type="number"  label={otherCurrency? otherLabel : currencyLabel} className="w-full" />
                {
                  otherCurrency &&
                  <InputWithLabel step={0.0001} value={price} readOnly  name="price"  type="number"  label={currencyLabel} className="w-full" />
                }
                <InputWithLabel onChange={onChange} step={0.0001} defaultValue={currentMaterial?.weight || 0} required={!currentMaterial}  name="weight"  type="number"  label="Total weight" className="w-full" />
                <TextAreaWithLabel defaultValue={currentMaterial?.note} name="note" onChange={onChange} placeholder="enter note" label="Note" className="w-full" />
              </div>
              {
                (isCreator || isEditor) &&
                <PrimaryButton disabled={currentMaterial ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentMaterial ? "Update" : "Submit"} className="w-full mt-4" />
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

export default RMComp