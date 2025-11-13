import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProdApprovalColumns } from './ProdApprovalColumns'
import { getProdApproval } from '@/lib/actions/prodapproval.action'
import { IProdApproval } from '@/lib/models/prodapproval.model'
import { useFetchProdApprovals } from '@/hooks/fetch/useFetchProdApprovals'
import ProdApprovalInfoModal from './ProdApprovalInfoModal'


const ProdApprovalTable = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentProdApproval, setCurrentProdApproval] = useState<IProdApproval | null>(null);
    const {prodApprovals, isPending, refetch} = useFetchProdApprovals();
    const searchParams = useSearchParams();
    const appId = searchParams.get("Id");

    useEffect(() => {
        if (!appId) return;

        let isMounted = true;

        const fetchItem = async () => {
            try {
            const res = await getProdApproval(appId);
            if (!isMounted) return;

            const userData = res.payload as IProdApproval;
            if (!res.error) {
                setCurrentProdApproval(userData);
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

    const handleEdit = (user:IProdApproval)=>{
        setCurrentProdApproval(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


   



  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Requests for Approval</span>
        {/* <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProdItem={currentProdItem} setCurrentProdApproval={setCurrentProdApproval} /> */}
        {/* <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Item" content={content} /> */}
        <ProdApprovalInfoModal refetch={refetch} openNew={openNew} setOpenNew={setOpenNew} currentProdApproval={currentProdApproval} setCurrentProdApproval={setCurrentProdApproval} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProdApproval)=>row._id}
                        rows={prodApprovals}
                        columns={ProdApprovalColumns( handleEdit)}
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

export default ProdApprovalTable