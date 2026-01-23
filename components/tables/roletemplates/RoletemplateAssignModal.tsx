import SearchSelectMultipleUsers from "@/components/shared/inputs/dropdowns/SearchSelectMultipleUsers";
import { AssignRolesToUsers } from "@/lib/actions/user.action";
import { IRole } from "@/lib/models/role.model";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { IUser } from "@/lib/models/user.model";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
// import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FormEvent,  SetStateAction, useState } from "react";

type RoletemplateAssignModalProps = {
    currentRoletemplate: IRoleTemplate | null;
    setCurrentRoletemplate:Dispatch<SetStateAction<IRoleTemplate | null>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const RoletemplateAssignModal = ({currentRoletemplate,  setCurrentRoletemplate, open, setOpen}:RoletemplateAssignModalProps) => {
    const [users, setUsers] = useState<IUser[]>([]);
    const userIds = users?.map(u=>u._id);
    const roles = currentRoletemplate?.roles as IRole[];
    const roleIds = roles?.map(r=>r._id);
    // console.log('User: ', user);
    // console.log('Role: ', currentRoletemplate);

    const handleClose = ()=>{
        setOpen(false);
        setCurrentRoletemplate(null);
    }

    const agreeClick = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!currentRoletemplate || !users.length) return;
            
            
            const res = await AssignRolesToUsers(userIds, roleIds);
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
            <DialogContentText>
                Select a user to assign this role to
            </DialogContentText>
            <form onSubmit={agreeClick} id="role-template-component-form">
                <SearchSelectMultipleUsers showMe={false} showAdmins={false} width={280} setSelection={setUsers} />
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button type="submit"  form="role-template-component-form">
                Proceed
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default RoletemplateAssignModal