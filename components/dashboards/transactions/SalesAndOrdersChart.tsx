'use client'
import { useFetchOrdersByMonth } from "@/hooks/fetch/useFetchOrders";
import { useFetchSalesByMonth } from "@/hooks/fetch/useFetchSales";
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

const SalesAndOrdersChart = () => {
    const {sales, isPending} = useFetchSalesByMonth();
    const {orders, isPending:ordering} = useFetchOrdersByMonth();
    const salesAmonunt = sales?.map((item)=>item.quantity)
    const ordersAmonunt = orders?.map((item)=>item.quantity)
    const xData = sales?.map(item=>item?.month);
  return (
     <div className='w-full lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >Monthly Sales Performance (Last 6 Months)</span>
            <span className="greyText2">Sales and Orders made in the last 6 months</span>
        </div>
        {
            (isPending || ordering) ?
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:salesAmonunt,  color:'#0076D1', label:'Sales', id:'sales'},
                    {data:ordersAmonunt, color:'teal', label:'Orders', id:'orders'},
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                // slots={{mark:CustomMark(salesAmonunt)}}
            />
        }
    </div>
  )
}

export default SalesAndOrdersChart