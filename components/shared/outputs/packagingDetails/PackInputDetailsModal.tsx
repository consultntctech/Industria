import { FaChevronUp } from "react-icons/fa"
import ModalContainer from "../ModalContainer"
import { IoIosClose } from "react-icons/io"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import InputWithLabel from "../../inputs/InputWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../../inputs/GenericLabel";
import SearchSelectUsers from "../../inputs/dropdowns/SearchSelectUsers";
import { IBatch } from "@/lib/models/batch.model";
import { IUser } from "@/lib/models/user.model";
import { IGoodsPopulate, IPackage } from "@/lib/models/package.model";
import { useRouter } from "next/navigation";
import SearchSelectPackagingType from "../../inputs/dropdowns/SearchSelectPackagingType";
import { PACKAGING_PROCESSES, TPackagingProcess } from "@/Data/PackagingProcesses";
import SearchSelectStorages from "../../inputs/dropdowns/SearchSelectStorages";
import TextAreaWithLabel from "../../inputs/TextAreaWithLabel";
import { IStorage } from "@/lib/models/storage.model";
import { IGood } from "@/lib/models/good.model";
import { updatePackage } from "@/lib/actions/package.action";
import '@/styles/customscroll.css'
import { IProduct } from "@/lib/models/product.model";
import { IQGSelector } from "@/types/Types";
import SearchSelectProducts from "../../inputs/dropdowns/SearchSelectProducts";
import SearchSelectAvMultipleGoods from "../../inputs/dropdowns/SearchSelectAvMultipleGoods";
import GoodsQSelector from "@/components/misc/GoodsQSelector";

type PackInputDetailsModalProps = {
    openNew:boolean;
    setOpenNew: (open:boolean)=>void;
    pack:IPackage | null;
}

