import ProductMiniTable from "./productsminitable/ProductMiniTable"

const ProductDashTable = () => {
  return (
    <div className="flex flex-col gap-4 p-2.5 shadow border border-slate-200 flex-1 rounded-2xl" >
        <span className="semibold">Products Stocks</span>
        <ProductMiniTable />
    </div>
  )
}

export default ProductDashTable