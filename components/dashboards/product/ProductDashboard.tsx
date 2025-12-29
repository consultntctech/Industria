'use client'
import Title from "@/components/misc/Title"
import ProductBarChart from "./ProductBarChart"
import { useFetchProductStats } from "@/hooks/fetch/useFetchProducts";
import ProductLowStockCard from "./ProductLowStockCard";

const ProductDashboard = () => {
    
    const {isPending, stats} = useFetchProductStats();
    // console.log("Stats: ", stats)
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4" >
        <Title title="Products Dashboard" isLink={false}/>
        <ProductBarChart isPending={isPending} stats={stats} />
        <ProductLowStockCard isPending={isPending} stats={stats} />
    </div>
  )
}

export default ProductDashboard