import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOrder } from "@/lib/models/order.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { CustomerOrdersColumns } from "./CustomerOrdersColumns";

type CustomerOrdersTableProps = {
    isPending:boolean;
    orders:IOrder[];
}

const CustomerOrdersTable = ({isPending, orders}:CustomerOrdersTableProps) => {
    const {currency} = useCurrencyConfig();
    const paginationModel = { page: 0, pageSize: 15 };

    const amount = orders?.reduce((sum, item) => {
        return sum + Number(item?.price || 0);
      }, 0);

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Shipped Orders (${currency?.symbol || ''} ${amount})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IOrder)=>row._id}
                        rows={orders}
                        columns={CustomerOrdersColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                    instructions: false,
                                    description: false,
                                    late: false,
                                    status: false,
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

export default CustomerOrdersTable