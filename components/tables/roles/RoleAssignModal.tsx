import SearchSelectMultipleUsers from "@/components/shared/inputs/dropdowns/SearchSelectMultipleUsers";
import { AssignRolesToUsers } from "@/lib/actions/user.action";
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
    const userIds = users?.map(u=>u._id);
    // console.log('User: ', user);
    // console.log('Role: ', currentRole);

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
    
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Select a user to assign this role to
            </DialogContentText>
            <form onSubmit={agreeClick} id="role-component-form">
                <SearchSelectMultipleUsers showMe={false} width={280} setSelection={setUsers} />
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