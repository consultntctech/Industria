import { useAuth } from "@/hooks/useAuth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { FaChevronUp } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../shared/inputs/GenericLabel";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { IRole } from "@/lib/models/role.model";
import { createRoleTemplate, updateRoleTemplate } from "@/lib/actions/roletemplate.action";
import { useFetchRoleTemplates } from "@/hooks/fetch/useFetchRoletemplates";
import SearchSelectAvMultipleRoleTemplates from "../shared/inputs/dropdowns/SearchSelectAvMultipleRoleTemplates";

type RoletemplateCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentRoletemplate:IRoleTemplate | null;
  setCurrentRoletemplate:Dispatch<SetStateAction<IRoleTemplate | null>>;
}

const RoletemplateComp = ({openNew, setOpenNew, currentRoletemplate, setCurrentRoletemplate}:RoletemplateCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IRoleTemplate>>({});
    const [roles, setRoles] = useState<IRole[]>([]);
    const {user} = useAuth();

    const savedRoles = currentRoletemplate?.roles as IRole[];
  

    const formRef = useRef<HTMLFormElement>(null);
    const {refetch} = useFetchRoleTemplates();


    
    useEffect(()=>{
        if(currentRoletemplate){
            setData({...currentRoletemplate});
            setRoles(savedRoles);
        }else{
            setData({});
        }
    },[currentRoletemplate ])

    // console.log('Old Table: ', table);
    // console.log('Old Operations: ', operations);
    
    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentRoletemplate(null);
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
            
            const formData:Partial<IRoleTemplate> = {
                ...data,
                roles: roles?.map(r=>r._id),
                org:user?.org,
                createdBy:user?._id
            }
            const res = await createRoleTemplate(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating the template', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const handleUpdate = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            
            const formData:Partial<IRoleTemplate> = {
                ...data,
                roles: roles?.map(r=>r._id),
            }
            const res = await updateRoleTemplate(formData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while creating updating template', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    // if(!openNew) return null;
  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`}>
        {
            openNew &&
            <form ref={formRef} onSubmit={currentRoletemplate ? handleUpdate : handleSubmit}  className="formBox relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >{currentRoletemplate ? 'Edit role template' : 'Add new role template'}</span>
                    <span className="greyText" >Templates make it quicker to assign roles to users in bulk</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel defaultValue={currentRoletemplate?.name} onChange={onChange} name="name" required placeholder="eg. Global Reader" label="Give it a name" className="w-full" />
                        
                        <GenericLabel label="Select operations"
                            input={<SearchSelectAvMultipleRoleTemplates value={savedRoles} setSelection={setRoles}  />}
                        />
                    </div>
        
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-4 w-full">
                            <TextAreaWithLabel defaultValue={currentRoletemplate?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        </div>
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentRoletemplate ? "Update" : "Submit"} className="w-full mt-4" />
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

export default RoletemplateComp