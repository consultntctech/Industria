import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import {useState } from 'react'
import { useFetchProductions } from '@/hooks/fetch/useFetchProductions'
import { deleteProduction } from '@/lib/actions/production.action'
import { IProduction } from '@/lib/models/production.model'
import { ProductionColumns } from './ProductionColumns'


const ProductionTable = () => {
    const [showDelete, setShowDelete] = useState(false);
    const [currentProduction, setCurrentProduction] = useState<IProduction|null>(null);
    const {productions, isPending, refetch} = useFetchProductions();

    // console.log('Materials: ', materials)
    const paginationModel = { page: 0, pageSize: 15 };

    const handleClose = () => {
        setShowDelete(false);
        setCurrentProduction(null);
    }


    const handleDelete = (item:IProduction)=>{
        setShowDelete(true);
        setCurrentProduction(item);
    }


    const handleDeleteItem = async()=>{
        try {
            if(!currentProduction) return;
            const res = await deleteProduction(currentProduction?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting production', {variant:'error'});
        }
    }


    const content = currentProduction ? `Are you sure you want to delete production ${currentProduction?.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Productions</span>
        {/* <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProduction={currentProduction} setCurrentProduction={setCurrentProduction} /> */}
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Production" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProduction)=>row._id}
                        rows={productions}
                        columns={ProductionColumns(handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                  inputQuantity:false,
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

export default ProductionTable