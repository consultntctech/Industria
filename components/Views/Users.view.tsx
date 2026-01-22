import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import { FaChevronUp } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import TextAreaWithLabel from '../shared/inputs/TextAreaWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { createUser, updateUser } from '@/lib/actions/user.action';
import { IUser } from '@/lib/models/user.model';
import SearchSelectOrgs from '../shared/inputs/dropdowns/SearchSelectOrgs';
import GenericLabel from '../shared/inputs/GenericLabel';
import { IOrganization } from '@/lib/models/org.model';
import { useFetchUsers } from '@/hooks/fetch/useFetchUsers';
import { useAuth } from '@/hooks/useAuth';
import { canUser, isSystemAdmin } from '@/Data/roles/permissions';


type UserCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentUser?:IUser | null;
  setCurrentUser:Dispatch<SetStateAction<IUser | null>>;
}

const UsersComp = ({openNew, setOpenNew, currentUser, setCurrentUser}:UserCompProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<IUser>>({});
    const [org, setOrg] = useState<string>('');
    const {refetch} = useFetchUsers();
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const isCreator = canUser(user, '38', 'CREATE');
    const isEditor = canUser(user, '38', 'UPDATE');

    const organization = currentUser?.org as IOrganization;
    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setFormData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    useEffect(() => {
        if(currentUser){
            setFormData({...currentUser, org:organization?._id});// Set form data when currentUser changes
        }else{
            setFormData({});// Reset form data when currentUser is null
        }
    }, [currentUser])
   
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentUser(null);
        setOrg('');
        setFormData({});
    }
    

     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createUser({...formData, org:isAdmin ? org : user?.org});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating user', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
          if(!currentUser) return;
          const res = await updateUser(formData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              handleClose();
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating user', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentUser ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentUser ? 'Edit user' : 'Add new user'}</span>
          <span className="greyText" >{currentUser ? 'Edit the details of the user' : 'Create a new user to handle operations'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel defaultValue={currentUser?.name} onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel defaultValue={currentUser?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel defaultValue={currentUser?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel defaultValue={currentUser?.email} onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            {
              openNew && isAdmin &&
              <GenericLabel
                label='Select organization'
                input={<SearchSelectOrgs value={organization}  setOrgId={setOrg} required={!!currentUser} />}
              />
            }
            <TextAreaWithLabel defaultValue={currentUser?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
            {
              (isCreator || isEditor) &&
              <PrimaryButton disabled={currentUser ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentUser ? "Update" : "Submit"} className="w-full mt-4" />
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

export default UsersComp