import { useAuth } from "@/hooks/useAuth";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction,  useEffect, useRef, useState } from "react";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectPackagingType from "../shared/inputs/dropdowns/SearchSelectPackagingType";
import { TPackagingProcess } from "@/Data/PackagingProcesses";
import SearchSelectMultipleProdItems from "../shared/inputs/dropdowns/SearchSelectMultipleProdItems";
import { IProdItem } from "@/lib/models/proditem.model";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import CustomCheckV2 from "../misc/CustomCheckV2";
import SearchSelectBatches from "../shared/inputs/dropdowns/SearchSelectBatches";
import TextInput from "../shared/inputs/TextInput";
import { IBatch } from "@/lib/models/batch.model";
import { IGood } from "@/lib/models/good.model";
import SearchSelectGoods from "../shared/inputs/dropdowns/SearchSelectGoods";
import SearchSelectUsers from "../shared/inputs/dropdowns/SearchSelectUsers";
import SearchSelectStorages from "../shared/inputs/dropdowns/SearchSelectStorages";
import { IPackage } from "@/lib/models/package.model";
import { createPackage,  updatePackage } from "@/lib/actions/package.action";
import { enqueueSnackbar } from "notistack";
import { useFetchPackages } from "@/hooks/fetch/useFetchPackages";
import { IStorage } from "@/lib/models/storage.model";
import { IUser } from "@/lib/models/user.model";
import { createPackApproval } from "@/lib/actions/packapproval.action";
import { IPackApproval } from "@/lib/models/packapproval.model";

type PackagingCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentPackage: IPackage | null;
  setCurrentPackage: Dispatch<SetStateAction<IPackage | null>>;
}

