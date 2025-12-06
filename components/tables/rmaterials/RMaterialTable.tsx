import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ProductInfoModal from './RMaterialInfoModal'
import { useSearchParams } from 'next/navigation'
import { IRMaterial } from '@/lib/models/rmaterial.mode'
import { deleteRMaterial, getRMaterial } from '@/lib/actions/rmaterial.action'
import { useFetchRMaterials } from '@/hooks/fetch/useRMaterials'
import { RMaterialColumns } from './RMaterialColumns'

type RMaterialTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentMaterial:IRMaterial | null;
    setCurrentMaterial:Dispatch<SetStateAction<IRMaterial | null>>;
}

const RMaterialTable = ({setOpenNew, currentMaterial, setCurrentMaterial}:RMaterialTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {materials, isPending, refetch} = useFetchRMaterials();
    const searchParams = useSearchParams();
    const materialId = searchParams.get("Id");

    // console.log('Materials: ', materials)

    useEffect(() => {
        if (!materialId) return;

        let isMounted = true;

        const fetchItem = async () => {
            try {
            const res = await getRMaterial(materialId);
            if (!isMounted) return;

            const userData = res.payload as IRMaterial;
            if (!res.error) {
                setCurrentMaterial(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching product", { variant: "error" });
            }
            }
        };

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [materialId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:IRMaterial)=>{
        setCurrentMaterial(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:IRMaterial)=>{
        setShowInfo(true);
        setCurrentMaterial(item);
    }

    const handleDelete = (item:IRMaterial)=>{
        setShowDelete(true);
        setCurrentMaterial(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentMaterial(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentMaterial) return;
            const res = await deleteRMaterial(currentMaterial?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting product', {variant:'error'});
        }
    }


    const content = currentMaterial ? `Are you sure you want to delete raw material ${currentMaterial?.materialName} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Raw Materials</span>
        <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentMaterial={currentMaterial} setCurrentMaterial={setCurrentMaterial} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Raw Material" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IRMaterial)=>row._id}
                        rows={materials}
                        columns={RMaterialColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  supplier: false,
                                  qStatus: false,
                                  note: false,
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                  qReceived: false,
                                  qRejected: false,
                                  qUsed: false,
                                  discount: false,
                                  charges: false,
                                  yield: false,
                                  reason: false,
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

export default RMaterialTable