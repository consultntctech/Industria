import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import ModalContainer from '../ModalContainer';
import { IoIosClose } from 'react-icons/io';
import { FaChevronUp } from 'react-icons/fa';
import GenericLabel from '../../inputs/GenericLabel';
import InputWithLabel from '../../inputs/InputWithLabel';
import PrimaryButton from '../../buttons/PrimaryButton';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
// import { IProdItem } from '@/lib/models/proditem.model';
import {  IOriginalPrice, IQSelector } from '@/types/Types';
import { enqueueSnackbar } from 'notistack';
import { IPackage } from '@/lib/models/package.model';
import  { IProdItem } from '@/lib/models/proditem.model';
import ProdItemSelector from '@/components/misc/ProdItemSelector';
import SearchSelectAvMultipleProdItems from '../../inputs/dropdowns/SearchSelectAvMultipleProdItems';
import { updatePackagingMaterials } from '@/lib/actions/package.action';
import { useCanUser } from '@/hooks/useAuth';
import { IOtherCurrency } from '@/lib/models/othercurrency.model';
import { currencyRate, exposeRate } from '@/functions/currencyHelpers';
import SearchSelectCurrencies from '../../inputs/dropdowns/SearchSelectCurrencies';
import CustomCheckV2 from '@/components/misc/CustomCheckV2';
import '@/styles/customscroll.css'
// import { arraysEqual } from '@/functions/helpers';

type PackageContentModalProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
//   setOpenItem: Dispatch<SetStateAction<boolean>>;
//   openItem: boolean;
  pack: IPackage | null;
}

const PackageContentModal = ({openNew, setOpenNew, pack}:PackageContentModalProps) => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Partial<IPackage>>({});
  const [packagingMaterial, setPackagingMaterial] = useState<IProdItem[]>([]);
  const [packItems, setPackItems] = useState<IQSelector[]>([]);
  const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);
  const [useRate, setUseRate] = useState(false);
