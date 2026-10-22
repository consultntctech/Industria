import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import GenericLabel from "../shared/inputs/GenericLabel";
import { createProdItem, updateProdItem } from "@/lib/actions/proditem.action";
import { IProdItem } from "@/lib/models/proditem.model";
import { enqueueSnackbar } from "notistack";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useFetchProditem } from "@/hooks/fetch/useFetchProditem";
import CustomCheckV2 from "../misc/CustomCheckV2";
import {useCanUser } from "@/hooks/useAuth";import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import SearchSelectCurrencies from "../shared/inputs/dropdowns/SearchSelectCurrencies";
import { IOriginalPrice } from "@/types/Types";
import { IStorage } from "@/lib/models/storage.model";
import SearchSelectMultipleStorages from "../shared/inputs/dropdowns/SearchSelectMultipleStorages";
import { formatDate, today } from "@/functions/dates";
import { ISupplier } from "@/lib/models/supplier.model";
import { IProdType } from "@/lib/models/prodtype.model";
import SearchSelectProdType from "../shared/inputs/dropdowns/SearchSelectProdType";
import SearchSelectMultipleSuppliersByProdType from "../shared/inputs/dropdowns/SearchSelectMultipleSuppliersByProdType";
import CloseButton from "../misc/CloseButton";
;

type ProdItemCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentProdItem:IProdItem | null;
  setCurrentProdItem:Dispatch<SetStateAction<IProdItem | null>>;
}

