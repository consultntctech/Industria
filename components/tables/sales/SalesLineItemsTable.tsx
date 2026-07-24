import { useFetchAvailableLineItems } from '../../../hooks/fetch/useFetchLineItems';
import { ISoldItem } from "@/types/Types";
import { ILineItem } from "@/lib/models/lineitem.model";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { OrderLineItemsColumns } from "../orders/OrderLineItemsColumns";
import { ISales } from "@/lib/models/sales.model";

type SalesLineItemsTableProps = {
    currentSales?: ISales | null;
    needed: ISoldItem[];
    setLines: Dispatch<SetStateAction<ILineItem[]>>;
    lines: ILineItem[];
}

const SalesLineItemsTable = ({currentSales, needed, lines, setLines}:SalesLineItemsTableProps) => {
    const {lineItems, isPending} = useFetchAvailableLineItems();
    const Ps = useMemo(() => (currentSales?.products || []) as ILineItem[], [currentSales]);

    const items = useMemo(()=>{
        const map = new Map<string, ILineItem>();
        lineItems.forEach(item=>map.set(item._id, item));
        Ps.forEach(item=>map.set(item._id, item));
        return Array.from(map.values());
    }, [lineItems, Ps]);
    
    const rowSelectionModel = useMemo(()=>({
        type: 'include' as const,
        ids: new Set(lines.map(item=>item._id))
    }), [lines]);

    const paginationModel = { page: 0, pageSize: 5 };

   
  return (
    <div className='max-w-[78vw] xl:max-w-[74vw] bg-white gap-4 p-4 flex flex-col rounded border border-gray-200' >
        <span className="font-semibold text-base" >Select line items</span>
        <div className="flex flex-wrap gap-4">
            {
                needed.map((item, index)=>{
                    return(
                        <div className="flex gap-1 bg-white rounded border border-gray-200 px-2 py-1" key={index} >
                            <span className={`font-semibold text-sm text-green-500`} >{`${item?.name}: ${item?.quantity}`}</span>
                        </div>
                    )
                })
            }
        </div>

            <Paper className='w-full' sx={{ height: 'auto', }}>
                <DataGrid
                    loading={isPending}
                    getRowId={(row:ILineItem)=>row._id}
                    rows={items}
                    columns={OrderLineItemsColumns()}
                    rowSelectionModel={rowSelectionModel}
                    onRowSelectionModelChange={(newSelectionModel) => {
                        let selectedItems: ILineItem[];

                        if (newSelectionModel.type === 'include') {
                            selectedItems = items.filter(item =>
                                newSelectionModel.ids.has(item._id)
                            );
                        } else {
                            // type === 'exclude': everything is selected except these ids
                            selectedItems = items.filter(item =>
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

export default SalesLineItemsTable