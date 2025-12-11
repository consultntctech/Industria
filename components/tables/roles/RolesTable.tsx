import { useFetchRoles } from "@/hooks/fetch/useFetchRoles";
import { deleteRole, getRole } from "@/lib/actions/role.action";
import { IRole } from "@/lib/models/role.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useSearchParams } from "next/navigation";
import RolesInfoModal from "./RolesInfoModal";
import { RolesColumns } from "./RolesColumns";
import RoleAssignModal from "./RoleAssignModal";

type RolesTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentRole:IRole | null;
    setCurrentRole:Dispatch<SetStateAction<IRole | null>>;
}

const RolesTable = ({setOpenNew, currentRole, setCurrentRole}:RolesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    

    const {roles, isPending, refetch} = useFetchRoles();


    const searchParams = useSearchParams();
        const RoleId = searchParams.get("Id");
    
        useEffect(() => {
            if (!RoleId) return;
    
            let isMounted = true;
    
            const fetchRole = async () => {
                try {
                const res = await getRole(RoleId);
                if (!isMounted) return;
    
                const item = res.payload as IRole;
                if (!res.error) {
                    setCurrentRole(item);
                    setShowInfo(true);
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching role", { variant: "error" });
                }
                }
            };
    
            fetchRole();
    
            return () => {
                isMounted = false;
            };
        }, [RoleId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:IRole)=>{
        setCurrentRole(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:IRole)=>{
        setShowInfo(true);
        setCurrentRole(item);
    }

    const handleDelete = (item:IRole)=>{
        setShowDelete(true);
        setCurrentRole(item);
    }
    const handleAssign = (item:IRole)=>{
        setShowAssign(true);
        setCurrentRole(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentRole(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentRole) return;
            const res = await deleteRole(currentRole?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting Role', {variant:'error'});
        }
    }


    const content = currentRole ? `Are you sure you want to delete Role: ${currentRole.name}? This will remove this role from all users.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Roles</span>
        <RoleAssignModal currentRole={currentRole} setCurrentRole={setCurrentRole} open={showAssign} setOpen={setShowAssign} />
        <RolesInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentRole={currentRole} setCurrentRole={setCurrentRole} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Role" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IRole)=>row._id}
                        rows={roles}
                        columns={RolesColumns(handleInfo, handleEdit, handleAssign, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdBy:false,
                                  description: false,
                                  createdAt:false,
                                  updatedAt:false,
                                  org:false,
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

export default RolesTable