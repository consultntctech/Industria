import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import { createRole, updateRole } from "@/lib/actions/role.action";
import { enqueueSnackbar } from "notistack";
import { IRole } from "@/lib/models/role.model";
import { IOperation, ITable } from "@/types/Types";
import { TableData } from "@/Data/roles/table";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectTable from "../shared/inputs/dropdowns/SearchSelectTable";
import SearchSelectMultipleOperations from "../shared/inputs/dropdowns/SearchSelectMultipleOperations";
import { useFetchRoles } from "@/hooks/fetch/useFetchRoles";

type RoleCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentRole:IRole | null;
  setCurrentRole:Dispatch<SetStateAction<IRole | null>>;
}

const RoleComp = ({openNew, setOpenNew, currentRole, setCurrentRole}:RoleCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IRole>>({});
    const [operations, setOperations] = useState<IOperation[]>([]);
    const [table, setTable] = useState<ITable | null>(null);
    const {user} = useAuth();

    const permissions = data?.permissions
    const oldTable = TableData.filter(t=>t.id===permissions?.tableid)[0]
    const oldOperations = permissions?.operations as IOperation[]

    const formRef = useRef<HTMLFormElement>(null);
    const {refetch} = useFetchRoles();


    
    useEffect(()=>{
        if(currentRole){
            setData({...currentRole});
            setTable(oldTable);
            setOperations(oldOperations);
        }else{
            setData({});
        }
    },[currentRole, oldOperations?.length, oldTable])

    // console.log('Old Table: ', table);
    // console.log('Old Operations: ', operations);
    
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentRole(null);
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
            if(!operations.length){
                    enqueueSnackbar('Please select at least one operation', {variant:'error'});
                    return;
            }
            const formData:Partial<IRole> = {
                ...data,
                permissions:{
                    tableid:table?.id as string,
                    operations
                },
                org:user?.org,
                createdBy:user?._id
            }
            const res = await createRole(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating the role', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if(!operations.length){
                enqueueSnackbar('Please select at least one operation', {variant:'error'});
                return;
            }
            const formData:Partial<IRole> = {
                ...data,
                permissions:{
                    tableid:table?.id as string,
                    operations
                },
            }
            const res = await updateRole(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating updating role', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    // if(!openNew) return null;
  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={currentRole ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentRole ? 'Edit role permissions' : 'Add new role'}</span>
                    <span className="greyText" >Roles can be assigned to users to perfom certain functionalities</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentRole?.name} onChange={onChange} name="name" required placeholder="something to remember it by" label="Give it a name" className="w-full" />
                        {
                            currentRole ?
                            <>
                            {
                                oldTable &&
                                <GenericLabel label="Select table"
                                    input={<SearchSelectTable value={oldTable} setSelect={setTable}  required />}
                                />
                            }
                            {
                                oldOperations  &&
                                <GenericLabel label="Select operations"
                                input={<SearchSelectMultipleOperations value={oldOperations} setSelection={setOperations}  />}
                                />
                            }
                            </>
                            :
                            <>
                                <GenericLabel label="Select table"
                                    input={<SearchSelectTable value={oldTable} setSelect={setTable}  required />}
                                />
                                <GenericLabel label="Select operations"
                                    input={<SearchSelectMultipleOperations value={oldOperations} setSelection={setOperations}  />}
                                />
                            </>
                        }
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <TextAreaWithLabel defaultValue={currentRole?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentRole ? "Update" : "Submit"} className="w-full mt-4" />
                    </div>
                </div>
        
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        }
    </div>
  )
}

export default RoleComp