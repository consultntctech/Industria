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
    const returnsAmonunt = returns?.map((item)=> item?.quantity === 0 ? 0 : -Math.abs(item.quantity))

    const xData = sales?.map(item=>item?.month) || [];
    // const yData = sales?.map(item=>item?.quantity);

    // console.log('Productions: ', productions)
    // console.log('X Data: ', yData)
const MAX_TICKS = 10;
const PX_PER_STEP = 40;
const EXTRA = 90; // legend + x-axis labels

const getStep = (min: number, max: number, maxTicks: number) => {
  const range = Math.max(max - min, 1);
  let pow = Math.max(1, Math.pow(10, Math.floor(Math.log10(range / maxTicks))));

  while (true) {
    for (const m of [1, 2, 5, 10]) {
      const step = m * pow;
      const lo = Math.floor(min / step) * step;
      const hi = Math.ceil(max / step) * step;
      if ((hi - lo) / step + 1 <= maxTicks) return step;
    }
    pow *= 10;
  }
};

const allValues = [
  ...(salesAmonunt ?? []),
  ...(ordersAmonunt ?? []),
  ...(returnsAmonunt ?? []),
];

const dataMax = Math.max(0, ...allValues);
const dataMin = Math.min(0, ...allValues);

const step = getStep(dataMin, dataMax, MAX_TICKS);
const yMax = Math.ceil(dataMax / step) * step;
const yMin = Math.floor(dataMin / step) * step;

const ticks = Array.from(
  { length: (yMax - yMin) / step + 1 },
  (_, i) => yMin + i * step
);

const chartHeight = (ticks.length - 1) * PX_PER_STEP + EXTRA;


  return (
    <div className='w-[86vw] lg:w-8/9 p-6 rounded-md shadow flex flex-col gap-4 border border-slate-200'>
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
                yAxis={[{
                    min: yMin,
                    max: yMax,
                    tickInterval: ticks,
                    disableLine: true,
                    disableTicks: true,
                }]}
                height={chartHeight}

            />
        }
    </div>
  )
}

export default TransactionFinanceChart