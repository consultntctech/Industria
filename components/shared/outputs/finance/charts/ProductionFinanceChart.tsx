import { CustomMark } from "@/functions/JsxFunctions";
import { useFetchGlobalFinanceStats } from "@/hooks/fetch/useFetchStats";
import { LinearProgress } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';

const ProductionFinanceChart = () => {
    const {globalFinanceStats, isPending} = useFetchGlobalFinanceStats();
    const productions = globalFinanceStats?.production;
    const xData = productions?.map(item=>item?.month);
    const yData = productions?.map(item=>item?.quantity) || [];

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)


  return (
    <div className='w-full lg:w-3/7 p-6 rounded-2xl shadow-xl flex flex-col gap-4 border border-slate-200'>
        <span className="semibold" >Production Trend (Last 6 Months)</span>
        {
            isPending ? 
            <LinearProgress className='w-full' />
            :
            <LineChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {
                    data: yData,
                    color:'#0076D1',
                    }
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                slots={{
                    mark:CustomMark(yData)
                }}
            />
        }
    </div>
  )
}

export default ProductionFinanceChart