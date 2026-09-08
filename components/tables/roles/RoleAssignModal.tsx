import SearchSelectMultipleDepartments from "@/components/shared/inputs/dropdowns/SearchSelectMultipleDepartments";
import SearchSelectMultipleUsers from "@/components/shared/inputs/dropdowns/SearchSelectMultipleUsers";
import SearchSelectOrgs from "@/components/shared/inputs/dropdowns/SearchSelectOrgs";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { useAuth, useCanUser } from "@/hooks/useAuth";
import { assignRolesToDepartments } from "@/lib/actions/department.action";
import { AssignRolesToUsers } from "@/lib/actions/user.action";
import { IDepartment } from "@/lib/models/department.model";
import { IRole } from "@/lib/models/role.model";
import { IUser } from "@/lib/models/user.model";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
// import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FormEvent,  SetStateAction, useState } from "react";

type RoleAssignModalProps = {
    currentRole: IRole | null;
    setCurrentRole:Dispatch<SetStateAction<IRole | null>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const RoleAssignModal = ({currentRole,  setCurrentRole, open, setOpen}:RoleAssignModalProps) => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [mode, setMode] = useState<'users'|'departments'>('users');
    const [org, setOrg] = useState<string>('');
    
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const editor = useCanUser('95', 'UPDATE');
    // console.log('User: ', user);
    // console.log('Role: ', currentRole);
    
    const userIds = users?.map(u=>u._id);
    const deptIds = departments?.map(d=>d._id);
    const handleClose = ()=>{
        setOpen(false);
        setCurrentRole(null);
    }

    const agreeClick = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!currentRole || !users.length) return;
            
            
            const res = await AssignRolesToUsers(userIds, [currentRole?._id]);
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

    const agreeDepartments = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!departments.length || !currentRole) return;
            
            
            const res = await assignRolesToDepartments(deptIds, [currentRole?._id]);
            if(!res.error){
                enqueueSnackbar('Roles assigned successfully', {variant:'success'});
                handleClose();
            }else{
                enqueueSnackbar('Error occured while assigning roles', {variant:'error'});
            }
            
        } catch (error) {
            console.log(error);
        }
    }
    
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
            {
                isAdmin &&
                <GenericLabel label="Select Organization" input={<SearchSelectOrgs setOrgId={setOrg} width={280} />} />
            }
            <GenericLabel 
                label='Assign to'
                input={
                <select defaultValue='users' onChange={(e)=>setMode(e.target.value as 'users'|'departments')}  className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                    <option  value="users">Users</option>
                    {
                        editor &&
                        <option value="departments">Departments</option>
                    }
                </select>
                }
            />
            <DialogContentText>
                {mode === 'users' ?`Select a user to assign this role to`:'Select a department to assign this role to'}
            </DialogContentText>
            <form onSubmit={mode === 'users' ? agreeClick : agreeDepartments} id="role-component-form">
                {
                    mode === 'users' ?
                    <SearchSelectMultipleUsers showMe={false} showAdmins={false} width={280} setSelection={setUsers} />
                    :
                    <SearchSelectMultipleDepartments setSelection={setDepartments} orgId={org} width={280} />
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

export default RoleAssignModal