import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IStorage } from '@/lib/models/storage.model'
import { deleteStorage, getStorage } from '@/lib/actions/storage.action'
import { useFetchStorages } from '@/hooks/fetch/useFetchStorages'
import { StorageColumns } from './StorageColumns'

type StorageTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentStorage:IStorage | null;
    setCurrentStorage:Dispatch<SetStateAction<IStorage | null>>;
}

const StorageTable = ({setOpenNew, currentStorage, setCurrentStorage}:StorageTableProps) => {
    const [showDelete, setShowDelete] = useState(false);

    const {storages, isPending, refetch} = useFetchStorages();
    const searchParams = useSearchParams();
    const StorageId = searchParams.get("Id");

    useEffect(() => {
        if (!StorageId) return;

        let isMounted = true;

        const fetchUser = async () => {
            try {
            const res = await getStorage(StorageId);
            if (!isMounted) return;

            const userData = res.payload as IStorage;
            if (!res.error) {
                setCurrentStorage(userData);
                setOpenNew(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching storage location", { variant: "error" });
            }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [StorageId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IStorage)=>{
        setCurrentStorage(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

   

    const handleDelete = (user:IStorage)=>{
        setShowDelete(true);
        setCurrentStorage(user);
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setShowDelete(false);
        setCurrentStorage(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentStorage) return;
            const res = await deleteStorage(currentStorage?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting storage location', {variant:'error'});
        }
    }


    const content = currentStorage ? `Are you sure you want to delete storage ${currentStorage.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Storages Location</span>
        {/* <StorageInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentStorage={currentStorage} setCurrentStorage={setCurrentStorage} /> */}
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Storage Location" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IStorage)=>row._id}
                        rows={storages}
                        columns={StorageColumns( handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  description: false,
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

export default StorageTable