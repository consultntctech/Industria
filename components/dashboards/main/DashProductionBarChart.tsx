import {  IDashboardStats } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

type DashProductionBarChartProps={
    stats: IDashboardStats | null | undefined;
    isPending: boolean;
    // setType: Dispatch<SetStateAction<IProductType | ''>>;
}

const DashProductionBarChart = ({stats, isPending}:DashProductionBarChartProps) => {
    const yData = stats?.production?.map(item=>item?.quantity) || [];
    const xData = stats?.production?.map(item=>item?.day) || [];
    
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow  flex-2 rounded-2xl" >
        <div className="flex flex-col md:flex-row gap-2 md:justify-between">
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="semibold">Daily Production Volume</span>
                <span className="greyText2">Units produced each day this week</span>
            </div>

                    
        </div>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <BarChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {
                    data: yData, /*barLabel:'value', barLabelPlacement:'outside',*/
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

export default DashProductionBarChart