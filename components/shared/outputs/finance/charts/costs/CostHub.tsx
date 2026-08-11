import { useFetchCostStats } from "@/hooks/fetch/useFetchStats";
import ProductionCostChart from "./ProductionCostChart";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import MaterialsCostChart from "./MaterialsCostCharts";
import PackagingCostChart from "./PackagingCostChart";

const CostHub = () => {
  const {costStats, isPending } = useFetchCostStats();
  const {currency} = useCurrencyConfig();
  return (
    <div className="flex flex-col gap-8 p-5 rounded-lg shadow border border-gray-200 w-[86vw] lg:w-8/9" >
      <span className="semibold" >Costs Breakdown {currency? `(${currency?.symbol})`:''} (Last 6 Months)</span>
      <ProductionCostChart stats={costStats} isPending={isPending} />
      <MaterialsCostChart stats={costStats} isPending={isPending} />
      <PackagingCostChart stats={costStats} isPending={isPending} />
    </div>
  )
}

export default CostHub