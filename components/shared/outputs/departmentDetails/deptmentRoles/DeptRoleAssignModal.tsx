import SearchSelectMultipleRoles from "@/components/shared/inputs/dropdowns/SearchSelectMultipleRoles";
import SearchSelectMultipleTemplates from "@/components/shared/inputs/dropdowns/SearchSelectMultipleTemplates";
// import SearchSelectOrgs from "@/components/shared/inputs/dropdowns/SearchSelectOrgs";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
// import { isSystemAdmin } from "@/Data/roles/permissions";
// import { useAuth, useCanUser } from "@/hooks/useAuth";
import { assignRolesToDepartments } from "@/lib/actions/department.action";
// import { AssignRolesToUsers } from "@/lib/actions/user.action";
import { IDepartment } from "@/lib/models/department.model";
import { IRole } from "@/lib/models/role.model";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
// import { IUser } from "@/lib/models/user.model";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
// import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FormEvent,  SetStateAction, useState } from "react";

type DeptRoleAssignModalProps = {
    department: IDepartment | null;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const DeptRoleAssignModal = ({department, open, setOpen}:DeptRoleAssignModalProps) => {
    const [roles, setRoles] = useState<IRole[]>([]);
    const [templates, setTemplates] = useState<IRoleTemplate[]>([]);
    const [mode, setMode] = useState<'roles'|'templates'>('roles');
    
    // const {user} = useAuth();
    // const isAdmin = isSystemAdmin(user);
    // const editor = useCanUser('95', 'UPDATE');
    const currentRoles = department?.roles as IRole[];
    // console.log('User: ', user);
    // console.log('Role: ', currentRole);
    
    const roleIds = roles?.map(r=>r._id);
    const templateIds = templates?.flatMap(t=>{
        const tRoles = t?.roles as IRole[];
        return tRoles.map(r=>r._id);
    })

    const ids = mode === 'roles' ? roleIds : templateIds;


    const handleClose = ()=>{
        setOpen(false);
    }

    const agreeClick = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!department || (!ids.length)) return;
            
            
            const res = await assignRolesToDepartments([department?._id], ids);
            if(!res.error){
                enqueueSnackbar('Role assigned successfully', {variant:'success'});
                handleClose();
            }else{
                enqueueSnackbar('Error occured while assigning role', {variant:'error'});
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    
    
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
            {/* {
                isAdmin &&
                <GenericLabel label="Select Organization" input={<SearchSelectOrgs setOrgId={setOrg} width={280} />} />
            } */}
            <GenericLabel 
                label='Selection mode'
                input={
                <select style={{width:280}} defaultValue='roles' onChange={(e)=>setMode(e.target.value as 'roles'|'templates')}  className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                    <option  value="roles">Roles</option>
                    <option value="templates">Templates</option>
                </select>
                }
            />
            <DialogContentText style={{width:280, fontSize:12, color:'black', marginTop:16}} >
                Select roles to assign to this department
            </DialogContentText>
            <form onSubmit={agreeClick } id="role-component-form">
                {
                    mode === 'roles' ?
                    <SearchSelectMultipleRoles setSelection={setRoles} fixedSelection={currentRoles} width={280} />
                    :
                    <SearchSelectMultipleTemplates setSelection={setTemplates} width={280} />
                }
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button type="submit"  form="role-component-form">
                Proceed
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default DeptRoleAssignModal