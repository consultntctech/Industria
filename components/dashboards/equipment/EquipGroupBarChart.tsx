import { EquipmentStatsGroup, IGroupedEquipmentCount } from "@/types/EquipmentTypes";
import { QuanityOrPrice } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

type EquipGroupBarChartProps={
    isPending: boolean;
    group: IGroupedEquipmentCount[];
    category: IGroupedEquipmentCount[];
    type: QuanityOrPrice;
    groupType: EquipmentStatsGroup;
    limit: number;
}

const EquipGroupBarChart = ({isPending, group, category, type, groupType, limit}:EquipGroupBarChartProps) => {
  const xData  =  groupType === 'category' ? category.map(item=>item.name) : group.map(item=>item.name);
  const Y1 = groupType === 'category' ? category.map(item=>item.count) : group.map(item=>item.count);
  const Y2 = groupType === 'category' ? category.map(item=>item.price) : group.map(item=>item.price);
  const yData =  type === 'quantity' ? Y1 : Y2;

  // console.log('Category', category);

  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow border border-slate-200 flex-2 rounded-2xl" >
        <span className="semibold">{`Equipment by ${groupType} (last ${limit} months)`}</span>
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

export default EquipGroupBarChart