import { ICostStats } from "@/types/FinanceTypes";
import { LinearProgress } from "@mui/material";
import { RadarChart } from '@mui/x-charts/RadarChart';
type PackagingCostChartProps = {
    stats: ICostStats | null | undefined;   
    isPending: boolean
}


const PackagingCostChart = ({ stats, isPending }: PackagingCostChartProps) => {
    const packData = stats?.packages || [];

    const yData = packData.map(item=>item.cost);

    const xData = packData.map(item=>item.month) || [];

    const max = (Math.max(...yData)) ?? 300;

    
    // const yData = sales?.map(item=>item?.quantity);

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)

    return (
        <div className='p-2 rounded flex flex-col gap-4 border border-slate-200'>
            <span className="text-base font-medium text-gray-600" >Packages</span>
        {
            isPending?
            <LinearProgress className='w-full' />
            :
            <RadarChart
                series={[
                    {data:yData, color:'#0076D1', label:'Packaging', id:'packaging'},
                ]}
                height={300}
                radar={{
                    max,
                    metrics:xData
                }}
            />
        }
    </div>
    )
}


export default PackagingCostChart