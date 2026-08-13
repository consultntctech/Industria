import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import { FaChevronUp } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import TextAreaWithLabel from '../shared/inputs/TextAreaWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { createLabourer, updateLabourer } from '@/lib/actions/labourer.action';
import { ILabourer } from '@/lib/models/labourer.model';
import SearchSelectOrgs from '../shared/inputs/dropdowns/SearchSelectOrgs';
import GenericLabel from '../shared/inputs/GenericLabel';
import { IOrganization } from '@/lib/models/org.model';
import { useFetchLabourers } from '@/hooks/fetch/useFetchLabourers';
import { useAuth, useCanUser } from '@/hooks/useAuth';
import {  isSystemAdmin } from '@/Data/roles/permissions';


type LabourerCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentLabourer?:ILabourer | null;
  setCurrentLabourer:Dispatch<SetStateAction<ILabourer | null>>;
}

const LabourersComp = ({openNew, setOpenNew, currentLabourer, setCurrentLabourer}:LabourerCompProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<ILabourer>>({});
    const [org, setOrg] = useState<string>('');
    const {refetch} = useFetchLabourers();
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const isCreator = useCanUser('91', 'CREATE');
    const isEditor = useCanUser('91', 'UPDATE');

    const organization = currentLabourer?.org as IOrganization;
    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setFormData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    useEffect(() => {
        if(currentLabourer){
            setFormData({...currentLabourer, org:organization?._id});// Set form data when currentLabourer changes
        }
    }, [currentLabourer])
   
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentLabourer(null);
        setOrg('');
        formRef.current?.reset();
        setFormData({});
    }
    

     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createLabourer({...formData, createdBy:user?._id, org:isAdmin ? org : user?.org});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating labourer', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
          if(!currentLabourer) return;
          const res = await updateLabourer({...formData, org:org || currentLabourer.org});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              refetch();
              handleClose();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating labourer', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentLabourer ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentLabourer ? 'Edit labourer' : 'Add new labourer'}</span>
          <span className="greyText" >{currentLabourer ? 'Edit the details of the labourer' : 'Create a new labourer to handle operations'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel defaultValue={currentLabourer?.name} onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel defaultValue={currentLabourer?.address} onChange={onChange} name="address" placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel defaultValue={currentLabourer?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel defaultValue={currentLabourer?.email} onChange={onChange} name="email"  type="email" placeholder="enter email" label="Email (optional)" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            {
              openNew && isAdmin &&
              <GenericLabel
                label='Select organization'
                input={<SearchSelectOrgs value={organization}  setOrgId={setOrg} required={!!currentLabourer} />}
              />
            }
            <TextAreaWithLabel defaultValue={currentLabourer?.note} name="note" onChange={onChange} placeholder="enter note" label="Additional Note" className="w-full" />
            {
              (isCreator || isEditor) &&
              <PrimaryButton disabled={currentLabourer ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentLabourer ? "Update" : "Submit"} className="w-full mt-4" />
            }
          </div>
        </div>

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
          <FaChevronUp />
        </div>
      </form>
    </div>
  )
}

export default LabourersComp