const PackagingComp = ({openNew, setOpenNew, currentPackage, setCurrentPackage}:PackagingCompProps) => {
    const [loading, setLoading] = useState(false);
    const [packagingType, setPackagingType] = useState<TPackagingProcess | null>(null);
    const [packagingMaterial, setPackagingMaterial] = useState<IProdItem[]>([]);
    const [good, setGood] = useState<IGood | null>(null);
    const [useProdBatch, setUseProdBatch] = useState(true);
    const [batch, setBatch] = useState<string>('');
    const [supervisor, setSupervisor] = useState<string>('');
    const [storage, setStorage] = useState<string>('');
    const [cost, setCost] = useState<number>(0);
    const [data, setData] = useState<Partial<IPackage>>({});
    const [accepted, setAccepted] = useState<number>(0);

    const {user} = useAuth();
    const {refetch} = useFetchPackages();
    const goodBatch = good?.batch as IBatch;
    const materials = currentPackage?.packagingMaterial as IProdItem[];
    const savedBatch = currentPackage?.batch as IBatch;
    const savedStorage = currentPackage?.storage as IStorage;
    const savedSupervisor = currentPackage?.supervisor as IUser;
    const savedGood = currentPackage?.good as IGood;


    useEffect(() => {
        if(packagingMaterial.length > 0){
            const price = packagingMaterial.reduce((sum, material) => {
                const materialPrice = material?.price  || 0;
                return sum + materialPrice;
            }, 0);
            setCost(price);
        }else{
            setCost(0);
        }
    }, [packagingMaterial])

    useEffect(() => {
        if(good && data.quantity){
            const value = data.quantity - Number(data.rejected || 0);
            setAccepted(value);
        }
    }, [good, data.quantity, data?.rejected])


    useEffect(() => {
        if(currentPackage){
            setData({...currentPackage});
            setPackagingMaterial(materials)
            setPackagingType({label:currentPackage?.packagingType});
            setBatch(savedBatch._id);
            setStorage(savedStorage._id);
            setSupervisor(savedSupervisor._id);
            setGood(savedGood);
            setUseProdBatch(currentPackage?.useProdBatch);
            // setAccepted(currentPackage?.accepted);
            setCost(currentPackage?.cost);
        }else{
            setData({});// Reset form data when currentUser is null
        }
    }, [currentPackage])

    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
      }

      const handleClose = ()=>{
        setOpenNew(false);
        setCurrentPackage(null);
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
            org: user?.org,
            createdBy: user?._id,
            packagingMaterial: packagingMaterial?.map(item=>item._id),
            good: good?._id,
            supervisor,
            batch: useProdBatch ? goodBatch?._id : batch,
            useProdBatch,
            accepted,
            packagingType: packagingType?.label,
            storage,
            cost
          }
          const res = await createPackage(formData);
          if(!res.error){
            formRef.current?.reset();
            const packed = res.payload as IPackage;
            const appData:Partial<IPackApproval> = {
                package: packed._id,
                createdBy: user?._id,
                status: 'Pending',
                name: data.name,
                org: user?.org,
              }
              const appRes = await createPackApproval(appData);
              if(!appRes.error){
                enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
                handleClose();
                refetch();
              }
      
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured during packaging', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const materialIds = packagingMaterial.map(item=>item._id);

          const res = await updatePackage({
            ...data, 
            packagingMaterial: materialIds,
            accepted,
            good: good?._id,
            supervisor,
            batch: useProdBatch ? goodBatch?._id : batch,
            useProdBatch,
            packagingType: packagingType?.label,
            storage,
            cost,
            approvalStatus: 'Pending'
          });
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose()
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating product', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    // const handleResubmit = async()=>{
    //     setLoading(true);
    //     try {
    //       if(!currentPackage) return;
    //       const res = await resubmitPackage(currentPackage._id);
    //       if(!res.error){
    //         enqueueSnackbar('Package resubmitted successfully', {variant:'success'});
    //         refetch();
    //       }
    //     } catch (error) {
    //       console.log(error);
    //       enqueueSnackbar('Error occured while resubmitting packaging', {variant:'error'});
    //     }finally{
    //       setLoading(false);
    //     }
      
    // }

    // alert(Number(data.quantity || 0) > 0)
    // console.log('Quantity: ', accepted)
    // alert(accepted)
    // console.log('Goods Batch: ', goodBatch)

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentPackage ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentPackage ? 'Edit package' : 'Add new package'}</span>
          <span className="greyText" >Packaged products will be available for sales and orders</span>
        </div>
        {
            openNew &&
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                <InputWithLabel defaultValue={currentPackage?.name} onChange={onChange} name="name" required placeholder="eg. Coffee Packaging" label="Name" className="w-full" />
                    <GenericLabel
                        label="Packaging type"
                        input={<SearchSelectPackagingType value={packagingType} setValue={setPackagingType} />}
                    />
                    <GenericLabel
                        label="Packaging material"
                        input={<SearchSelectMultipleProdItems value={materials} setSelection={setPackagingMaterial} />}
                    />

                    <GenericLabel
                        label="Supervisor"
                        input={<SearchSelectUsers value={savedSupervisor} required={!currentPackage} setSelect={setSupervisor} />}
                    />
                    <GenericLabel
                        label="Goods"
                        input={<SearchSelectGoods value={savedGood} required={!currentPackage} setSelect={setGood} />}
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
                                    <SearchSelectBatches value={savedBatch} type="Finished Good" required={true} setSelect={setBatch} />
                                }
                            />
                        </>
                    }
                    
                    {/* <InputWithLabel onChange={onChange} name="unitCost" required type="number" min={0} placeholder="enter price" label="Unit cost" className="w-full" /> */}
                    <InputWithLabel onChange={onChange} max={good?.quantityLeftToPackage} defaultValue={currentPackage?.quantity}  name="quantity" required={!currentPackage} type="number" min={0} placeholder="enter quantity" label="Quantity to package" className="w-full" />
                    <InputWithLabel onChange={onChange} name="rejected" type="number" max={good?.quantityLeftToPackage}  defaultValue={currentPackage?.rejected ||0} label="No. of goods rejected" className="w-full" />
                    {
                        good && Number(data.quantity || 0) > 0 &&
                        <InputWithLabel value={accepted} readOnly onChange={onChange} name="accepted" type="number"  label="No. of goods for sales" className="w-full" />
                    }
                </div>

                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                    <InputWithLabel onChange={onChange} defaultValue={currentPackage?.weight} name="weight" required  placeholder="eg. 25kg" label="Package weight" className="w-full" />
                    <GenericLabel
                        label="Select location"
                        input={<SearchSelectStorages value={savedStorage} setSelect={setStorage} />}
                    /> 
                    <GenericLabel 
                        label='Select quality status'
                        input={
                            <select defaultValue={currentPackage?.qStatus}  onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                            <option  value="Pass">Pass</option>
                            <option value="Partial">Partial</option>
                            <option value="Fail">Fail</option>
                        </select>
                        }
                    />
                    <InputWithLabel onChange={(e)=>setCost(Number(e.target.value))}  name="cost" type="number" value={cost} label="Packaging cost" className="w-full" />
                    <TextAreaWithLabel defaultValue={currentPackage?.description}  name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                    </div>
                    {
                      currentPackage ?
                      <>
                      {/* {
                        currentPackage?.approvalStatus === 'Rejected' &&
                        <PrimaryButton onClick={handleResubmit} loading={loading} type="button" text={loading?"loading" : "Resubmit"} className="w-full mt-4" />
                      } */}
                      {
                        currentPackage?.approvalStatus === 'Approved' &&
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Update"} className="w-full mt-4" />
                      }
                      </>
                      :
                      <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                    }
                </div>
            </div>
        }

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
          <FaChevronUp />
        </div>
      </form>
    </div>
  )
}

export default PackagingComp