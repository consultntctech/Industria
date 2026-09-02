import DialogueAlet from '@/components/misc/DialogueAlet'
import { useFetchETypes } from '@/hooks/fetch/useFetchETypes'
import { IEType } from '@/lib/models/etype.model'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ETypeInfoModal from './ETypeInfoModal'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { ETypeColumns } from './ETypeColumns';
import { deleteEType, getETypeById } from '@/lib/actions/etype.action';

type ETypeTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentEType:IEType | null;
    setCurrentEType:Dispatch<SetStateAction<IEType | null>>;
}

const ETypeTable = ({setOpenNew, currentEType, setCurrentEType}:ETypeTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {types, isPending, refetch} = useFetchETypes();
    const searchParams = useSearchParams();
    const typeId = searchParams.get("Id");

    useEffect(() => {
        if (!typeId) return;

        let isMounted = true;

        const fetchEType = async () => {
            try {
            const res = await getETypeById(typeId);
            if (!isMounted) return;

            const typeData = res.payload as IEType;
            if (!res.error) {
                setCurrentEType(typeData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching equipment type", { variant: "error" });
            }
            }
        };

        fetchEType();

        return () => {
            isMounted = false;
        };
    }, [typeId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (type:IEType)=>{
        setCurrentEType(type);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (type:IEType)=>{
        setShowInfo(true);
        setCurrentEType(type);
    }

    const handleDelete = (type:IEType)=>{
        setShowDelete(true);
        setCurrentEType(type);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentEType(null);
    }

    const handleDeleteEType = async()=>{
        try {
            if(!currentEType) return;
            const res = await deleteEType(currentEType?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting equipment type', {variant:'error'});
        }
    }


    const content = currentEType ? `Are you sure you want to delete equipment type ${currentEType?.name}? This will also delete all the equipment depending on it. This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Equipment Types</span>
        <ETypeInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentEType={currentEType} setCurrentEType={setCurrentEType} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteEType} title="Delete equipment type" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IEType)=>row._id}
                        rows={types}
                        columns={ETypeColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
                                  createdAt:false,
                                  updatedAt:false,
                                  description:false,
                                  createdBy:false,
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

export default ETypeTable