import { IProduction } from '@/lib/models/production.model';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer';
import { IoIosClose } from 'react-icons/io';
import { FaChevronUp } from 'react-icons/fa';
import GenericLabel from '../../inputs/GenericLabel';
import SearchSelectBatches from '../../inputs/dropdowns/SearchSelectBatches';
import SearchSelectAvMultipleRMaterials from '../../inputs/dropdowns/SearchSelectAvMultipleRMaterials';
import RMQSelector from '@/components/misc/RMQSelector';
import SearchSelectMultipleProdItems from '../../inputs/dropdowns/SearchSelectMultipleProdItems';
import InputWithLabel from '../../inputs/InputWithLabel';
import PrimaryButton from '../../buttons/PrimaryButton';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IRMaterial } from '@/lib/models/rmaterial.mode';
import { IProdItem } from '@/lib/models/proditem.model';
import { IIngredient } from '@/types/Types';
import {  updateProductionIngredients } from '@/lib/actions/production.action';
import { enqueueSnackbar } from 'notistack';
import '@/styles/customscroll.css'

type ProductionContentModalProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  setOpenItem: Dispatch<SetStateAction<boolean>>;
  openItem: boolean;
  production: IProduction | null;
}

const ProductionContentModal = ({openNew, setOpenNew, setOpenItem, openItem, production}:ProductionContentModalProps) => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Partial<IProduction>>({});
  const [rawMaterials, setRawMaterials] = useState<IRMaterial[]>([]);
  const [oldRawMaterials, setOldRawMaterials] = useState<IRMaterial[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [proditems, setProditems] = useState<IProdItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalProd, setTotalProd] = useState(0);
  const [productionCost, setProductionCost] = useState(0);
  const [productBatchId, setProductBatchId] = useState<string>('');

  const formRef = React.useRef<HTMLFormElement>(null);

    const {currency} = useCurrencyConfig();
    const savedProditems = production?.proditems as unknown as IProdItem[];


    useEffect(()=>{
        if(production){
            setData({...production});
            setProditems(savedProditems);
             const formattedIngredients: IIngredient[] = production?.ingredients?.map((ing) => ({
                materialId: (ing.materialId as IRMaterial)._id,
                qUsed: ing.quantity,
            }));

            // console.log('Ingrediets: ', formattedIngredients)
            setIngredients(formattedIngredients);

            // Extract all raw materials directly
            const mats = production.ingredients.map(
                (ing) => ing.materialId as IRMaterial
            );

            setRawMaterials(mats);
            setOldRawMaterials(mats);
        }
    }, [production])

    useEffect(() => {
        const price = rawMaterials.reduce((sum, material) => {
            const ingredient = ingredients.find(ing => ing.materialId === material._id);
            const qUsed = ingredient?.qUsed || 0;
            return sum + (material.unitPrice * qUsed);
        }, 0);
        setTotalPrice(price);
    }, [rawMaterials, ingredients]);

   useEffect(() => {
        const prod = proditems.reduce((sum, item) => {
            return sum + (item?.price || 0);
        }, 0);
        setTotalProd(prod);
    }, [proditems]);

    // console.log('Total Price: ', totalPrice);
    useEffect(() => {
        setProductionCost(totalPrice + totalProd);
    }, [totalPrice, totalProd]);
 
    const onchangeProdCost = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target;
        setProductionCost(Number(value));
    }

    // alert(totalPrice + totalProd);

    useEffect(() => {
        if (rawMaterials.length === 0) return;
        const validIds = new Set(rawMaterials.map(rm => rm._id));
        
        const extraCost = production?.extraCost || 0;
        setIngredients(prev => prev.filter(ing => validIds.has(ing.materialId)));
        setData(pre=>({
            ...pre,
            productionCost: productionCost + extraCost
        }));
    }, [rawMaterials, totalPrice, totalPrice, totalProd]);

   
    const onChangeInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {id, value} = e.target;
        const qty = parseInt(value, 10) || 0;
        setIngredients(pre=>{
            const existing = pre.find(ing=>ing.materialId === id);
            if(existing){
                return pre.map(ing=>ing.materialId === id ? {...ing, qUsed: qty} : ing);
            }else{
                return [...pre, {materialId:id, qUsed: qty}];
            }
        })
    }

  const handleClose = ()=>{
    setOpenNew(false);
    setOpenItem(false);
  }

 const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
         e.preventDefault();
         setLoading(true);
         
         try {
             const prodData:Partial<IProduction> = {
                 ...data,
                 status: production?.status === 'New' ? 'New' : production?.status === 'Completed' ? 'Completed' : 'In Progress',
                 ingredients: ingredients.map(ing=>({
                     materialId: ing.materialId,
                     quantity: ing.qUsed
                 })),
                 proditems: proditems?.map(item=>item._id),
                 inputQuantity: rawMaterials?.length,
             }
             
           const res = await updateProductionIngredients(prodData);
           enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
           if(!res.error){
               formRef.current?.reset();
               handleClose();
            //    const payload = res.payload as IProduction;
               window.location.reload();
           }
         } catch (error) {
           console.log(error);
           enqueueSnackbar('Error occured while starting a production', {variant:'error'});
         }finally{
           setLoading(false);
         }
     }

     const getQuantity = (material:IRMaterial)=>{
         const ingredient = ingredients.find(ing => ing.materialId === material._id);
        //  console.log('Ingredient: ', ingredient)
         return ingredient?.qUsed || 0;
     }

    //  console.log('Raw Materials: ', ingredients)

  return (
    <ModalContainer  open={openNew || openItem} handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] max-h-[95%]">
            <form ref={formRef} onSubmit={ handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Edit production data</span>
                    <span className="greyText" >You cannot edit the production after submitting for approval.</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-col gap-4 w-full">
                            {
                               openNew &&
                                <>
                                    <GenericLabel
                                        label="Pick a batch to select raw materials"
                                        input={<SearchSelectBatches type="Raw Material" setSelect={setProductBatchId} />}
                                    />
                                    
                                    <GenericLabel
                                        label="Select raw materials"
                                        input={<SearchSelectAvMultipleRMaterials value={oldRawMaterials} setSelection={setRawMaterials} batchId={productBatchId} />}
                                    />

                                    {
                                        rawMaterials.length > 0 && 
                                        <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                                            <span className="subtitle text-gray-500 gap-2" >Raw Materials</span>
                                            <div className="flex flex-row flex-wrap items-center gap-2">
                                                {
                                                    rawMaterials.map((material, index)=>{
                                                        const qty = getQuantity(material);
                                                        return (
                                                            <RMQSelector key={index} material={material} inputId={material?._id} onChangeInput={onChangeInput} name={material?.materialName} quantity={qty} />
                                                        )
                                                    }
                                                    )
                                                }
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                            {
                                openItem &&
                                <GenericLabel
                                    label="Add production items"
                                    input={<SearchSelectMultipleProdItems value={proditems} setSelection={setProditems} />}
                                />
                            }
                            <InputWithLabel value={productionCost} onChange={onchangeProdCost} name="productionCost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={`Production cost ${currency?.symbol}`} className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
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

export default ProductionContentModal