const ProdItemComp = ({openNew, setOpenNew, currentProdItem, setCurrentProdItem}:ProdItemCompProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Partial<IProdItem>>({dateReceived:new Date()});

    // const [reusable, setReusable] = useState<boolean>(false);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [prodType, setProdType] = useState<IProdType | null>(null);
    // const [price, setPrice] = useState<number>(0);
    const [useRate, setUseRate] = useState(false);
    const [originalCost, setOriginalCost] = useState(0);
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency|null>(null);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const {user} = useAuth();
    const {currency} = useCurrencyConfig();
    const {refetch} = useFetchProditem();

    const isCreator = useCanUser('12', 'CREATE');
    const isEditor = useCanUser('12', 'UPDATE');

    const savedCurrency = currentProdItem?.original?.currency as IOtherCurrency;
    const original = currentProdItem?.original as IOriginalPrice;
    const savedStorages = currentProdItem?.storages as IStorage[];
    const savedSuppliers = currentProdItem?.suppliers as ISupplier[];
    const savedProdType = currentProdItem?.type as IProdType;

    const showRate = exposeRate(savedCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, useRate, showRate);

    // const originalCost = (data?.quantity || 0) * (data?.unitPrice || 0);
    const price = originalCost * rate;


    useEffect(() => {
        if(currentProdItem){
            setData({...currentProdItem});
            setOriginalCost(original?.amount || 0);
            setOtherCurrency(savedCurrency);
            setStorages(savedStorages);
            setSuppliers(savedSuppliers);
            setProdType(savedProdType);
        }else{
            setData({dateReceived:new Date()})
        }
    }, [currentProdItem])

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProdItem(null);
        setStorages([]);
    }

    useEffect(() => {
      if(data.quantity && data.unitPrice && !currentProdItem){
        setOriginalCost(data.quantity * data.unitPrice);
      }else{
        setOriginalCost(original?.amount || 0);
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
            org:user?.org, createdBy:user?._id, creator: user?.name,
            stock: data.quantity, 
            used: 0, suppliers: suppliers.map((item)=>item._id),
            price,
            type: prodType?._id,
            original:{
              amount: originalCost,
              rate,
              currency: otherCurrency?._id as string,
            },
            storages: storages.map((item)=>item._id),
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
          enqueueSnackbar('Error occured while creating packaging material item', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    
const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    // stock, used and the ownership fields are not sent: the server calculates or keeps them
    const {
      stock: _stock,
      used: _used,
      org: _org,
      createdBy: _createdBy,
      creator: _creator,
      ...fields
    } = data;

    const prod: Partial<IProdItem> = {
      ...fields,
      price,
      suppliers: suppliers.map((item) => item._id),
      type: prodType?._id || savedProdType?._id,
      original: {
        amount: originalCost,
        rate,
        currency: otherCurrency?._id as string,
      },
      storages: storages.map((item) => item._id),
    };

    const res = await updateProdItem(prod);
    enqueueSnackbar(res.message, { variant: res.error ? 'error' : 'success' });
    if (!res.error) {
      formRef.current?.reset();
      handleClose();
      refetch();
    }
  } catch (error) {
    console.log(error);
    enqueueSnackbar('Error occured while updating packaging material item', { variant: 'error' });
  } finally {
    setLoading(false);
  }
};

    // console.log('Reusable: ', reusable)
    const costLabel = `Total cost (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Total cost (${otherCurrency?.symbol || otherCurrency?.name})`;

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={currentProdItem ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentProdItem ? 'Edit packaging material item' : 'Add new packaging material item'}</span>
                <span className="greyText" >These are materials you use for packaging. Eg. sacks, bottles, etc</span>
            </div>

            {
                openNew &&
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentProdItem?.name} onChange={onChange} name="name" required placeholder="enter name" label="Item name" className="w-full" />

                        <GenericLabel 
                            label='Select material type'
                            input={<SearchSelectProdType setSelect={setProdType} value={savedProdType} required={!currentProdItem} />}
                        />

                        <GenericLabel
                            label='Select suppliers'
                            input={<SearchSelectMultipleSuppliersByProdType typeId={prodType?._id} value={savedSuppliers} setSelection={setSuppliers} />}
                        />

                        <GenericLabel
                            input={
                                <select defaultValue={currentProdItem?.qStatus}  onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                                <option  value="Pass">Pass</option>
                                <option value="Partial">Partial</option>
                                <option value="Fail">Fail</option>
                            </select>
                            }
                        />
                        <InputWithLabel defaultValue={currentProdItem? formatDate(currentProdItem?.dateReceived) : today()} onChange={onChange} max={today()} name="dateReceived" type="date" required={!currentProdItem} label="Date received" className="w-full" />
                        <InputWithLabel step={0.01}  min={Math.max(1, currentProdItem?.used ?? 0)} defaultValue={currentProdItem?.quantity} onChange={onChange} name="quantity" required type="number" placeholder="10" label="Enter quantity" className="w-full" />
                        <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!currentProdItem} setSelect={setOtherCurrency} value={savedCurrency} />} />
                        {
                            showRate &&
                          <GenericLabel label='Use current rate' input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} className="flex-row items-center gap-6" />
                        }
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                          <InputWithLabel defaultValue={original?.amount} step={0.01} onChange={onChange} name="unitPrice" required={!currentProdItem} type="number" min={0} placeholder={`${currency?.symbol}25.5`} label={'Enter unit price'} className="w-full" />
                          <InputWithLabel value={originalCost} onChange={(e)=>setOriginalCost(Number(e.target.value))} name="price" required={!currentProdItem} type="number" min={0} placeholder={`${currency?.symbol}25.5`} label={otherCurrency ? otherLabel : costLabel} className="w-full" />
                          {
                            otherCurrency &&
                            <InputWithLabel value={price}  name="price" type="number" readOnly min={0} placeholder={`${currency?.symbol}25.5`} label={costLabel} className="w-full" />
                          }
                          <GenericLabel label="Storage" input={<SearchSelectMultipleStorages  placeholder="Storage locations" required={storages?.length === 0} value={savedStorages} setSelection={setStorages} />}  />
                          {/* <div className="flex flex-row items-center gap-4">
                              <span className="smallText">This item is reusable</span>
                              <CustomCheckV2 checked={reusable} setChecked={setReusable} />
                          </div> */}
                          
                          <TextAreaWithLabel defaultValue={currentProdItem?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        {
                          (isCreator || isEditor) &&
                          <PrimaryButton disabled={currentProdItem ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentProdItem ? "Update" : "Submit"} className="w-full mt-4" />
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

export default ProdItemComp