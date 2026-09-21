import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import { FaChevronUp } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import TextAreaWithLabel from '../shared/inputs/TextAreaWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SearchSelectOrgs from '../shared/inputs/dropdowns/SearchSelectOrgs';
import GenericLabel from '../shared/inputs/GenericLabel';
import { IOrganization } from '@/lib/models/org.model';
import { useAuth, useCanUser } from '@/hooks/useAuth';
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { IDepartment } from '@/lib/models/department.model';
import SearchSelectDepartments from '../shared/inputs/dropdowns/SearchSelectDepartments';
import { IEmployee } from '@/lib/models/employee.model';
import { createEmployee, updateEmployee } from '@/lib/actions/employee.action';
import { useEmployeeHasAccount, useFetchEmployees } from '@/hooks/fetch/useFetchEmployees';


type UserCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentEmployee?:IEmployee | null;
  setCurrentEmployee:Dispatch<SetStateAction<IEmployee | null>>;
}

const EmployeeComp = ({openNew, setOpenNew, currentEmployee, setCurrentEmployee}:UserCompProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<IEmployee>>({});
    const [department, setDepartment] = useState<IDepartment | null>(null);
    const [org, setOrg] = useState<string>('');
    const {refetch} = useFetchEmployees();
    const {hasAccount} = useEmployeeHasAccount(currentEmployee?.email as string);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const isCreator = useCanUser('96', 'CREATE');
    const isEditor = useCanUser('96', 'UPDATE');

    const organization = currentEmployee?.org as IOrganization;
    const savedDepartment = currentEmployee?.department as IDepartment;
    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setFormData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    // console.log('Departments: ', savedDepartment)

    useEffect(() => {
        if(currentEmployee){
            setFormData({...currentEmployee, org:organization?._id});// Set form data when currentEmployee changes
            setDepartment(savedDepartment);
            setOrg(organization?._id);
        }
    }, [currentEmployee])
   
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentEmployee(null);
        setOrg('');
        formRef.current?.reset();
        setFormData({});
    }
    

     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createEmployee({...formData, department:department?._id, org:isAdmin ? org : user?.org, creator:user?.name});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success', autoHideDuration:9000});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              refetch();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating employee', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
          if(!currentEmployee) return;
          const res = await updateEmployee({...formData, department:department?._id, org:org || currentEmployee.org});
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef?.current?.reset();
              refetch();
              handleClose();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating employee', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentEmployee ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentEmployee ? 'Edit employee' : 'Add new employee'}</span>
          {
            hasAccount ?
            <span className="greyText" >This employee has a user account. Details have to be updated in the user account</span>
            :
            <span className="greyText" >{currentEmployee ? 'Edit the details of the employee' : 'Create a new employee to handle operations'}</span>
          }
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel readOnly={hasAccount} defaultValue={currentEmployee?.name} onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel readOnly={hasAccount} defaultValue={currentEmployee?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel readOnly={hasAccount} defaultValue={currentEmployee?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel readOnly={hasAccount} defaultValue={currentEmployee?.email} onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            {
              openNew && isAdmin &&
              <GenericLabel
                label='Select organization'
                input={<SearchSelectOrgs value={organization} disable={hasAccount} setOrgId={setOrg} required={!currentEmployee} />}
              />
            }
            {
              openNew &&
              <GenericLabel
                label='Select department'
                input={<SearchSelectDepartments disabled={hasAccount} value={savedDepartment} orgId={org} setSelect={setDepartment} required={!currentEmployee?.department} />}
              />
            }
            <TextAreaWithLabel disabled={hasAccount} defaultValue={currentEmployee?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
            {
              (isCreator || isEditor) && !hasAccount &&
              <PrimaryButton disabled={currentEmployee ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentEmployee ? "Update" : "Submit"} className="w-full mt-4" />
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

export default EmployeeComp