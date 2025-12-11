'use client';
import { PACKAGING_PROCESSES, TPackagingProcess } from '@/Data/PackagingProcesses';
import { useAuth } from '@/hooks/useAuth';
import { createPackage } from '@/lib/actions/package.action';
import { createPackApproval } from '@/lib/actions/packapproval.action';
import { IBatch } from '@/lib/models/batch.model';
import { IGood } from '@/lib/models/good.model';
import { IGoodsPopulate, IPackage } from '@/lib/models/package.model';
import { IPackApproval } from '@/lib/models/packapproval.model';
import { IProdItem } from '@/lib/models/proditem.model';
import { IQGSelector, IQSelector } from '@/types/Types';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import GenericLabel from '../shared/inputs/GenericLabel';
import SearchSelectPackagingType from '../shared/inputs/dropdowns/SearchSelectPackagingType';
import SearchSelectAvMultipleProdItems from '../shared/inputs/dropdowns/SearchSelectAvMultipleProdItems';
import ProdItemSelector from '../misc/ProdItemSelector';
import SearchSelectUsers from '../shared/inputs/dropdowns/SearchSelectUsers';
// import CustomCheckV2 from '../misc/CustomCheckV2';
// import TextInput from '../shared/inputs/TextInput';
import SearchSelectBatches from '../shared/inputs/dropdowns/SearchSelectBatches';
import SearchSelectStorages from '../shared/inputs/dropdowns/SearchSelectStorages';
import TextAreaWithLabel from '../shared/inputs/TextAreaWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IProduction } from '@/lib/models/production.model';
import { IProduct } from '@/lib/models/product.model';
import { ILineItem } from '@/lib/models/lineitem.model';
import { createLineItems } from '@/lib/actions/lineitem.action';
import SearchSelectProducts from '../shared/inputs/dropdowns/SearchSelectProducts';
import GoodsQSelector from '../misc/GoodsQSelector';
import SearchSelectAvMultipleGoods from '../shared/inputs/dropdowns/SearchSelectAvMultipleGoods';
import { IUser } from '@/lib/models/user.model';

