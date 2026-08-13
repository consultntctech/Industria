import DialogueAlet from '@/components/misc/DialogueAlet'
import { useFetchLabourers } from '@/hooks/fetch/useFetchLabourers'
import { deleteLabourer, getLabourer } from '@/lib/actions/labourer.action'
import { ILabourer } from '@/lib/models/labourer.model'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import LabourerInfoModal from './LabourerInfoModal'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { LabourerColoumns } from './LabourerColumns';

type LabourerTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentLabourer:ILabourer | null;
    setCurrentLabourer:Dispatch<SetStateAction<ILabourer | null>>;
}

const LabourerTable = ({setOpenNew, currentLabourer, setCurrentLabourer}:LabourerTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {labourers, isPending, refetch} = useFetchLabourers();
    const searchParams = useSearchParams();
    const labourerId = searchParams.get("Id");

    useEffect(() => {
        if (!labourerId) return;

        let isMounted = true;

        const fetchLabourer = async () => {
            try {
            const res = await getLabourer(labourerId);
            if (!isMounted) return;

            const labourerData = res.payload as ILabourer;
            if (!res.error) {
                setCurrentLabourer(labourerData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching labourer", { variant: "error" });
            }
            }
        };

        fetchLabourer();

        return () => {
            isMounted = false;
        };
    }, [labourerId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (labourer:ILabourer)=>{
        setCurrentLabourer(labourer);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (labourer:ILabourer)=>{
        setShowInfo(true);
        setCurrentLabourer(labourer);
    }

    const handleDelete = (labourer:ILabourer)=>{
        setShowDelete(true);
        setCurrentLabourer(labourer);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentLabourer(null);
    }

    const handleDeleteLabourer = async()=>{
        try {
            if(!currentLabourer) return;
            const res = await deleteLabourer(currentLabourer?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting labourer', {variant:'error'});
        }
    }


    const content = currentLabourer ? `Are you sure you want to delete labourer ${currentLabourer?.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Labourers</span>
        <LabourerInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentLabourer={currentLabourer} setCurrentLabourer={setCurrentLabourer} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteLabourer} title="Delete Labourer" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:ILabourer)=>row._id}
                        rows={labourers}
                        columns={LabourerColoumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
                                  createdAt:false,
                                  updatedAt:false,
                                  note:false,
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

export default LabourerTable