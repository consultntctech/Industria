'use client'
import { useFetchMonthlyTransactionCounts } from "@/hooks/fetch/useFetchStats";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

const ReturnsTransChart = () => {
    const {isPending, transactCount} = useFetchMonthlyTransactionCounts()
    const returns = transactCount?.return;
    const yData = returns?.map(item=>item?.quantity);
    const xData = returns?.map(item=>item?.month);
  return (
     <div className='w-[86vw] lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >Returns Counts (Last 6 Months)</span>
            <span className="greyText2">Number of Returns made in the last 6 months</span>
        </div>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <BarChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {
                    data: yData, barLabel:'value', barLabelPlacement:'outside',
                    color:'black',
                    }
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                
            />
        }
    </div>
  )
}

export default ReturnsTransChart