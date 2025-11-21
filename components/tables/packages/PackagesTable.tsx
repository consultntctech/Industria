import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, {   useState } from 'react'
import PackageInfoModal from './PackageInfoModal'
// import { useSearchParams } from 'next/navigation'
import { PackagesColumns } from './PackagesColumns'
import { IPackage } from '@/lib/models/package.model'
import { useFetchPackages } from '@/hooks/fetch/useFetchPackages'
import { deletePackage } from '@/lib/actions/package.action'


const PackageTable = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<IPackage | null>(null);

    const {packages, isPending, refetch} = useFetchPackages();
    // const searchParams = useSearchParams();
    // const PackageId = searchParams.get("Id");

   



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IPackage)=>{
        setCurrentPackage(user);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (user:IPackage)=>{
        setShowInfo(true);
        setCurrentPackage(user);
    }

    const handleDelete = (user:IPackage)=>{
        setShowDelete(true);
        setCurrentPackage(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentPackage(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentPackage) return;
            const res = await deletePackage(currentPackage?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting package', {variant:'error'});
        }
    }


    const content = currentPackage ? `Are you sure you want to delete Package: ${currentPackage.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Packages</span>
        <PackageInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentPackage={currentPackage} setCurrentPackage={setCurrentPackage} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Package" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IPackage)=>row._id}
                        rows={packages}
                        columns={PackagesColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  supervisor: false,
                                  description: false,
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                //   packagingMaterial: false,
                                  useProdBatch: false,
                                  batch: true,
                                  quantity: false,
                                  rejected: false,
                                  qStatus: false,
                                  comment:false,
                                  approvalStatus: false,
                                  approvedBy: false,
                                  storage: true,
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

export default PackageTable