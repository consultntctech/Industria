'use client'

import { IDashStats } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";

type DashRMaterialPieProps = {
    stats: IDashStats | null | undefined;
    isPending: boolean;
}

const DashRMaterialPie = ({stats, isPending}: DashRMaterialPieProps) => {
    const settings = {
        // margin: { right: 5 },
        width: 200,
        height: 200,
        hideLegend: false,
    };

    const data = stats?.rawMaterials?.map(item=>({label:item.product, value:item.quantity,  id:item.product})) || [];

  return (
    <div className='w-[86vw] lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >Available Raw Materials</span>
            <span className="greyText2">Available goods for production</span>
        </div>
        {
            (isPending) ?
            <LinearProgress className='w-full' />
            :
            <PieChart
                series={[{ innerRadius: 50, outerRadius: 100, data,  arcLabel:'value'}]}
                {...settings}
                // loading
                sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',
                    fontSize: 14,
                    },
                }}
                className='self-center'
                slotProps={{
                    legend: {
                        direction: "horizontal",
                        position: {
                            vertical: "bottom",
                            horizontal: "center",
                        },
                    },
                }}
            />
            
        }
    </div>
  )
}

export default DashRMaterialPie