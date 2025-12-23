'use client'

import { useFetchOrderAndSalesStats } from "@/hooks/fetch/useFetchStats";
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

const SalesAndOrdersChart = () => {
    const {isPending, orderAndSalesStats} = useFetchOrderAndSalesStats();
    const salesAmonunt = orderAndSalesStats?.map((item)=>item.sales) || []
    const ordersAmonunt = orderAndSalesStats?.map((item)=>item.orders) || []
    const xData = orderAndSalesStats?.map(item=>item?.month) || [];
  return (
     <div className='w-[86vw] lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >Monthly Sales Performance (Last 6 Months)</span>
            <span className="greyText2">Sales and Orders made in the last 6 months</span>
        </div>
        {
            isPending ?
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