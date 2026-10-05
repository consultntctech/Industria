import { IProduction } from '@/lib/models/production.model';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer';
import { IoIosClose } from 'react-icons/io';
import { FaChevronUp } from 'react-icons/fa';
import GenericLabel from '../../inputs/GenericLabel';
import SearchSelectBatches from '../../inputs/dropdowns/SearchSelectBatches';
// import SearchSelectMultipleProdItems from '../../inputs/dropdowns/SearchSelectMultipleProdItems';
// import InputWithLabel from '../../inputs/InputWithLabel';
import PrimaryButton from '../../buttons/PrimaryButton';
// import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
// import { IProdItem } from '@/lib/models/proditem.model';
import { IIngredient } from '@/types/Types';
import {  updateProductionGoods } from '@/lib/actions/production.action';
import { enqueueSnackbar } from 'notistack';
import { IBatch } from '@/lib/models/batch.model';
import '@/styles/customscroll.css'
import { useCanUser } from '@/hooks/useAuth';
import { IGood } from '@/lib/models/good.model';
import SearchSelectMultipleGoodsWithRM from '../../inputs/dropdowns/SearchSelectMultipleGoodsWithRM';
import GoodQSelector from '@/components/misc/GoodQSelector';

type ProductionGoodsModalProps = {
  openGoods:boolean;
  setOpenGoods: Dispatch<SetStateAction<boolean>>;
//   setOpenItem: Dispatch<SetStateAction<boolean>>;
//   openItem: boolean;
  production: IProduction | null;
}

const ProductionGoodsModal = ({openGoods, setOpenGoods, production}:ProductionGoodsModalProps) => {
  const [loading, setLoading] = React.useState(false);
//   const [data, setData] = React.useState<Partial<IProduction>>({});
  const [goods, setGoods] = useState<IGood[]>([]);
  const [oldGoods, setOldGoods] = useState<IGood[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
//   const [proditems, setProditems] = useState<IProdItem[]>([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [totalProd, setTotalProd] = useState(0);
//   const [productionCost, setProductionCost] = useState(0);
  const [productBatchId, setProductBatchId] = useState<string>('');

  const isEditor = useCanUser('8', 'UPDATE');
  const batch = production?.batch as IBatch;

  const formRef = React.useRef<HTMLFormElement>(null);

    
    // const savedProditems = production?.proditems as unknown as IProdItem[];


    useEffect(()=>{
        if(production){
            // setData({...production});
             const formattedIngredients: IIngredient[] = production?.goods?.map((ing) => ({
                materialId: (ing.materialId as IGood)._id,
                qUsed: ing.quantity,
                weight: ing.weight || 0,
            }));

            // console.log('Ingrediets: ', formattedIngredients)
            setIngredients(formattedIngredients);

            // Extract all raw materials directly
            const mats = production.goods.map(
                (ing) => ing.materialId as IGood
            );

            setGoods(mats);
            setOldGoods(mats);
            // setProductionCost(production.productionCost || 0);
        }
    }, [production])



    useEffect(() => {
        const validIds = new Set(goods.map(rm => rm._id));
        setIngredients(prev => prev.filter(ing => validIds.has(ing.materialId)));
    }, [goods]);

    const onChangeInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {value, name} = e.target;
        
        if (name.startsWith('qty-')) {
            const materialId = name.replace('qty-', '');
            const qty = parseInt(value, 10) || 0;
            setIngredients(pre=>{
                const existing = pre.find(ing=>ing.materialId === materialId);
                if(existing){
                    return pre.map(ing=>ing.materialId === materialId ? {...ing, qUsed: qty} : ing);
                }else{
                    return [...pre, {materialId, qUsed: qty, weight: 0}];
                }
            })
        } else if (name.startsWith('wt-')) {
            const materialId = name.replace('wt-', '');
            const weightVal = parseFloat(value) || 0;
            setIngredients(pre=>{
                const existing = pre.find(ing=>ing.materialId === materialId);
                if(existing){
                    return pre.map(ing=>ing.materialId === materialId ? {...ing, weight: weightVal} : ing);
                }else{
                    return [...pre, {materialId, qUsed: 0, weight: weightVal}];
                }
            })
        }
    }

    const selectedIds = new Set(goods.map(g => g._id));
    const selectedIngredients = ingredients.filter(ing => selectedIds.has(ing.materialId));

    const rawQuantity = production?.ingredients?.reduce((sum, ing) => sum + (ing.quantity || 0), 0) || 0;
    const finishedQuantity = selectedIngredients.reduce((sum, ing) => sum + (ing.qUsed || 0), 0);
    const inputQuantity = rawQuantity + finishedQuantity;

  const handleClose = ()=>{
    setOpenGoods(false);
    // setOpenItem(false);
  }

 const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
         e.preventDefault();
         setLoading(true);
         
         try {
              const prodData:Partial<IProduction> = {
                  ...production,
                  goods: selectedIngredients.map(ing=>({
                      materialId: ing.materialId,
                      quantity: ing.qUsed,
                      weight: ing.weight
                  })),
                  inputQuantity
              }
            //  console.log('Prod Data', prodData)
           const res = await updateProductionGoods(prodData);
           enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
           if(!res.error){
               formRef.current?.reset();
               handleClose();
            //    const payload = res.payload as IProduction;
               window.location.reload();
           }
         } catch (error) {
           console.log(error);
           enqueueSnackbar('Error occured while updating production goods', {variant:'error'});
         }finally{
           setLoading(false);
         }
     }

     const getQuantity = (material:IGood)=>{
         const ingredient = ingredients.find(ing => ing.materialId === material._id);
        //  console.log('Ingredient: ', ingredient')
         return ingredient?.qUsed || 0;
     }

     const getWeight = (material:IGood)=>{
         const ingredient = ingredients.find(ing => ing.materialId === material._id);
        //  console.log('Ingredient: ', ingredient')
         return ingredient?.weight || 0;
     }

    //  console.log('Raw Materials: ', ingredients)

  return (
    <ModalContainer  open={openGoods} handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] h-[90%] items-center">
            <form ref={formRef} onSubmit={ handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Edit production data</span>
                    <span className="greyText" >You cannot edit the production after submitting for approval.</span>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-col gap-4 w-full">
                            {
                               openGoods &&
                                <>
                                    <GenericLabel
                                        label="Pick a batch to select processed goods"
                                        input={<SearchSelectBatches value={batch} type="Finished Good" setSelect={setProductBatchId} />}
                                    />
                                    
                                    <GenericLabel
                                        label="Select processed goods"
                                        input={<SearchSelectMultipleGoodsWithRM value={oldGoods} setSelection={setGoods} batchId={productBatchId} />}
                                    />

                                    {
                                        goods.length > 0 && 
                                        <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                                            <span className="subtitle text-gray-500 gap-2" >Processed Goods</span>
                                            <div className="flex flex-row flex-wrap items-center gap-2">
                                                {
                                                    goods.map((material, index)=>{
                                                        const qty = getQuantity(material);
                                                        const wt = getWeight(material);
                                                        return (
                                                            <GoodQSelector key={index} weight={wt} material={material} inputId={material?._id} onChangeInput={onChangeInput} name={material?.serialName} quantity={qty} />
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
                                    label="Add production items"
                                    input={<SearchSelectMultipleProdItems value={proditems} setSelection={setProditems} />}
                                />
                            } */}
                            {/* <InputWithLabel value={productionCost} onChange={onchangeProdCost} name="productionCost" type="number" min={1} placeholder={`${currency?.symbol}1000`} label={`Production cost ${currency?.symbol}`} className="w-full" /> */}
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

export default ProductionGoodsModal