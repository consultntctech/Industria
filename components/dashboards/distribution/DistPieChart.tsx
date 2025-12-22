import { useFetchPackagedProductStats } from "@/hooks/fetch/useFetchPackages";
import { QuanityOrPrice } from "@/types/Types"
import { LinearProgress } from "@mui/material";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";

type DistPieChartProps = {
    type: QuanityOrPrice
}

const DistPieChart = ({type}:DistPieChartProps) => {
    const {isPending, stats} = useFetchPackagedProductStats(type);

     const settings = {
        // margin: { right: 5 },
        width: 200,
        height: 200,
        hideLegend: false,
    };

    const data = stats?.map(item=>({label:item?.product, value:item?.quantity})) || [];

  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow border border-slate-200 flex-1 rounded-2xl" >
        <span className="semibold">Packages Beakdown by Product Type</span>
        {
            (isPending) ?
            <LinearProgress className='w-full' />
            :
            <PieChart
                series={[{ innerRadius: 80, outerRadius: 100, data,  arcLabel:'value'}]}
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

export default DistPieChart