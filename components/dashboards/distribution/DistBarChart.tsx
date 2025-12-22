import { IPackageStats } from "@/types/Types"
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

type DistBarChartProps={
    stats: IPackageStats | null | undefined;
    isPending: boolean;
}

const DistBarChart = ({stats, isPending}:DistBarChartProps) => {
    const xData = stats?.daily?.map(item=>item?.day) || [];
    const yData = stats?.daily?.map(item=>item?.quantity) || [];
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow border border-slate-200 flex-2 rounded-2xl" >
        <span className="semibold">Daily Packaging Trend</span>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <BarChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {
                    data: yData, barLabel:'value', barLabelPlacement:'outside',
                    color:'#0076D1',
                    }
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                
            />
        }
    </div>
  )
}

export default DistBarChart