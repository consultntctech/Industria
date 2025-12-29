import {  IProductStats, IProductType } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { useState } from "react";

type ProductBarChartProps={
    stats: IProductStats[] | null | undefined;
    isPending: boolean;
    // setType: Dispatch<SetStateAction<IProductType | ''>>;
}

const ProductBarChart = ({stats, isPending}:ProductBarChartProps) => {
    const [type, setType] = useState<IProductType | ''>('');
    const data = stats?.filter(item=>type==='' || item.type===type) || [];
    const xData = data?.map(item=>item?.name) || [];
    const yData = data?.map(item=>item?.stock) || [];
    
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow  flex-2 rounded-2xl" >
        <div className="flex flex-col md:flex-row gap-2 md:justify-between">
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="semibold">Daily Packaging Trend</span>
                <span className="greyText2">Overview of products stocks</span>
            </div>

            <select onChange={(e)=>setType(e.target.value as IProductType | '')} className={`outline-none w-fit border-1 border-gray-300 rounded px-2 py-1 self-end`}  >
                <option  value="">All</option>
                <option  value="Raw Material">Raw Material</option>
                <option value="Finished Good">Finished Good</option>
            </select>            
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

export default ProductBarChart