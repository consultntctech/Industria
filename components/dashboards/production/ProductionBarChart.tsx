import { IProductionStats } from "@/types/Types";
import { LinearProgress } from "@mui/material"
import { LineChart } from "@mui/x-charts";

type ProductionBarChartProps = {
    isPending: boolean;
    stats: IProductionStats | null | undefined;
}

const ProductionBarChart = ({isPending, stats}:ProductionBarChartProps) => {
    const xData = stats?.outputTrend?.map(item=>item?.month) || [];
    const aOutput = stats?.outputTrend?.map(item=>item?.efficiencyPercent) || [];
    const xOutput = stats?.outputTrend?.map(item=>item?.xEfficiencyPercent) || [];
  return (
    <div className="sm:w-full p-6 rounded-2xl shadow-xl flex flex-col gap-4 border border-slate-200" >
        <span className="semibold" >Production Efficiency Trend</span>
       
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:xOutput, valueFormatter:(value)=>`${value}%`,  color:'#0076D1', label:'Expected Output', id:'xoutput'},
                    {data:aOutput, valueFormatter:(value)=>`${value}%`,  color:'teal', label:'Actual Output', id:'aoutput'},
                ]}
                yAxis={[{ disableLine:true, disableTicks:true, valueFormatter:(value:number)=>`${value}%`}]}
                height={300}
                // slots={{mark:CustomMark(salesAmonunt)}}
            />
        }
    </div>
  )
}

export default ProductionBarChart