//   const [cost, setCost] = useState<number>(0);
  const [manualCost, setManualCost] = useState<number | null>(null);
  const isEditor = useCanUser('99', 'UPDATE');


  const formRef = React.useRef<HTMLFormElement>(null);

    const {currency} = useCurrencyConfig();
    // const savedProditems = pack?.proditems as unknown as IProdItem[];


    const oldPackingMaterial = pack?.packagingMaterial?.map((item=>item?.materialId)) as unknown as IProdItem[];
    const original = pack?.original as IOriginalPrice;
    const currentCurrency = original?.currency as IOtherCurrency;
    // const equals = arraysEqual(oldPackingMaterial.map(ing=>ing._id), packagingMaterial.map(ing=>ing._id));
    
    const showRate  = exposeRate(currentCurrency, otherCurrency);
    const rate = currencyRate(original, otherCurrency, showRate, useRate);

    
    const calculatedCost = useMemo(() => {
        return packagingMaterial.reduce((sum, material) => {
            const item = packItems.find(ing => ing.materialId === material._id);
            const qUsed = item?.quantity || 0;
            return sum + (material.unitPrice * qUsed);
        }, 0);
    }, [packagingMaterial, packItems]);
    
    const cost = manualCost !== null ? manualCost : calculatedCost;
    // console.log('Cost: ', price);
    const price = cost * rate;


    useEffect(() => {
        if(pack){
            setData({...pack});
            const formaattedItems:IQSelector[] = pack?.packagingMaterial?.map((ing) => ({
                materialId: (ing.materialId as IProdItem)._id,
                quantity: ing.quantity,
            }));
            setPackagingMaterial(oldPackingMaterial);
            setPackItems(formaattedItems);
            setManualCost(null);
            setOtherCurrency(currentCurrency);
        }
    }, [pack])

    useEffect(() => {
        if (packagingMaterial.length === 0) return;
        const validIds = new Set(packagingMaterial.map(rm => rm._id));
        setPackItems(prev => prev.filter(ing => validIds.has(ing.materialId)));
        setManualCost(null); // material selection changed → drop any manual override
    }, [packagingMaterial]);

    useEffect(() => {
        setData(pre => ({...pre, cost}));
    }, [cost]);

    const changeCost = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setManualCost(value === '' ? null : Number(value));
    };

    
    const onChangeInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {id, value} = e.target;
        const qty = parseInt(value, 10) || 0;
        setPackItems(pre=>{
            const existing = pre.find(ing=>ing.materialId === id);
            if(existing){
                return pre.map(ing=>ing.materialId === id ? {...ing, quantity: qty} : ing);
            }else{
                return [...pre, {materialId:id, quantity: qty}];
            }
        })
    }

  

    const handleClose = ()=>{
        setOpenNew(false);
        // setOtherCurrency(null);
        // setOpenItem(false);
    }

 const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
         e.preventDefault();
         setLoading(true);
         
         try {
             const prodData:Partial<IPackage> = {
                 ...data,
                 packagingMaterial: packItems.map(ing=>({
                     materialId: ing.materialId,
                     quantity: ing.quantity
                 })),
                 cost: price,
                 original:{
                     amount: cost,
                     rate,
                     currency: otherCurrency?._id as string,
                 },
             }
             
           const res = await updatePackagingMaterials(prodData);
           enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
           if(!res.error){
               formRef.current?.reset();
               handleClose();
            //    const payload = res.payload as IPackage;
               window.location.reload();
           }
         } catch (error) {
           console.log(error);
           enqueueSnackbar('Error occured updating packaging materials', {variant:'error'});
         }finally{
           setLoading(false);
         }
     }

     const getQuantity = (material:IProdItem)=>{
         const item = packItems.find(ing => ing.materialId === material._id);
        //  console.log('Ingredient: ', item)
         return item?.quantity || 0;
     }

    //  console.log('Raw Materials: ', ingredients)
    const costLabel = `Packaging cost (${currency?.symbol || currency?.name || 'Primary currency'} ${pack?.cost})`;
    const otherLabel = `Packaging cost (${otherCurrency?.symbol || otherCurrency?.name} ${original?.amount})`;

  return (
    <ModalContainer  open={openNew} handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] h-[90%] items-center">
            <form ref={formRef} onSubmit={ handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Edit package data</span>
                    <span className="greyText" >You cannot edit the package after it has been approved.</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-col gap-4 w-full">
                            {
                               openNew &&
                                <>
                                    
                                    <GenericLabel
                                        label="Select packaging materials"
                                        input={<SearchSelectAvMultipleProdItems value={oldPackingMaterial} setSelection={setPackagingMaterial}  />}
                                    />

                                    {
                                        packagingMaterial.length > 0 && 
                                        <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                                            <span className="subtitle text-gray-500 gap-2" >Packaging Materials</span>
                                            <div className="flex flex-row flex-wrap items-center gap-2">
                                                {
                                                    packagingMaterial.map((material, index)=>{
                                                        const qty = getQuantity(material);
                                                        return (
                                                            <ProdItemSelector key={index} item={material} inputId={material?._id} onChangeInput={onChangeInput} name={material?.materialName} quantity={qty} />
                                                        )
                                                    }
                                                    )
                                                }
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                            {/* {
                                openItem &&
                                <GenericLabel
                                    label="Add pack items"
                                    input={<SearchSelectMultipleProdItems value={proditems} setSelection={setProditems} />}
                                />
                            } */}
                            <GenericLabel label="Select currency" input={<SearchSelectCurrencies required={!original} setSelect={setOtherCurrency} value={currentCurrency} />} />
                            {
                                showRate &&
                                <GenericLabel className="flex-row items-center gap-6" label="Use current rate" input={<CustomCheckV2 checked={useRate} setChecked={setUseRate} />} />
                            }
                            <InputWithLabel value={cost} onChange={changeCost} step={0.00001} name="cost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={otherCurrency ? otherLabel : costLabel} className="w-full" />
                            {
                                otherCurrency &&
                                <InputWithLabel value={price} readOnly type="number" min={1} placeholder={`${currency?.symbol}1000`} label={costLabel} className="w-full" />
                            }
                        </div>
                        {
                            isEditor &&
                            <PrimaryButton disabled={!isEditor} loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                        }
                    </div>

                </div>
        
                <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <IoIosClose className="text-red-700" />
                </div>
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        </div>
    </ModalContainer>
  )
}

export default PackageContentModal