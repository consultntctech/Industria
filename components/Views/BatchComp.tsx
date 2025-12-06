import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectBatchConfigs from "../shared/inputs/dropdowns/SearchSelectBatchConfigs";
import CustomCheck from "../misc/CustomCheck";
import ModalContainer from "../shared/outputs/ModalContainer";
import { IBatch } from "@/lib/models/batch.model";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import { createBatch, updateBatch } from "@/lib/actions/batch.action";
import { useBatches } from "@/hooks/fetch/useBatches";
import { IBatchConfig } from "@/lib/models/batchconfig.model";

type BatchCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentBatch: IBatch | null;
  setCurrentBatch: Dispatch<SetStateAction<IBatch | null>>;
}

const BatchComp = ({openNew, setOpenNew, currentBatch, setCurrentBatch}:BatchCompProps) => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [config, setConfig] = useState<string>('');
  const [isConfig, setIsConfig] = useState<boolean>(true);
  const [data, setData] = useState<Partial<IBatch>>({type:'Raw Material', isConfig:false});
  const {user} = useAuth();
  const {refetch} = useBatches();

  const currentConfig = currentBatch?.config as IBatchConfig;
  // console.log('Current Config: ', currentConfig)



  useEffect(() => {
    if(currentBatch){
      setData({...currentBatch});
      setIsConfig(currentBatch?.isConfig);
    }else{
      setData({});// Reset form data when currentUser is null
    }
  },  [currentBatch])


  const handleClose = ()=>{
    setOpenNew(false);
    setCurrentBatch(null);
    setData({type:'Raw Material', isConfig:false});
  }


  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const batchData:Partial<IBatch> = isConfig ? {...data, isConfig, config, org:user?.org, createdBy:user?._id}
      : {...data, isConfig,  org:user?.org, createdBy:user?._id}
      const res = await createBatch(batchData);
      enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        setOpenNew(false);
        refetch();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while creating batch code', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }

  const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await updateBatch({...data});
      enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        refetch();
        handleClose();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while creating batch code', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }

  const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((pre)=>({
      ...pre, [e.target.name]: e.target.value
    }))
  }

  const onSelectChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  return (
    <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
      <div className={`flex w-[90%] md:w-[50%]`}>
        <form ref={formRef} onSubmit={currentBatch ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
                <span className="title" >{currentBatch ? 'Edit batch code' : 'Add new batch code'}</span>
                <span className="greyText" >Batch numbers are used to track your inventory</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                  <div className="flex flex-row items-center gap-4">
                    <span className="smallText">Use a configuration</span>
                    <CustomCheck checked={ isConfig} setChecked={setIsConfig}/>
                  </div>
                  {
                    isConfig && openNew &&
                    <GenericLabel
                      label="Select Configuration"
                      input={<SearchSelectBatchConfigs value={currentConfig} required={isConfig} setSelect={setConfig} />}
                    />
                    
                  }
                  <GenericLabel 
                    label='Generate for'
                    input={
                      <select defaultValue={currentBatch?.type} onChange={onSelectChange} name="type" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                        <option  value="Raw Material">Raw Material</option>
                        <option value="Finished Good">Finished Good</option>
                        <option value="Packaging">Packaging</option>
                    </select>
                    }
                  />
                  {
                    !isConfig &&
                    <InputWithLabel defaultValue={currentBatch?.code} onChange={onChange} name="code" required={!isConfig} placeholder="eg. BATCH00001" label="Batch Code" className="w-full" />
                  }
                  <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentBatch ? "Update" : "Submit"} className="w-full mt-4" />
                </div>
                
            </div>
    
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                <FaChevronUp />
            </div>
        </form>
      </div>
    </ModalContainer>
  )
}

export default BatchComp