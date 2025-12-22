import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
// import { useSearchParams } from 'next/navigation'
import { IPackage } from '@/lib/models/package.model'
import { useFetchPackages } from '@/hooks/fetch/useFetchPackages'
import { PackagesMiniColumns } from './PackagesMiniColumns'


const PackageMiniTable = () => {

    const {packages, isPending} = useFetchPackages();
    // const searchParams = useSearchParams();
    // const PackageId = searchParams.get("Id");

   



    const paginationModel = { page: 0, pageSize: 15 };




  return (
    <div className='table-main2' >
        {/* <span className='font-bold text-xl' >Recent Packaging Activities</span> */}
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
                        columns={PackagesMiniColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            
                         }}
                        pageSizeOptions={[5, 10, 15, 20, 30, 50, 100]}
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

export default PackageMiniTable