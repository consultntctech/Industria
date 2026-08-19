import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { StorageRMColumns } from "./StorageRMColumns";

type StorageRMTableProps = {
    isPending:boolean;
    materials:IRMaterial[];
}

const StorageRMTable = ({isPending, materials}:StorageRMTableProps) => {

    const paginationModel = { page: 0, pageSize: 15 };

    const items = materials?.reduce((sum, item) => {
        return sum + Number(item?.qAccepted || 0);
      }, 0);

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Raw Materials (${items})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IRMaterial)=>row._id}
                        rows={materials}
                        columns={StorageRMColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  suppliers: false,
                                  dateReceived:false,
                                  qReceived: false,
                                  qRejected: false,
                                  qUsed: false,
                                  discount: false,
                                  charges: false,
                                  qStatus: false,
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

export default StorageRMTable