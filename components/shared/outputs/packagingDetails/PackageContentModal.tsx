import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer';
import { IoIosClose } from 'react-icons/io';
import { FaChevronUp } from 'react-icons/fa';
import GenericLabel from '../../inputs/GenericLabel';
import InputWithLabel from '../../inputs/InputWithLabel';
import PrimaryButton from '../../buttons/PrimaryButton';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
// import { IProdItem } from '@/lib/models/proditem.model';
import {  IQSelector } from '@/types/Types';
import { enqueueSnackbar } from 'notistack';
import '@/styles/customscroll.css'
import { IPackage } from '@/lib/models/package.model';
import  { IProdItem } from '@/lib/models/proditem.model';
import ProdItemSelector from '@/components/misc/ProdItemSelector';
import SearchSelectAvMultipleProdItems from '../../inputs/dropdowns/SearchSelectAvMultipleProdItems';
import { updatePackagingMaterials } from '@/lib/actions/package.action';
import { useAuth } from '@/hooks/useAuth';
import { canUser } from '@/Data/roles/permissions';
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
  const [cost, setCost] = useState<number>(0);
  const {user} = useAuth();
  const isEditor = canUser(user, '99', 'UPDATE');


  const formRef = React.useRef<HTMLFormElement>(null);

    const {currency} = useCurrencyConfig();
    // const savedProditems = pack?.proditems as unknown as IProdItem[];


    const oldPackingMaterial = pack?.packagingMaterial?.map((item=>item?.materialId)) as unknown as IProdItem[];
    // const equals = arraysEqual(oldPackingMaterial.map(ing=>ing._id), packagingMaterial.map(ing=>ing._id));
    


    useEffect(() => {
        if(pack){
            setData({...pack});
            const formaattedItems:IQSelector[] = pack?.packagingMaterial?.map((ing) => ({
                materialId: (ing.materialId as IProdItem)._id,
                quantity: ing.quantity,
            }));
            setPackagingMaterial(oldPackingMaterial);
            setPackItems(formaattedItems);
        }
    }, [pack])

    useEffect(() => {
        
        const price = packagingMaterial.reduce((sum, material) => {
            const item = packItems.find(ing => ing.materialId === material._id);
            const qUsed = item?.quantity || 0;
            return sum + (material.unitPrice * qUsed);
        }, 0);
        setCost(price);
        
    }, [packagingMaterial.length, packItems.length]);


    useEffect(() => {
        if (packagingMaterial.length === 0) return;
        const validIds = new Set(packagingMaterial.map(rm => rm._id));
        setPackItems(prev => prev.filter(ing => validIds.has(ing.materialId)));
        setData(pre=>({...pre, cost}));
    }, [packagingMaterial,  cost]);


    
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

    const changeCost = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target;
        setCost(Number(value));
    }

  

    const handleClose = ()=>{
        setOpenNew(false);
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
                //  proditems: proditems?.map(item=>item._id),
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

  return (
    <ModalContainer  open={openNew} handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] max-h-[95%]">
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
                            <InputWithLabel value={cost || pack?.cost} onChange={changeCost} name="cost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={`Packaging cost (${currency?.symbol || ''} ${pack?.cost})`} className="w-full" />
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