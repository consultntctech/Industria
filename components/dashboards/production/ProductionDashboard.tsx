'use client'
import Title from "@/components/misc/Title"
import ProductionCardsMainComponent from "./ProductionCardsMainComponent"
import { useFetchProductionStats } from "@/hooks/fetch/useFetchProductions"
import ProductionBarChart from "./ProductionBarChart"
import ProductionDashTable from "./ProductionDashTable"

const ProductionDashboard = () => {
    const {productionStats, isPending} = useFetchProductionStats();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Production Dashboard" isLink={false}/>
        </div>
        <ProductionCardsMainComponent stats={productionStats} isPending={isPending} />

        <div className="flex flex-col lg:flex-row flex-wrap gap-8 w-full lg:justify-between">
          <ProductionBarChart isPending={isPending} stats={productionStats} />
          <ProductionDashTable />
        </div>
    </div>
  )
}

export default ProductionDashboard