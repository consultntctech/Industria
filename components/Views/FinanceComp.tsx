'use client'
import { useFetchStats } from "@/hooks/fetch/useFetchStats";
import PackagingFinanceChart from "../shared/outputs/finance/charts/PackagingFinanceChart";
import ProductionFinanceChart from "../shared/outputs/finance/charts/ProductionFinanceChart";
import TransactionFinanceChart from "../shared/outputs/finance/charts/TransactionFinanceChart";
import FinanceCard from "../shared/outputs/finance/FinanceCard";
import { FinanceCardsData } from "../shared/outputs/finance/FinanceCardsData"
import { LinearProgress } from "@mui/material";


const FinanceComp = () => {
  const {stats, isPending } = useFetchStats();
  const cards = FinanceCardsData(stats);
 
  return (
    <div className="flex flex-col gap-12" >
      {
        isPending ?
        <LinearProgress className='w-full' />
        :
        <div className="flex gap-6 flex-col w-full">
          <span className="subtitle text-center sm:text-start">Key Financial Metrics</span>
          <div className="flex flex-col sm:flex-row w-fit sm:w-full self-center flex-wrap gap-6">
            {
              cards.map((item, index)=>(
                <FinanceCard key={index} item={item} />
              ))
            }
          </div>
        </div>
      }

      <div className="flex flex-row flex-wrap gap-8 w-full">
        <ProductionFinanceChart />
        <PackagingFinanceChart />
        <TransactionFinanceChart />
      </div>
    </div>
  )
}

export default FinanceComp