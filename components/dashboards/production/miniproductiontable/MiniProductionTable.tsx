import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useFetchProductions } from '@/hooks/fetch/useFetchProductions'
import { IProduction } from '@/lib/models/production.model'
import { MiniProductionColumns } from './MiniProductionColumns'


const MiniProductionTable = () => {
    const {productions, isPending} = useFetchProductions();
    // console.log('Materials: ', materials)
    const paginationModel = { page: 0, pageSize: 15 };

    





  return (
    <div className='table-main2' >
        {/* <span className='font-bold text-xl' >Productions</span> */}
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProduction)=>row._id}
                        rows={productions?.slice(0, 6)}
                        columns={MiniProductionColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            // columns:{
                            //     columnVisibilityModel:{
                            //       org:false,
                            //       createdBy:false,
                            //       createdAt:false,
                            //       updatedAt:false,
                            //       inputQuantity:false,
                            //     }
                            //   }
                         }}
                        pageSizeOptions={[5, 10]}
                        // checkboxSelection
                        className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                        sx={{ border: 0 }}
                        // slots={{toolbar:GridToolbar}}
                        showToolbar={false}
                        slotProps={{
                            toolbar:{
                                showQuickFilter:false,
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

export default MiniProductionTable