const PackInputDetailsModal = ({pack, openNew, setOpenNew}:PackInputDetailsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [packagingType, setPackagingType] = useState<TPackagingProcess | null>(null);
    // const [good, setGood] = useState<IGood | null>(null);
    // const [useProdBatch, setUseProdBatch] = useState(true);
    const [batch, setBatch] = useState<string>('');
    const [supervisor, setSupervisor] = useState<IUser | null>(null);
    const [storage, setStorage] = useState<string>('');
    const [data, setData] = useState<Partial<IPackage>>({});
    const [typed, setTyped] = useState<TPackagingProcess | null>(null);
    const [product, setProduct] = useState<IProduct | null>(null);
    const [newGoods, setNewGoods] = useState<IGood[]>([]);
    const [goodItems, setGoodItems] = useState<IQGSelector[]>([]);

    const router = useRouter();
    

    const batched = pack?.batch as IBatch;
    const supervisord = pack?.supervisor as IUser;
    const storaged = pack?.storage as IStorage;
    const goods = pack?.goods as IGoodsPopulate[];
    const savedGoods = goods.map(g=> g.goodId as IGood);
    const gooded = savedGoods[0];
    const savedProduct = gooded?.product as IProduct;
    const savedGoodItems = goods.map(g=> ({goodId: (g.goodId as IGood)._id as string, quantity: g.quantity}));
    
    // console.log('Good Batch: ', goodBatch)
    // console.log('Gooded: ', gooded)
        
    
        // console.log('packagingMaterial', currentPackage?.packagingMaterial)
    const quantity = goodItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const accepted = quantity - Number(data.rejected || 0);

    useEffect(() => {
        if(pack){
            setData({...pack});
            setTyped({label:pack?.packagingType, inputValue:pack?.packagingType});
            setPackagingType({label:pack?.packagingType, inputValue:pack?.packagingType});
            setSupervisor(supervisord);
            setStorage(storaged?._id);
            setNewGoods(savedGoods);
            setProduct(savedProduct)
            setBatch(batched?._id);
            setGoodItems(savedGoodItems);
        }
    }, [pack]);
    
    useEffect(() => {
        const validIds = new Set(newGoods.map(g => g._id));
        setGoodItems(prev => prev.filter(ing => validIds.has(ing.goodId)));
        setData(pre=>({...pre}));
    }, [newGoods])
    

    
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
    
        try {
            const formData:Partial<IPackage> = {
                ...data,
                approvalStatus: 'Pending',
                goods: goodItems,
                supervisor: supervisor?._id,
                batch,
                useProdBatch:false,
                accepted,
                packagingType: packagingType?.label,
                storage,
            }
            const res = await updatePackage(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                router.refresh();
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured during packaging', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }
        
         
           
            
    //    console.log('Typed: ', typed)
    
     
    // if(!pack || PACKAGING_PROCESSES.length === 0) return null;
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

    const getQuantity = (item:IGood)=>{
        const qtyObj = savedGoodItems.find(gi=> gi.goodId === item._id);
        return qtyObj ? qtyObj.quantity : 0; 
    }

  return (
     <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
      <div className={`flex flex-center h-[100vh] w-[90%] md:w-[50%]`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom h-[90%] p-4 flex-col gap-8 w-full relative" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Edit primary details</span>
                    <span className="greyText" >Edit the primary details of the package</span>
                </div>
        
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={pack?.name} onChange={onChange} name="name" required placeholder="eg. Coffee Packaging" label="Name" className="w-full" />
                        <GenericLabel
                            label="Packaging type"
                            input={<SearchSelectPackagingType dfValue={typed} list={PACKAGING_PROCESSES} caption="Packaging Process" value={packagingType} setValue={setPackagingType} />}
                        />
                        
                        <GenericLabel 
                            label='Select quality status'
                            input={
                                <select  defaultValue={pack?.qStatus} onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                                <option  value="Pass">Pass</option>
                                <option value="Partial">Partial</option>
                                <option value="Fail">Fail</option>
                            </select>
                            }
                        />
                        <GenericLabel
                            label="Supervisor"
                            input={<SearchSelectUsers value={supervisord} required setSelect={setSupervisor} />}
                        />
                         <GenericLabel
                            label="Product to package"
                            input={<SearchSelectProducts value={savedProduct} type='Finished Good' required setSelect={setProduct} />}
                        />
                        <GenericLabel label='Finished goods'
                            input={<SearchSelectAvMultipleGoods df={savedGoods} productId={product?._id as string} setSelection={setNewGoods} />}
                        />
                        {
                            newGoods.length > 0 &&
                            <div className="flex flex-col w-full border border-gray-200 p-2  gap-2 rounded-xl">
                                <span className="subtitle text-gray-500 gap-2" >Goods</span>
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    {
                                        newGoods.map((material, index)=>
                                            <GoodsQSelector key={index} item={material} quantity={getQuantity(material)} inputId={material?._id} onChangeInput={onChangeGoodsInput} name={material?.name} />
                                        )
                                    }
                                </div>
                            </div>
                        }
                        
                        {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
                        {/* <InputWithLabel value={quantity} onChange={onChange} readOnly max={ (good?.quantityLeftToPackage || 0) + (accepted||0)}   name="quantity" type="number" min={0} placeholder="enter quantity" label="Quantity to package" className="w-full" /> */}
                        <InputWithLabel defaultValue={pack?.rejected} step={0.0001} onChange={onChange} name="rejected" type="number" readOnly   label="No. of goods rejected" className="w-full" />
                        {
                            (newGoods.length > 0) && quantity > 0 &&
                            <InputWithLabel value={accepted} readOnly onChange={onChange} name="accepted" type="number"  label="No. of goods for sales" className="w-full" />
                        }
                    </div>

                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <InputWithLabel defaultValue={pack?.weight} onChange={onChange}  name="weight" required  placeholder="eg. 25kg" label="Package weight" className="w-full" />
                            <GenericLabel
                                label="Select location"
                                input={<SearchSelectStorages value={storaged} setSelect={setStorage} />}
                            /> 
                            
                        

                            
                            <TextAreaWithLabel defaultValue={pack?.description}  name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                    
                    </div>
                </div>
        
                <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                    <IoIosClose className="text-red-700" />
                </div>
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                    <FaChevronUp />
                </div>
            </form>
        }
      </div>
    </ModalContainer>
  )
}

export default PackInputDetailsModal