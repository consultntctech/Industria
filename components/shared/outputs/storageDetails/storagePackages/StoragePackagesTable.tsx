import { IPackage } from "@/lib/models/package.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { StoragePackColumns } from "./StoragePackColumns";

type StoragePackagesTableProps = {
    isPending: boolean;
    packs: IPackage[];
}
const StoragePackagesTable = ({ isPending, packs }: StoragePackagesTableProps) => {
    const paginationModel = { page: 0, pageSize: 15 };

    const items = packs?.reduce((sum, item) => {
        return sum + Number(item?.quantity || 0) 
      }, 0);
  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Packaging (${items})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IPackage)=>row._id}
                        rows={packs}
                        columns={StoragePackColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdBy: false,
                                  approvedBy:false,
                                  
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

export default StoragePackagesTable