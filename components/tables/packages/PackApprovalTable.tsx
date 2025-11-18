import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IPackApproval } from '@/lib/models/packapproval.model'
import { useFetchPackApprovals } from '@/hooks/fetch/useFetchPackApprovals'
import { getPackApproval } from '@/lib/actions/packapproval.action'
import ApprovalsApprovalInfoModal from './PackageApproveInfoModal'
import { PackApprovalColumns } from './PackApprovalColumns'



const PackApprovalTable = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentPackApproval, setCurrentPackApproval] = useState<IPackApproval | null>(null);
    const {packApprovals, isPending, refetch} = useFetchPackApprovals();
    const searchParams = useSearchParams();
    const appId = searchParams.get("Id");

    useEffect(() => {
        if (!appId) return;

        let isMounted = true;

        const fetchItem = async () => {
            try {
            const res = await getPackApproval(appId);
            if (!isMounted) return;

            const userData = res.payload as IPackApproval;
            if (!res.error) {
                setCurrentPackApproval(userData);
                setOpenNew(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching approval request", { variant: "error" });
            }
            }
        };

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [appId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IPackApproval)=>{
        setCurrentPackApproval(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


   



  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Requests for Approval</span>
        {/* <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProdItem={currentProdItem} setCurrentPackApproval={setCurrentPackApproval} /> */}
        {/* <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Item" content={content} /> */}
        <ApprovalsApprovalInfoModal refetch={refetch} openNew={openNew} setOpenNew={setOpenNew} currentApproval={currentPackApproval} setCurrentApproval={setCurrentPackApproval} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IPackApproval)=>row._id}
                        rows={packApprovals}
                        columns={PackApprovalColumns( handleEdit)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  note: false,
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

export default PackApprovalTable