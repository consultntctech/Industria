import { IOrder } from "@/lib/models/order.model";
import { useFetchAvailableLineItemsByProducts } from '../../../hooks/fetch/useFetchLineItems';
import { INeed, OrderSelectType } from "@/types/Types";
import { ILineItem } from "@/lib/models/lineitem.model";
import { Dispatch, SetStateAction } from "react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { OrderLineItemsColumns } from "./OrderLineItemsColumns";


type OrderLineItemsTableProps = {
    currentOrder: IOrder | null;
    needed: INeed[];
    setLines: Dispatch<SetStateAction<ILineItem[]>>;
}

const OrderLineItemsTable = ({currentOrder, needed, setLines}:OrderLineItemsTableProps) => {
    const items = currentOrder?.products as OrderSelectType[];
    const productIds = items.map(item => item.product._id);
    const {lineItems, isPending} = useFetchAvailableLineItemsByProducts(productIds);

    

    const paginationModel = { page: 0, pageSize: 5 };

   
  return (
    <div className='max-w-[78vw] xl:max-w-[74vw] bg-white gap-4 p-4 flex flex-col rounded border border-gray-200' >
        <span className="font-semibold text-base" >Select line items</span>
        <div className="flex flex-wrap gap-4">
            {
                needed.map((item, index)=>{
                    const selected = item.selected === item.quantity;
                    return(
                        <div className="flex gap-1 bg-white rounded border border-gray-200 px-2 py-1" key={index} >
                            <span className={`font-semibold text-sm ${selected?'text-green-500':'text-red-500'}`} >{selected? `${item.product}: Selected`:`${item.product}:  ${item?.selected}/${item.quantity} selected` }</span>
                        </div>
                    )
                })
            }
        </div>

            <Paper className='w-full' sx={{ height: 'auto', }}>
                <DataGrid
                    loading={isPending}
                    getRowId={(row:ILineItem)=>row._id}
                    rows={lineItems}
                    columns={OrderLineItemsColumns()}
                    onRowSelectionModelChange={(newSelectionModel) => {
                        let selectedItems: ILineItem[];

                        if (newSelectionModel.type === 'include') {
                            selectedItems = lineItems.filter(item =>
                                newSelectionModel.ids.has(item._id)
                            );
                        } else {
                            // type === 'exclude': everything is selected except these ids
                            selectedItems = lineItems.filter(item =>
                                !newSelectionModel.ids.has(item._id)
                            );
                        }

                        setLines(selectedItems);
                    }}
                    initialState={{ 
                        pagination: { paginationModel },
                        columns:{
                            columnVisibilityModel:{
                                name:false,
                                serialNumber:true,
                                createdAt:false,
                            }
                            }
                        }}
                    pageSizeOptions={[5, 10, 15, 20, 30, 50, 100]}
                    // checkboxSelection
                    className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                    sx={{ border: 0 }}
                    // slots={{toolbar:GridToolbar}}
                    showToolbar
                    checkboxSelection
                    slotProps={{
                        toolbar:{
                            showQuickFilter:true,
                            csvOptions:{disableToolbarButton:true},
                            printOptions:{hideFooter:true, hideToolbar:true, disableToolbarButton:true}
                        }
                    }}
                />
            </Paper>
    </div>
  )
}

export default OrderLineItemsTable