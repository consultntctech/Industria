import { useFetchGlobalFinanceStats } from "@/hooks/fetch/useFetchStats";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

const PackagingFinanceChart = () => {
    const {globalFinanceStats, isPending} = useFetchGlobalFinanceStats();
    const packages = globalFinanceStats?.packaging;
    const xData = packages?.map(item=>item?.month);
    const yData = packages?.map(item=>item?.quantity) || [];

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)

    


  return (
    <div className='w-full lg:w-3/7 p-6 rounded-2xl shadow-xl flex flex-col gap-4 border border-slate-200'>
        <span className="semibold" >Packaging Trend (Last 6 Months)</span>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <BarChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {
                    data: yData, barLabel:'value', barLabelPlacement:'outside',
                    color:'teal',
                    }
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                
            />
        }
    </div>
  )
}

export default PackagingFinanceChart