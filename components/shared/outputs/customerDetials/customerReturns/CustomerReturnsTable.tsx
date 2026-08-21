import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IReturns } from "@/lib/models/returns.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { CustomerReturnsColumns } from "./CustomerReturnsColumns";

type CustomerReturnsTableProps = {
    isPending:boolean;
    returns:IReturns[];
}

const CustomerReturnsTable = ({isPending, returns}:CustomerReturnsTableProps) => {
    const {currency} = useCurrencyConfig();
    const paginationModel = { page: 0, pageSize: 15 };

    const amount = returns?.reduce((sum, item) => {
        return sum + Number(item?.price || 0);
      }, 0);

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >{`Goods Returned (${currency?.symbol || ''} ${amount})`}</span>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IReturns)=>row._id}
                        rows={returns}
                        columns={CustomerReturnsColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                    reason:false
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

export default CustomerReturnsTable