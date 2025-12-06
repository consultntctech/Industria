import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import OrdersInfoModal from "./OrdersInfoModal";
import { IOrder } from "@/lib/models/order.model";
import { useFetchOrders } from "@/hooks/fetch/useFetchOrders";
import { deleteOrder, getOrder } from "@/lib/actions/order.action";
import { OrdersColumns } from "./OrdersColumns";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useQueryClient } from "@tanstack/react-query";
import OrdersFulfillCompModal from "./OrdersFulfillCompModal";
import { ICustomer } from "@/lib/models/customer.model";

type OrdersTableProps = {
    setOpenNew: Dispatch<React.SetStateAction<boolean>>;
    currentOrder: IOrder | null;
    setCurrentOrder:Dispatch<React.SetStateAction<IOrder | null>>;
}

const OrderTable = ({setOpenNew, currentOrder, setCurrentOrder}:OrdersTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isToday, setIsToday] = useState(true);
    const [showFulfill, setShowFulfill] = useState(false);
    

    const {orders, isPending, refetch} = useFetchOrders(isToday);
    const {currency} = useCurrencyConfig();
    const utils = useQueryClient();
    const ordersAmount = orders?.reduce((acc, curr) => acc + curr.price, 0);
    // console.log('Order: ', orders)
    const searchParams = useSearchParams();
    const OrderId = searchParams.get("Id");


    useEffect(() => {
        if (!OrderId) return;

        let isMounted = true;

        const fetchOrder = async () => {
            try {
            const res = await getOrder(OrderId);
            if (!isMounted) return;

            const item = res.payload as IOrder;
            if (!res.error) {
                setCurrentOrder(item);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching returns record", { variant: "error" });
            }
            }
        };

        fetchOrder();

        return () => {
            isMounted = false;
        };
    }, [OrderId]);


    const paginationModel = { page: 0, pageSize: 15 };


    const handleInfo = (item:IOrder)=>{
        setShowInfo(true);
        setCurrentOrder(item);
    }

    const handleEdit = (item:IOrder)=>{
        setOpenNew(true);
        setCurrentOrder(item);
    }

    const handleFulfill = (item:IOrder)=>{
        setShowFulfill(true);
        setCurrentOrder(item);
    }

    const handleDelete = (item:IOrder)=>{
        setShowDelete(true);
        setCurrentOrder(item);
    }

    const handleDeleteOrder = async()=>{
        try {
            if(!currentOrder?._id) return;
            const res = await deleteOrder(currentOrder?._id);
            enqueueSnackbar(res?.message, {variant:res.error?'error':'success'});
            if(!res.error){
                refetch();
                utils.invalidateQueries({ queryKey: ['orders'] });
                setShowDelete(false);
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting order', {variant:'error'});
        }
    }

    const content = `You are about to delete order record for ${(currentOrder?.customer as ICustomer)?.name}. This action is irreversible. Are you sure you want to proceed?`;

  return (
    <div className='table-main2' >
        <div className="flex flex-row gap-4 items-center justify-between">
            <span className='font-bold text-xl' >Ordered {currency?.symbol||''} {ordersAmount}</span>
            <div className="flex flex-row items-center gap-1">
                <span className="font-semibold text-sm" >Show only today </span>
                <CustomCheckV2 uncheckedTip="Show records for today" checkedTip="Show all orders records" checked={isToday} setChecked={setIsToday} />
            </div>
        </div>
        <DialogueAlet open={showDelete} title="Delete Order" content={content} handleClose={()=>setShowDelete(false)} disagreeText="No" agreeText="Yes" agreeClick={handleDeleteOrder} />
        <OrdersInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentOrder={currentOrder} setCurrentOrders={setCurrentOrder} />
        <OrdersFulfillCompModal open={showFulfill} setOpen={setShowFulfill} setCurrentOrder={setCurrentOrder} currentOrder={currentOrder} refetch={refetch} />
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
                        columns={OrdersColumns(handleInfo, handleEdit, handleFulfill, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                  org:false,
                                  description:false,
                                  late:false
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

export default OrderTable