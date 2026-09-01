import {  IMonthlyStatusCount } from "@/types/EquipmentTypes";
import { QuanityOrPrice } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { RadarChart } from "@mui/x-charts";

type EquipMonthlyRadarChartProps = {
    isPending: boolean;
    data: IMonthlyStatusCount;
    type: QuanityOrPrice;
    limit: number;
}

const EquipMonthlyRadarChart = ({isPending, data, type,  limit}:EquipMonthlyRadarChartProps) => {
    const maintenance = {
        label: 'Maintenance',
        data: type === 'quantity' ? data?.Maintenance.map(item=> item?.count) : data?.Maintenance.map(item=> item?.price),
        color: 'crimson'
    }
    const inUse = {
        label: 'In Use',
        data: type === 'quantity' ? data?.['In Use'].map(item=> item?.count) : data?.['In Use'].map(item=> item?.price),
        color: 'orange'
    }

    const available = {
        label: 'Available',
        data: type === 'quantity' ? data?.Available.map(item=> item?.count) : data?.Available.map(item=> item?.price),
        color: 'teal'
    }
    const months = data?.Available.map(item=> item?.month)
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow border border-slate-200 flex-2 rounded-2xl" >
        <span className="semibold">{`Equipment by status (last ${limit} months)`}</span>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            
            <RadarChart
                height={300}
                series={[
                    available, inUse, maintenance
                ]}
                radar={{
                    max:120,
                    metrics: months
                }}
            />
        }
    </div>
  )
}

export default EquipMonthlyRadarChart