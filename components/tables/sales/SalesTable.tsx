import { useFetchSales } from "@/hooks/fetch/useFetchSales";
import { deleteSales, getSale } from "@/lib/actions/sales.action";
import { ISales } from "@/lib/models/sales.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useSearchParams } from "next/navigation";
import SalesInfoModal from "./SalesInfoModal";
import { SalesColoumns } from "./SalesColumns";
import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

type SalesTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentSales:ISales | null;
    setCurrentSales:Dispatch<SetStateAction<ISales | null>>;
}

const SalesTable = ({setOpenNew, currentSales, setCurrentSales}:SalesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isToday, setIsToday] = useState(true);
    

    const {sales, isPending, refetch} = useFetchSales(isToday);
    const {currency} = useCurrencyConfig();
    const salesAmount = sales?.reduce((acc, curr) => acc + curr.price, 0);
    // console.log('Sales: ', sales)

    const searchParams = useSearchParams();
        const SalesId = searchParams.get("Id");
    
        useEffect(() => {
            if (!SalesId) return;
    
            let isMounted = true;
    
            const fetchSales = async () => {
                try {
                const res = await getSale(SalesId);
                if (!isMounted) return;
    
                const item = res.payload as ISales;
                if (!res.error) {
                    setCurrentSales(item);
                    setShowInfo(true);
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching sales record", { variant: "error" });
                }
                }
            };
    
            fetchSales();
    
            return () => {
                isMounted = false;
            };
        }, [SalesId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:ISales)=>{
        setCurrentSales(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:ISales)=>{
        setShowInfo(true);
        setCurrentSales(item);
    }

    const handleRefund = (item:ISales)=>{
        setShowDelete(true);
        setCurrentSales(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentSales(null);
    }

    const handleRefundItem = async()=>{
        try {
            if(!currentSales) return;
            const res = await deleteSales(currentSales?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting Sales', {variant:'error'});
        }
    }


    const content = `Are you sure you want to refund this sale record? This will create a refund record for this sale and remove it from here.`

  return (
    <div className='table-main2' >
        <div className="flex flex-row gap-4 items-center justify-between">
            <span className='font-bold text-xl' >Sold {currency?.symbol||''} {salesAmount}</span>
            <div className="flex flex-row items-center gap-1">
                <span className="font-semibold text-sm" >Show only today </span>
                <CustomCheckV2 uncheckedTip="Show records for today" checkedTip="Show all sales records" checked={isToday} setChecked={setIsToday} />
            </div>
        </div>
        <SalesInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentSale={currentSales} setCurrentSale={setCurrentSales} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleRefundItem} title="Delete Sales" content={content} />
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
                        columns={SalesColoumns(handleInfo, handleEdit, handleRefund)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                  org:false,
                                  narration:false,
                                  discount:false,
                                  charges:false,
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

export default SalesTable