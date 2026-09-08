import { IRole } from "@/lib/models/role.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import DeptRolesInfoModal from "./DeptRolesInfoModal";
import { DeptRolesColumns } from "./DeptRolesColumns";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { IDepartment } from "@/lib/models/department.model";
import { removeRolesFromDepartment } from "@/lib/actions/department.action";
import { enqueueSnackbar } from "notistack";
import SecondaryButton from "@/components/shared/buttons/SecondaryButton";
import DeptRoleAssignModal from "./DeptRoleAssignModal";

type DeptRolesTableProps = {
    department: IDepartment | null;
}

const DeptRolesTable = ({department}:DeptRolesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentRole, setCurrentRole] = useState<IRole | null>(null);

    const roles = department?.roles as IRole[];

    const paginationModel = { page: 0, pageSize: 15 };


    const handleInfo = (item:IRole)=>{
        setShowInfo(true);
        setCurrentRole(item);
    }

    const handleDelete = (item:IRole)=>{
        setShowDelete(true);
        setCurrentRole(item);
    }

    const handleAssign = ()=>{
        setShowAssign(true);
    }


    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentRole(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentRole || !department) return;
            const res = await removeRolesFromDepartment(department?._id, [currentRole?._id]);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                roles.filter((r)=>r._id !== currentRole?._id);
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while removing role', {variant:'error'});
        }
    }

    const content = currentRole ? `Are you sure you want to delete Role: ${currentRole.name}? This will remove this role from all users.` : '';


  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Department Permissions</span>
        <SecondaryButton onClick={handleAssign} text="Add" className="self-end" />
        <DeptRoleAssignModal department={department} open={showAssign} setOpen={setShowAssign} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Remove Role" content={content} />
        <DeptRolesInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentRole={currentRole} setCurrentRole={setCurrentRole} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={!roles}
                        getRowId={(row:IRole)=>row._id}
                        rows={roles}
                        columns={DeptRolesColumns(handleInfo, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  
                                }
                              }
                         }}
                        pageSizeOptions={[5, 10, 15, 20, 30, 50, 100]}
                        // checkboxSelection
                        className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                        sx={{ border: 0 }}
                        // slots={{toolbar:GridToolbar}}
                        showToolbar
                        slotProps={{
                            toolbar:{
                                showQuickFilter:true,
                                printOptions:{
                                    hideFooter:true, hideToolbar:true
                                }
                            }
                        }}
                    />
                </Paper>
            }
        </div>
    </div>
  )
}

export default DeptRolesTable