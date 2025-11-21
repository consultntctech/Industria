import { FaChevronUp } from "react-icons/fa"
import ModalContainer from "../ModalContainer"
import { IoIosClose } from "react-icons/io"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import InputWithLabel from "../../inputs/InputWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../../inputs/GenericLabel";
import SearchSelectBatches from "../../inputs/dropdowns/SearchSelectBatches";
import SearchSelectUsers from "../../inputs/dropdowns/SearchSelectUsers";
import { IBatch } from "@/lib/models/batch.model";
import { IUser } from "@/lib/models/user.model";
import { IPackage } from "@/lib/models/package.model";
import { useRouter } from "next/navigation";
import SearchSelectPackagingType from "../../inputs/dropdowns/SearchSelectPackagingType";
import { PACKAGING_PROCESSES, TPackagingProcess } from "@/Data/PackagingProcesses";
import SearchSelectGoods from "../../inputs/dropdowns/SearchSelectGoods";
import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import TextInput from "../../inputs/TextInput";
import SearchSelectStorages from "../../inputs/dropdowns/SearchSelectStorages";
import TextAreaWithLabel from "../../inputs/TextAreaWithLabel";
import { IStorage } from "@/lib/models/storage.model";
import { IGood } from "@/lib/models/good.model";
import { updatePackage } from "@/lib/actions/package.action";
import '@/styles/customscroll.css'

type PackInputDetailsModalProps = {
    openNew:boolean;
    setOpenNew: (open:boolean)=>void;
    pack:IPackage | null;
}

const PackInputDetailsModal = ({pack, openNew, setOpenNew}:PackInputDetailsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [packagingType, setPackagingType] = useState<TPackagingProcess | null>(null);
    const [good, setGood] = useState<IGood | null>(null);
    const [useProdBatch, setUseProdBatch] = useState(true);
    const [batch, setBatch] = useState<string>('');
    const [supervisor, setSupervisor] = useState<string>('');
    const [storage, setStorage] = useState<string>('');
    const [data, setData] = useState<Partial<IPackage>>({});
    const [accepted, setAccepted] = useState<number>(0);
    const [typed, setTyped] = useState<TPackagingProcess | null>(null);

    const router = useRouter();
    

    const goodBatch = good?.batch as IBatch;
    const batched = pack?.batch as IBatch;
    const supervisord = pack?.supervisor as IUser;
    const storaged = pack?.storage as IStorage;
    const gooded = pack?.good as IGood;
    
    // console.log('Good Batch: ', goodBatch)
        
    
        // console.log('packagingMaterial', currentPackage?.packagingMaterial)
    useEffect(() => {
        if(pack){
            setData({...pack});
            setUseProdBatch(pack?.useProdBatch);
            setTyped({label:pack?.packagingType, inputValue:pack?.packagingType});
            setPackagingType({label:pack?.packagingType, inputValue:pack?.packagingType});
            setSupervisor(supervisord?._id);
            setStorage(storaged?._id);
            setGood(gooded);
        }
    }, [pack]);
    
    useEffect(() => {
        if(good && data.quantity){
            const value = data.quantity - Number(data.rejected || 0);
            setAccepted(value);
        }
    }, [good, data.quantity, data?.rejected])
    

    
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
                good: good?._id,
                supervisor,
                batch: useProdBatch ? goodBatch?._id : batch,
                useProdBatch,
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
                            label="Goods"
                            input={<SearchSelectGoods value={gooded} required setSelect={setGood} />}
                        />
                        {
                            good &&
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
                                        <SearchSelectBatches value={batched} type="Finished Good" required={true} setSelect={setBatch} />
                                    }
                                />
                            </>
                        }
                        
                        {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
                        <InputWithLabel defaultValue={pack?.quantity} onChange={onChange} max={ (good?.quantityLeftToPackage || 0) + (pack?.accepted||0)}   name="quantity" required type="number" min={0} placeholder="enter quantity" label="Quantity to package" className="w-full" />
                        <InputWithLabel defaultValue={pack?.rejected} onChange={onChange} name="rejected" type="number" max={good?.quantityLeftToPackage}   label="No. of goods rejected" className="w-full" />
                        {
                            good && Number(data.quantity || 0) > 0 &&
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