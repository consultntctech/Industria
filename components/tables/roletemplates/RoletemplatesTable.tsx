import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useSearchParams } from "next/navigation";

import RoletemplateAssignModal from "./RoletemplateAssignModal";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { deleteRoleTemplate, getRoleTemplate } from "@/lib/actions/roletemplate.action";
import { useFetchRoleTemplates } from "@/hooks/fetch/useFetchRoletemplates";
import RoletemplateInfoModal from "./RoletemplateInfoModal";
import { RoletemplateColumns } from "./RoletemplateColumns";

type RoletemplatesTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentRoletemplate:IRoleTemplate | null;
    setCurrentRoletemplate:Dispatch<SetStateAction<IRoleTemplate | null>>;
}

const RoletemplatesTable = ({setOpenNew, currentRoletemplate, setCurrentRoletemplate}:RoletemplatesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    

    const {roleTemplates, isPending, refetch} = useFetchRoleTemplates();


    const searchParams = useSearchParams();
        const RoleId = searchParams.get("Id");
    
        useEffect(() => {
            if (!RoleId) return;
    
            let isMounted = true;
    
            const fetchRole = async () => {
                try {
                const res = await getRoleTemplate(RoleId);
                if (!isMounted) return;
    
                const item = res.payload as IRoleTemplate;
                if (!res.error) {
                    setCurrentRoletemplate(item);
                    setShowInfo(true);
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching template", { variant: "error" });
                }
                }
            };
    
            fetchRole();
    
            return () => {
                isMounted = false;
            };
        }, [RoleId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:IRoleTemplate)=>{
        setCurrentRoletemplate(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:IRoleTemplate)=>{
        setShowInfo(true);
        setCurrentRoletemplate(item);
    }

    const handleDelete = (item:IRoleTemplate)=>{
        setShowDelete(true);
        setCurrentRoletemplate(item);
    }
    const handleAssign = (item:IRoleTemplate)=>{
        setShowAssign(true);
        setCurrentRoletemplate(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentRoletemplate(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentRoletemplate) return;
            const res = await deleteRoleTemplate(currentRoletemplate?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting template', {variant:'error'});
        }
    }


    const content = currentRoletemplate ? `Are you sure you want to delete template: ${currentRoletemplate.name}? This will not affect users that have roles in this template.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Templates</span>
        <RoletemplateAssignModal currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate} open={showAssign} setOpen={setShowAssign} />
        <RoletemplateInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Template" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IRoleTemplate)=>row._id}
                        rows={roleTemplates}
                        columns={RoletemplateColumns(handleInfo, handleEdit, handleAssign, handleDelete)}
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

export default RoletemplatesTable