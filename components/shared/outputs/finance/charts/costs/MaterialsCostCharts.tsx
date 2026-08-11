import { MultiCustomMark } from "@/functions/JsxFunctions";
import { ICostStats } from "@/types/FinanceTypes";
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

type MaterialsCostChartProps = {
    stats: ICostStats | null | undefined;   
    isPending: boolean
}


const MaterialsCostChart = ({ stats, isPending }: MaterialsCostChartProps) => {
    const rawData = stats?.rawMaterials || [];
    const pItemsData = stats?.prodItems || [];

    const rawyData = rawData.map(item=>item.cost);
    const pyData = pItemsData.map(item=>item.cost);
    // const eyData = extraData.map(item=>item.cost);

    const xData = rawData.map(item=>item.month) || [];

    const marks = {
        raw:rawyData,
        items: pyData,
    }
    // const yData = sales?.map(item=>item?.quantity);

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)

    return (
        <div className='p-2 rounded flex flex-col gap-4 border border-slate-200'>
            <span className="text-base font-medium text-gray-600" >Materials</span>
        {
            isPending?
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:rawyData, color:'#0076D1', label:'Raw Materials', id:'raw', area:true},
                    {data:pyData, color:'orange', label:'Pack. Items', id:'pack', area:true},
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                slots={{
                    mark:MultiCustomMark(marks)
                }}
                sx={{
                    '& .MuiAreaElement-series-raw': { fillOpacity: 0.5 },
                    '& .MuiAreaElement-series-pack': { fillOpacity: 0.5 },
                }}
            />
        }
    </div>
    )
}


export default MaterialsCostChart