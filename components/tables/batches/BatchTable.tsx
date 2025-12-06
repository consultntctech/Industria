import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useSearchParams } from "next/navigation";
import { IBatch } from "@/lib/models/batch.model";
import { useBatches } from "@/hooks/fetch/useBatches";
import { deleteBatch, getBatch } from "@/lib/actions/batch.action";
import { BatchColumns } from "./BatchColumns";

type BatchTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentBatch:IBatch | null;
    setCurrentBatch:Dispatch<SetStateAction<IBatch | null>>;
}

const BatchTable = ({setOpenNew, currentBatch, setCurrentBatch}:BatchTableProps) => {
    const [showDelete, setShowDelete] = useState(false);
    

    const {batches, isPending, refetch} = useBatches();

    // console.log('Creator: ', categories[0]?.createdBy)
    const searchParams = useSearchParams();
        const batchId = searchParams.get("Id");
    
        useEffect(() => {
            if (!batchId) return;
    
            let isMounted = true;
    
            const fetchBatch = async () => {
                try {
                const res = await getBatch(batchId);
                if (!isMounted) return;
    
                const item = res.payload as IBatch;
                if (!res.error) {
                    setCurrentBatch(item);
                    handleEdit(item)
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching batch code", { variant: "error" });
                }
                }
            };
    
            fetchBatch();
    
            return () => {
                isMounted = false;
            };
        }, [batchId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (cat:IBatch)=>{
        setCurrentBatch(cat);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    const handleDelete = (cat:IBatch)=>{
        setShowDelete(true);
        setCurrentBatch(cat);
    }

    const handleClose = ()=>{
        setShowDelete(false);
        setCurrentBatch(null);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentBatch) return;
            const res = await deleteBatch(currentBatch?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting batch code', {variant:'error'});
        }
    }


    const content = currentBatch ? `Are you sure you want to delete batch code ${currentBatch.code}? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Batches</span>
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Delete Batch Code" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IBatch)=>row._id}
                        rows={batches}
                        columns={BatchColumns(handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  config:false,
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
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

export default BatchTable