const NewPackageComp = () => {
    const [loading, setLoading] = useState(false);
    const [packagingType, setPackagingType] = useState<TPackagingProcess | null>(null);
    const [packagingMaterial, setPackagingMaterial] = useState<IProdItem[]>([]);
    // const [good, setGood] = useState<IGood | null>(null);
    // const [useProdBatch, setUseProdBatch] = useState(true);
    const [batch, setBatch] = useState<string>('');
    const [supervisor, setSupervisor] = useState<IUser | null>(null);
    const [storage, setStorage] = useState<string>('');
    const [cost, setCost] = useState<number>(0);
    const [data, setData] = useState<Partial<IPackage>>({});
    // const [accepted, setAccepted] = useState<number>(0);
    const [packItems, setPackItems] = useState<IQSelector[]>([]);
    const [product, setProduct] = useState<IProduct | null>(null);
    const [goods, setGoods] = useState<IGood[]>([]);
    const [goodItems, setGoodItems] = useState<IQGSelector[]>([]);

    const {user} = useAuth();
    const router = useRouter();
    const {currency} = useCurrencyConfig();

    // const goodBatch = good?.batch as IBatch;
    

    // console.log('packagingMaterial', currentPackage?.packagingMaterial)
    
    const quantity = goodItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const accepted = quantity - Number(data.rejected || 0);
    
    
       
    useEffect(() => {
        const price = packagingMaterial.reduce((sum, material) => {
            const item = packItems.find(ing => ing.materialId === material._id);
            const qUsed = item?.quantity || 0;
            return sum + (material.unitPrice * qUsed);
        }, 0);
        setCost(price);
    }, [packagingMaterial.length, packItems.length]);


    useEffect(() => {
        const validIds = new Set(packagingMaterial.map(rm => rm._id));
        setPackItems(prev => prev.filter(ing => validIds.has(ing.materialId)));
        setData(pre=>({...pre, cost}));
    }, [packagingMaterial,  cost]);
    

    useEffect(() => {
        const validIds = new Set(goods.map(g => g._id));
        setGoodItems(prev => prev.filter(ing => validIds.has(ing.goodId)));
        setData(pre=>({...pre, cost}));
    }, [goods])
    
    
    
    const formRef = useRef<HTMLFormElement>(null);
        const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
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

    
    const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
    
        // console.log('Goods: ', goodItems)
        try {
            const formData:Partial<IPackage> = {
                ...data,
                quantity: accepted,
                org: user?.org,
                createdBy: user?._id,
                packagingMaterial: packItems,
                goods: goodItems,
                supervisor: supervisor?._id,
                // batch: useProdBatch ? goodBatch?._id : batch,
                batch,
                useProdBatch: false,
                accepted,
                packagingType: packagingType?.label,
                storage,
                cost
            }
            const res = await createPackage(formData);
            // enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                const packed = res.payload as IPackage;
                const packedGoods = packed.goods as IGoodsPopulate[];
                const gd = packedGoods.map(g=> g.goodId as IGood)[0];
                const pd = gd?.production as IProduction;
                const prod = pd?.productToProduce as IProduct;
                const bt = gd?.batch as IBatch;

                
                const lnData: Partial<ILineItem> = {
                    product: prod._id,
                    name: prod?.name,
                    batch: bt._id,
                    good: gd._id,
                    package: packed._id,
                    status: 'Pending',
                    createdBy: user?._id,
                    org: user?.org,
                }
                let LnArray: Partial<ILineItem>[] = [];
                const appData:Partial<IPackApproval> = {
                    package: packed._id,
                    createdBy: user?._id,
                    status: 'Pending',
                    name: data.name,
                    org: user?.org,
                }
                const appRes = await createPackApproval(appData);
                if(!appRes.error){
                    
                    for(let i = 0; i < packed?.accepted; i++){
                        LnArray.push(lnData);
                    }
                    const lnRes = await createLineItems(LnArray);
                    if(!lnRes.error){
                        formRef.current?.reset();
                        enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
                        router.push(`/dashboard/distribution/packaging/${packed?._id}`)
                    }
                }
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured during packaging', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }
    
    
       
        
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

    const onChangeGoodsInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {id, value} = e.target;
        const qty = parseInt(value, 10) || 0;
        setGoodItems(pre=>{
            const existing = pre.find(ing=>ing.goodId === id);
            if(existing){
                return pre.map(ing=>ing.goodId === id ? {...ing, quantity: qty} : ing);
            }else{
                return [...pre, {goodId:id, quantity: qty}];
            }
        })
    }

    const changeCost = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target;
        setCost(Number(value));
    }


    

  return (
    <div className={`flex p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={ handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
            <span className="title" >Add new package</span>
            <span className="greyText" >Packaged products will be available for sales and orders</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex gap-4 flex-col w-full">
            <InputWithLabel  onChange={onChange} name="name" required placeholder="eg. Coffee Packaging" label="Name" className="w-full" />
                <GenericLabel
                    label="Packaging type"
                    input={<SearchSelectPackagingType list={PACKAGING_PROCESSES} caption="Packaging Process" value={packagingType} setValue={setPackagingType} />}
                />
                
                <GenericLabel 
                    label='Select quality status'
                    input={
                        <select   onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                        <option  value="Pass">Pass</option>
                        <option value="Partial">Partial</option>
                        <option value="Fail">Fail</option>
                    </select>
                    }
                />
                <GenericLabel
                    label="Supervisor"
                    input={<SearchSelectUsers required setSelect={setSupervisor} />}
                />
                <GenericLabel
                    label="Product to package"
                    input={<SearchSelectProducts type='Finished Good' required setSelect={setProduct} />}
                />
                <GenericLabel label='Finished goods'
                    input={<SearchSelectAvMultipleGoods productId={product?._id as string} setSelection={setGoods} />}
                />
                {
                    goods.length > 0 &&
                    <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                        <span className="subtitle text-gray-500 gap-2" >Goods</span>
                        <div className="flex flex-row flex-wrap items-center gap-2">
                            {
                                goods.map((material, index)=>
                                    <GoodsQSelector key={index} item={material} inputId={material?._id} onChangeInput={onChangeGoodsInput} name={material?.name} />
                                )
                            }
                        </div>
                    </div>
                }

                {/* <GenericLabel
                    label="Goods"
                    input={<SearchSelectGoods required setSelect={setGood} />}
                /> */}
                {/* {
                    goods.length > 0 &&
                    <>
                        <div className="flex flex-row items-center gap-4">
                            <span className="smallText">Inherit batch from production</span>
                            <CustomCheckV2 checked={useProdBatch} setChecked={setUseProdBatch} />
                        </div>
                        <GenericLabel
                            label={`${!useProdBatch ? 'Select batch' : 'Production batch'}`}
                            input={
                                useProdBatch ?
                                <TextInput readOnly value={goodBatch?.code} />
                                :
                                <SearchSelectBatches  type="Packaging" required={true} setSelect={setBatch} />
                            }
                        />
                    </>
                } */}
                <GenericLabel
                    label={'Select package batch'}
                    input={
                        <SearchSelectBatches  type="Packaging" required={true} setSelect={setBatch} />
                    }
                />
                
                {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
                {/* <InputWithLabel onChange={onChange} max={ good?.quantityLeftToPackage}   name="quantity" required type="number" min={0} placeholder="enter quantity" label="Quantity to package" className="w-full" /> */}
                <InputWithLabel onChange={onChange} step={0.0001} name="rejected" type="number" max={quantity}   label="No. of goods rejected" className="w-full" />
                {
                    goods && (quantity > 0) &&
                    <InputWithLabel value={accepted} readOnly onChange={onChange} name="accepted" type="number"  label="No. of goods for sales" className="w-full" />
                }
            </div>

            <div className="flex gap-4 flex-col w-full justify-between">
                <div className="flex flex-col gap-4 w-full">
                    <InputWithLabel onChange={onChange} step={0.0001}  name="weight" required  placeholder="eg. 25kg" label="Package weight" className="w-full" />
                    <GenericLabel
                        label="Select location"
                        input={<SearchSelectStorages  setSelect={setStorage} />}
                    /> 
                    
                    <GenericLabel
                        label="Packaging material"
                        input={<SearchSelectAvMultipleProdItems  setSelection={setPackagingMaterial} />}
                    />

                    {
                        packagingMaterial.length > 0 &&
                        <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                            <span className="subtitle text-gray-500 gap-2" >Packaging items</span>
                            <div className="flex flex-row flex-wrap items-center gap-2">
                                {
                                    packagingMaterial.map((material, index)=>
                                        <ProdItemSelector key={index} item={material} inputId={material?._id} onChangeInput={onChangeInput} name={material?.materialName} />
                                    )
                                }
                            </div>
                        </div>
                    }
                    <InputWithLabel onChange={changeCost}  name="cost" type="number" value={cost} label={currency ? `Packaging cost (${currency.symbol})` : 'Packaging cost'} className="w-full" />
                    <TextAreaWithLabel   name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                </div>
                <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
               
            </div>
        </div>
        
      </form>
    </div>
  )
}

export default NewPackageComp