import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useFetchGlobalFinanceStats } from "@/hooks/fetch/useFetchStats";
import { LinearProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts";

const TransactionFinanceChart = () => {
    const {globalFinanceStats, isPending} = useFetchGlobalFinanceStats();
    const {currency} = useCurrencyConfig();
    const sales = globalFinanceStats?.sales;
    const orders = globalFinanceStats?.orders;
    const returns = globalFinanceStats?.returns;

    const salesAmonunt = sales?.map((item)=>item.quantity)
    const ordersAmonunt = orders?.map((item)=>item.quantity)
    const returnsAmonunt = returns?.map((item)=>-Math.abs(item.quantity))

    const xData = sales?.map(item=>item?.month) || [];
    // const yData = sales?.map(item=>item?.quantity);

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)

  


  return (
    <div className='w-full lg:w-8/9 p-6 rounded-2xl shadow-xl flex flex-col gap-4 border border-slate-200'>
        <span className="semibold" >Transactions {currency? `(${currency?.symbol})`:''} (Last 6 Months)</span>
        {
            isPending?
            <LinearProgress className='w-full' />
            :
            <BarChart
                xAxis={[{ data: xData, scaleType:'band', disableLine:true, disableTicks:true}]}
                series={[
                    {data:salesAmonunt, barLabel:'value', barLabelPlacement:'outside', color:'#0076D1', label:'Sales', id:'sales'},
                    {data:ordersAmonunt, barLabel:'value', barLabelPlacement:'outside', color:'teal', label:'Orders', id:'orders'},
                    {data:returnsAmonunt, barLabel:'value', barLabelPlacement:'outside', color:'orange', label:'Returns', id:'returns'},
                ]}
                yAxis={[{ disableLine:true, disableTicks:true}]}
                height={300}
                
            />
        }
    </div>
  )
}

export default TransactionFinanceChart