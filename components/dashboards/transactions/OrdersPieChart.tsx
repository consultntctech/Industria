'use client'

import { useFetchOrderStats } from "@/hooks/fetch/useFetchOrders";
import { LinearProgress } from "@mui/material";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";

const OrdersPieChart = () => {
    const {orderStats, isPending} = useFetchOrderStats();
    const settings = {
        // margin: { right: 5 },
        width: 200,
        height: 200,
        hideLegend: false,
    };

    const data = [
        {label:'Pending', value:orderStats?.pending || 0, color:'darkorange', id:'pending'},
        {label:'Fulfilled', value:orderStats?.fulfilled || 0, color:'#0076D1', id:'fulfilled'},
        {label:'Delayed', value:orderStats?.delayed || 0, color:'darkred', id:'delayed'},
    ]

  return (
    <div className='w-[86vw] lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >All-time Order Records (Count of line items)</span>
            <span className="greyText2">An overview of all-time Sales Orders and their status</span>
        </div>
        {
            (isPending) ?
            <LinearProgress className='w-full' />
            :
            <PieChart
                series={[{ innerRadius: 50, outerRadius: 100, data,  arcLabel:'value'}]}
                {...settings}
                // loading
                sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',
                    fontSize: 14,
                    },
                }}
                className='self-center'
                slotProps={{
                    legend: {
                        direction: "horizontal",
                        position: {
                            vertical: "bottom",
                            horizontal: "center",
                        },
                    },
                }}
            />
            
        }
    </div>
  )
}

export default OrdersPieChart