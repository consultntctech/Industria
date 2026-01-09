import { useAuth } from '@/hooks/useAuth';
import  { ChangeEvent, FormEvent,  useEffect, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import GenericLabel from '../shared/inputs/GenericLabel';
import TextInput from '../shared/inputs/TextInput';
import { IBatchConfig } from '@/lib/models/batchconfig.model';
import { createBatchConfig } from '@/lib/actions/batchconfig.action';
import { enqueueSnackbar } from 'notistack';
import { useBatchNoConfig } from '@/hooks/config/useBatchNoConfig';
import { LinearProgress } from '@mui/material';
import { canUser } from '@/Data/roles/permissions';


const BatchConfigComp = () => {
  const {user} = useAuth()
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IBatchConfig>>({});
    const {batchConfig, refetch, batchConfigLoading} = useBatchNoConfig();
    const isConfigurer = canUser(user, '48', 'UPDATE');
    const isConfigAdmin = canUser(user, '48', 'CREATE');

    useEffect(() => {
      if(batchConfig){
        setData({
          prefix: batchConfig?.prefix,
          suffix: batchConfig?.suffix,
          length: batchConfig?.length,
          type: batchConfig?.type,
          increament: batchConfig?.increament,
          mode: batchConfig?.mode
        })
      }
    }, [batchConfig])

    console.log('Data: ', batchConfig)

    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
       }

      const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const confData:Partial<IBatchConfig> = {
            prefix: data.prefix || batchConfig?.prefix,
            suffix: data.suffix || batchConfig?.suffix,
            length: data.length || batchConfig?.length,
            type: data.type || batchConfig?.type,
            mode: 'Custom',
            increament: data.increament || batchConfig?.increament,
            org: user?.org,
            createdBy: user?._id
          }
          const res = await createBatchConfig(confData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while saving configuration', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }
    
  return (
    <div className={`flex p-4 lg:p-8 rounded-2xl w-full`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >

            <div className="flex flex-col gap-1">
                <span className="title" >Set up batch-no</span>
                <span className="greyText" >This will be used to create batch numbers for your products</span>
            </div>
            {
              batchConfigLoading ? 
              <LinearProgress className='w-full' />
              :
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  <div className="flex gap-4 flex-col w-full">
                  <InputWithLabel defaultValue={batchConfig?.prefix} onChange={onChange} name="prefix"  placeholder="eg. BATCH" label="Prefix" className="w-full" />
                  <InputWithLabel defaultValue={batchConfig?.suffix} onChange={onChange} name="suffix"  placeholder="eg. PD" label="Suffix" className="w-full" />
                  <InputWithLabel defaultValue={batchConfig?.length} onChange={onChange} name="length" required min={1} type="number" placeholder="eg. 5" label="Length" className="w-full" />
                  <GenericLabel
                      label='Generation type'
                      input={
                          <div className='flex flex-row gap-4' >
                              <div className="flex flex-row gap-2 items-center">
                                  <TextInput onChange={onChange} value='Auto-increment'  type='radio' name='type' defaultChecked={batchConfig?.type === 'Auto-increment'} />
                                  <span className='smallText' >Auto-increment</span>
                              </div>
                              <div className="flex flex-row gap-2 items-center">
                                  <TextInput onChange={onChange} value='Auto-generation'  type='radio' name='type' defaultChecked={batchConfig?.type === 'Auto-generation'} />
                                  <span className='smallText' >Auto-generation</span>
                              </div>
                          </div>
                      }
                  />
                  {
                      data.type === 'Auto-increment' &&
                      <InputWithLabel  onChange={onChange} name="increament" type='number' defaultValue={batchConfig?.increament} min={1} required placeholder="eg. 1" label="Increase by" className="w-full" />
                  }
                  {
                    (isConfigurer || isConfigAdmin) &&
                    <PrimaryButton loading={loading} type="submit" text={loading?"saving" : "Save"} className="w-full mt-4" />
                  }
                  </div>
              </div>
            }
    
            
        </form>
    </div>
  )
}

export default BatchConfigComp