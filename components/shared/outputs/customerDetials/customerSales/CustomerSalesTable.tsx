import { ISales } from "@/lib/models/sales.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { CustomerSalesColumns } from "./CustomerSalesColumns";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

type CustomerSalesTableProps = {
    isPending:boolean;
    sales:ISales[];
}

const CustomerSalesTable = ({isPending, sales}:CustomerSalesTableProps) => {
    const {currency} = useCurrencyConfig();
    const paginationModel = { page: 0, pageSize: 15 };

    const amount = sales?.reduce((sum, item) => {
        return sum + Number(item?.price || 0);
      }, 0);

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Sales (${currency?.symbol || ''} ${amount})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:ISales)=>row._id}
                        rows={sales}
                        columns={CustomerSalesColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            
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

export default CustomerSalesTable