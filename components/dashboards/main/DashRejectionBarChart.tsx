import { IDashboardStats } from "@/types/Types"
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

type DashRejectionBarChartProps={
    stats: IDashboardStats | null | undefined;
    isPending: boolean;
}

const DashRejectionBarChart = ({ stats, isPending }: DashRejectionBarChartProps) => {
    const xData = stats?.rejection?.map(item=>item?.week) || [];
    const raw = stats?.rejection?.map(item=>item?.rawMaterial) || [];
    const production = stats?.rejection?.map(item=>item?.production) || [];

    // console.log('Rejections: ', stats?.rejection)
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow  flex-2 rounded-2xl" >
        <div className="flex flex-col md:flex-row gap-2 md:justify-between">
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="semibold">Product Rejection Metrics</span>
                <span className="greyText2">Products loss due to rejection</span>
            </div>
                        
        </div>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:raw, area:true, color:'orange', label:'Raw Materials', id:'rawMaterials', showMark:false},
                    {data:production, area:true, color:'darkorange', label:'Finished Goods', id:'finishedGoods', showMark:false}
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                // slots={{mark:CustomMark(salesAmonunt)}}
            />
        }
    </div>
  )
}

export default DashRejectionBarChart