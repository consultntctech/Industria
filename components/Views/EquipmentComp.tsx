import { Dispatch, FormEvent, SetStateAction, useEffect,  useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { formatDate, today } from "@/functions/dates";
import { IEquipment } from "@/lib/models/equipment.model";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import {useCanUser } from "@/hooks/useAuth";import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import SearchSelectCurrencies from "../shared/inputs/dropdowns/SearchSelectCurrencies";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import CustomCheckV2 from "../misc/CustomCheckV2";
import { currencyRate, exposeRate } from "@/functions/currencyHelpers";
import { IOriginalPrice } from "@/types/Types";
import { IStorage } from "@/lib/models/storage.model";
import { IEType } from "@/lib/models/etype.model";
import { createEquipment, updateEquipment } from "@/lib/actions/equipment.action";
import { useFetchEquipment } from "@/hooks/fetch/useFetchEquipment";
import SearchSelectEquipTypes from "../shared/inputs/dropdowns/SearchSelectEquipTypes";
import CloseButton from "../misc/CloseButton";
import SearchSelectStorages from "../shared/inputs/dropdowns/SearchSelectStorages";
;

type EquipmentCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  setCurrentEquipment: Dispatch<SetStateAction<IEquipment | null>>,
  currentEquipment: IEquipment | null
}

const EquipmentComp = ({openNew, setOpenNew, setCurrentEquipment, currentEquipment}:EquipmentCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IEquipment>>({purchaseDate:new Date().toISOString(), status:'Available'});

    const [type, setType] = useState<IEType|null>(null);
    const [useRate, setUseRate] = useState(false);
    const [storage, setStorage] = useState<IStorage | null>(null);
    const [originalAmount, setOriginalAmount] = useState<number>(0);
    // const [showRate, setShowRate] = useState(false);

    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency|null>(null);

    const {user} = useAuth();
    const {refetch} = useFetchEquipment();
    const {currency} = useCurrencyConfig();

    const isCreator = useCanUser('94', 'CREATE');
    const isEditor = useCanUser('94', 'UPDATE');

    const formRef = useRef<HTMLFormElement>(null);
    const savedType = currentEquipment?.type as IEType;
    const savedCurrency = currentEquipment?.original?.currency as IOtherCurrency;
    const savedStorage = currentEquipment?.location as IStorage;
    const original = currentEquipment?.original as IOriginalPrice;

    // const rate = useRate ? (otherCurrency?.rate || 1) : (currentEquipment?.original?.rate || 1);

    const showRate = exposeRate(savedCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);
    const price = ( originalAmount * rate);
    const currencyLabel = `Cost (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Cost (${otherCurrency?.symbol || otherCurrency?.name})`;

    // console.log('Price: ', price)

    const handleClose = () => {
      setCurrentEquipment(null);
      setOpenNew(false);
      // setShowRate(false);
      setUseRate(false);
      setData({purchaseDate:new Date().toISOString(), status:'Available'});
    };


    useEffect(() => {
      if(currentEquipment){
        setData({ ...currentEquipment});
        setOtherCurrency(savedCurrency);
        setOriginalAmount(Number(original?.amount));
        setStorage(savedStorage);
        setType(savedType);
      }else{
        setData({purchaseDate:new Date().toISOString(), status:'Available'});
      } 
    }, [currentEquipment])


  



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
          const equipData:Partial<IEquipment> = {
            ...data, createdBy:user?._id, org:user?.org,
            creator: user?.name,
            original:{
              amount: originalAmount,
              rate,
              currency: otherCurrency?._id as string,
            },
            price,
            location: storage?._id,
            type: type?._id,
          }
          // console.log('Data: ', equipData)
          const res = await createEquipment(equipData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating equipment', {variant:'error'});
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
             original:{
              amount: originalAmount,
              rate,
              currency: otherCurrency?._id || savedCurrency?._id
            },
            price,
            location: storage?._id,
            type: type?._id
          }
          // console.log('Raw Data: ', resData)
          const res = await updateEquipment(resData);
          // console.log('Res: ', res)
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose()
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating equipment', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    // console.log('Price: ', price)


  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      {
        openNew &&
        <form ref={formRef} onSubmit={currentEquipment ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
          <div className="flex flex-col gap-1">
            <span className="title" >{currentEquipment ? 'Edit equipment' : 'Add new equipment'}</span>
            <span className="greyText" >These are equipment you buy for production</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex gap-4 flex-col w-full">
                <InputWithLabel defaultValue={currentEquipment?.name} onChange={onChange} name="name" required={!currentEquipment} type="text" placeholder="eg. Dell laptop" label="Enter equipment name" className="w-full" />
                <GenericLabel
                  label="Select Equipment type"
                  input={<SearchSelectEquipTypes value={savedType} setSelect={setType} required={!currentEquipment} />}
                />
                <InputWithLabel defaultValue={currentEquipment?.brand} onChange={onChange} name="brand" required={!currentEquipment} type="text" placeholder="eg. Dell" label="Enter brand" className="w-full" />
                <InputWithLabel defaultValue={currentEquipment?.model} onChange={onChange} name="model" required={!currentEquipment} type="text" placeholder="eg. Inspiron" label="Enter model" className="w-full" />
                <InputWithLabel defaultValue={currentEquipment?.serialNumber} onChange={onChange} name="serialNumber" required={!currentEquipment} type="text" placeholder="eg. 1234567890" label="Enter serial number" className="w-full" />
                <InputWithLabel defaultValue={currentEquipment?.tag} onChange={onChange} name="tag" required={!currentEquipment} type="text" placeholder="eg. Dell Inspiron" label="Enter tag" className="w-full" />
                <GenericLabel 
                    label='Select status'
                    input={
                    <select defaultValue={currentEquipment?.status} onChange={onSelectChange} name="status" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                        <option  value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Maintenance">In Maintenance</option>
                    </select>
                    }
                />

                <InputWithLabel defaultValue={currentEquipment ? formatDate(currentEquipment?.purchaseDate) : today()} onChange={onChange} max={today()} name="purchaseDate" type="date" required={!currentEquipment} label="Date purchased" className="w-full" />
            </div>

            <div className="flex gap-4 flex-col w-full justify-between">
              <div className="flex flex-col gap-4 w-full">
                <GenericLabel label="Select storage" input={<SearchSelectStorages value={savedStorage} setSelect={setStorage} required={!currentEquipment} />} />
                <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!currentEquipment} setSelect={setOtherCurrency} value={savedCurrency} />} />
                {
                  showRate &&
                  <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                }
                <InputWithLabel step={0.0001} required={!currentEquipment} defaultValue={original?.amount} onChange={(e)=>setOriginalAmount(Number(e.target.value))} name="originalAmount"  type="number" min={0} placeholder="eg. 25" label={otherCurrency ? otherLabel : currencyLabel} className="w-full" />
                
                {
                  otherCurrency &&
                  <InputWithLabel step={0.0001} value={price} readOnly  name="price"  type="number"  label={currencyLabel} className="w-full" />
                }
                <TextAreaWithLabel defaultValue={currentEquipment?.description} name="description" onChange={onChange} placeholder="enter note" label="Note" className="w-full" />
              </div>
              {
                (isCreator || isEditor) &&
                <PrimaryButton disabled={currentEquipment ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentEquipment ? "Update" : "Submit"} className="w-full mt-4" />
              }
            </div>
          </div>

         <CloseButton onClick={handleClose} />
        </form>
      }
    </div>
  )
}

export default EquipmentComp