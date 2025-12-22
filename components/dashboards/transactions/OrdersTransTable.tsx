
import OrderMiniTable from "./ordersminitable/OrderMiniTable";

const OrdersTransTable = () => {
  
  return (
     <div className='w-[86vw] lg:w-[48%] p-6 rounded-2xl shadow-xl flex flex-col gap-4'>
        <div className="flex flex-col gap-1">
            <span className="semibold" >Recent Orders</span>
            <span className="greyText2 text-slate-400">An overview of recent Sales Orders and their status</span>
        </div>
        <OrderMiniTable />
    </div>
  )
}

export default OrdersTransTable