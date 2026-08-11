import { MultiCustomMark } from "@/functions/JsxFunctions";
import { ICostStats } from "@/types/FinanceTypes";
import { LinearProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts";

type ProductionCostChartProps = {
    stats: ICostStats | null | undefined;   
    isPending: boolean
}


const ProductionCostChart = ({ stats, isPending }: ProductionCostChartProps) => {
    const pData = stats?.production?.pCost || [];
    const labourData = stats?.production?.labourCost || [];
    const extraData = stats?.production?.extraCost || [];

    const pyData = pData.map(item=>item.cost);
    const lyData = labourData.map(item=>item.cost);
    const eyData = extraData.map(item=>item.cost);

    const xData = pData.map(item=>item.month) || [];

    const marks = {
        production:pyData,
        labour: lyData,
        extra: eyData
    }
    // const yData = sales?.map(item=>item?.quantity);

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)

    return (
        <div className='p-2 rounded flex flex-col gap-4 border border-slate-200'>
        <span className="text-base font-medium text-gray-600" >Production</span>
        {
            isPending?
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:pyData, color:'#0076D1', label:'Production', id:'production'},
                    {data:lyData, color:'teal', label:'Labour', id:'labour'},
                    {data:eyData, color:'orange', label:'Extra', id:'extra'},
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                slots={{
                    mark:MultiCustomMark(marks)
                }}
            />
        }
    </div>
    )
}


export default ProductionCostChart