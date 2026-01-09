'use client'
import Title from "@/components/misc/Title"
import ProductBarChart from "./ProductBarChart"
import { useFetchProductStats } from "@/hooks/fetch/useFetchProducts";
import ProductLowStockCard from "./ProductLowStockCard";
import ProductDashTable from "./ProductDashTable";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";

const ProductDashboard = () => {
    
    const {isPending, stats} = useFetchProductStats();
    // console.log("Stats: ", stats)
  return (
    <PermissionGuard tableId={['28', '32', '55', '87']} >
      <div className="flex w-full flex-col gap-8 ml-4 md:ml-4" >
        <Title title="Products Dashboard" isLink={false}/>
        <ProductBarChart isPending={isPending} stats={stats} />
        <ProductLowStockCard isPending={isPending} stats={stats} />
        <ProductDashTable />
      </div>
    </PermissionGuard>
  )
}

export default ProductDashboard