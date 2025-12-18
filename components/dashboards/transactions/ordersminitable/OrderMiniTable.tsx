'use client'
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { IOrder } from "@/lib/models/order.model";
import { useFetchOrders } from "@/hooks/fetch/useFetchOrders";

import { OrdersMiniColumns } from "./OrdersMiniColumns";



const OrderMiniTable = () => {
    const {orders, isPending} = useFetchOrders();
 
    const paginationModel = { page: 0, pageSize: 5 };

  

  return (
    <div className='table-main1' >
        {/* <div className="flex flex-row gap-4 items-center justify-between">
            <span className='font-bold text-xl' >Ordered {currency?.symbol||''} {ordersAmount}</span>
            <div className="flex flex-row items-center gap-1">
                <span className="font-semibold text-sm" >Show only today </span>
                <CustomCheckV2 uncheckedTip="Show records for today" checkedTip="Show all orders records" checked={isToday} setChecked={setIsToday} />
            </div>
        </div> */}
        
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IOrder)=>row._id}
                        rows={orders?.slice(0, 5)}
                        columns={OrdersMiniColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                         }}
                        pageSizeOptions={[5]}
                        // checkboxSelection
                        className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                        sx={{ border: 0 }}
                        density="compact"
                        // slots={{toolbar:GridToolbar}}
                        // showToolbar
                        slotProps={{
                            toolbar:{
                                showQuickFilter:false,
                                // printOptions:{
                                //     hideFooter:true, hideToolbar:true
                                // }
                            }
                        }}
                    />
                </Paper>
            }
        </div>
    </div>
  )
}

export default OrderMiniTable