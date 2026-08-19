import { IProdItem } from "@/lib/models/proditem.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { StoragePMColumns } from "./StoragePMColumns";

type StoragePMTableProps = {
    isPending:boolean;
    materials:IProdItem[];
}

const StoragePMTable = ({isPending, materials}:StoragePMTableProps) => {
    const paginationModel = { page: 0, pageSize: 15 };
    const items = materials?.reduce((sum, item) => {
        return sum + Number(item?.stock || 0) 
      }, 0);
  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Materials (${items})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProdItem)=>row._id}
                        rows={materials}
                        columns={StoragePMColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  materialName: false,
                                  unitPrice: false,
                                  uom: false,
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

export default StoragePMTable