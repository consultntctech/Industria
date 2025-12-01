import { useFetchReturns } from "@/hooks/fetch/useFetchReturns";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReturnsInfoModal from "./ReturnsInfoModal";
import CustomCheckV2 from "@/components/misc/CustomCheckV2";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { getReturn } from "@/lib/actions/returns.action";
import { IReturns } from "@/lib/models/returns.model";
import { ReturnsColumns } from "./ReturnsColumns";
import ReturnsCompModal from "./ReturnsCompModal";


const ReturnsTable = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isToday, setIsToday] = useState(true);
    const [currentReturns, setCurrentReturns] = useState<IReturns | null>(null);
    

    const {returns, isPending, refetch} = useFetchReturns(isToday);
    const {currency} = useCurrencyConfig();
    const salesAmount = returns?.reduce((acc, curr) => acc + curr.price, 0);
    // console.log('Returns: ', sales)
    const searchParams = useSearchParams();
    const ReturnsId = searchParams.get("Id");


    useEffect(() => {
        if (!ReturnsId) return;

        let isMounted = true;

        const fetchReturns = async () => {
            try {
            const res = await getReturn(ReturnsId);
            if (!isMounted) return;

            const item = res.payload as IReturns;
            if (!res.error) {
                setCurrentReturns(item);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching returns record", { variant: "error" });
            }
            }
        };

        fetchReturns();

        return () => {
            isMounted = false;
        };
    }, [ReturnsId]);


    const paginationModel = { page: 0, pageSize: 15 };


    const handleInfo = (item:IReturns)=>{
        setShowInfo(true);
        setCurrentReturns(item);
    }

    const handleRefund = (item:IReturns)=>{
        setShowDelete(true);
        setCurrentReturns(item);
    }


  return (
    <div className='table-main2' >
        <div className="flex flex-row gap-4 items-center justify-between">
            <span className='font-bold text-xl' >Returned {currency?.symbol||''} {salesAmount}</span>
            <div className="flex flex-row items-center gap-1">
                <span className="font-semibold text-sm" >Show only today </span>
                <CustomCheckV2 uncheckedTip="Show records for today" checkedTip="Show all sales records" checked={isToday} setChecked={setIsToday} />
            </div>
        </div>
        <ReturnsInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentReturn={currentReturns} setCurrentReturn={setCurrentReturns} />
        <ReturnsCompModal currentReturn={currentReturns} setCurrentReturn={setCurrentReturns} open={showDelete} setOpen={setShowDelete} refetch={refetch} />
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
                        columns={ReturnsColumns(handleInfo, handleRefund)}
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
                                  reason:false,
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

export default ReturnsTable