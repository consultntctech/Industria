import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { enqueueSnackbar } from "notistack";
import { IDepartment } from "@/lib/models/department.model";
import GenericLabel from "../shared/inputs/GenericLabel";
import {useCanUser } from "@/hooks/useAuth";
import { createDepartment, updateDepartment } from "@/lib/actions/department.action";
import CloseButton from "../misc/CloseButton";
import { useFetchDepartments } from "@/hooks/fetch/useFetchDepartments";
import SearchSelectEmployees from "../shared/inputs/dropdowns/SearchSelectEmployees";
import { IEmployee } from "@/lib/models/employee.model";
;

type DepartmentCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentDepartment:IDepartment | null;
  setCurrentDepartment:Dispatch<SetStateAction<IDepartment | null>>;
}

const DepartmentComp = ({openNew, setOpenNew, currentDepartment, setCurrentDepartment}:DepartmentCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IDepartment>>({});
    const [head, setHead] = useState<IEmployee | null>(null);
    const {user} = useAuth();


    const formRef = useRef<HTMLFormElement>(null);
    const {refetch} = useFetchDepartments();
    const savedHead = currentDepartment?.head as IEmployee
    const isCreator = useCanUser('95', 'CREATE');
    const isEditor = useCanUser('95', 'UPDATE');

    
    useEffect(()=>{
        if(currentDepartment){
            setData({...currentDepartment});
            setHead(savedHead);
        }else{
            setData({});
        }
    },[currentDepartment])

    // console.log('Old Table: ', table);
    // console.log('Old Operations: ', operations);
    
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentDepartment(null);
        setData({});
    }

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }
    
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
           
            const formData:Partial<IDepartment> = {
                ...data,
                head:head?._id,
                roles:[],
                creator:user?.name || '',
                headName:head?.name || '',
                org:user?.org,
                createdBy:user?._id,
            }
            const res = await createDepartment(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating the department', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            
            const formData:Partial<IDepartment> = {
                ...data,
                head:head?._id,
                headName:head?.name || '',
            }
            const res = await updateDepartment(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating updating department', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    // if(!openNew) return null;
  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={currentDepartment ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentDepartment ? 'Edit department' : 'Add new department'}</span>
                    <span className="greyText" >Departments are used to group users and equipment assignemts</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentDepartment?.name} onChange={onChange} name="name" required placeholder="eg. Sales" label="Give it a name" className="w-full" />
                        <GenericLabel label="Select HOD"
                            input={<SearchSelectEmployees value={savedHead} setSelect={setHead}  required showMe={true} />}
                        />
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <TextAreaWithLabel defaultValue={currentDepartment?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        {
                            (isCreator || isEditor) &&
                            <PrimaryButton disabled={currentDepartment ? !isEditor : !isCreator} loading={loading} type="submit" text={loading?"loading" : currentDepartment ? "Update" : "Submit"} className="w-full mt-4" />
                        }
                    </div>
                </div>
        
                <CloseButton onClick={handleClose} />
            </form>
        }
    </div>
  )
}

export default DepartmentComp