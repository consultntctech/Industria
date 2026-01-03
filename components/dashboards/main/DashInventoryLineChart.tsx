import { IDashboardStats } from "@/types/Types"
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

type DashInventoryLineChartProps={
    stats: IDashboardStats | null | undefined;
    isPending: boolean;
}

const DashInventoryLineChart = ({ stats, isPending }: DashInventoryLineChartProps) => {
    const xData = stats?.inventory?.map(item=>item?.month) || [];
    const raw = stats?.inventory?.map(item=>item?.rawMaterial) || [];
    const finished = stats?.inventory?.map(item=>item?.finishedGood) || [];
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow  flex-2 rounded-2xl" >
        <div className="flex flex-col md:flex-row gap-2 md:justify-between">
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="semibold">Material Flow Analysis</span>
                <span className="greyText2">Overview of products stocks</span>
            </div>
                        
        </div>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:raw,  color:'#0076D1', label:'Raw Materials', id:'rawMaterials', showMark:false},
                    {data:finished, color:'teal', label:'Finished Goods', id:'finishedGoods', showMark:false}
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                // slots={{mark:CustomMark(salesAmonunt)}}
            />
        }
    </div>
  )
}

export default DashInventoryLineChart