import Title from '@/components/misc/Title'
import TransCardsMainComponent from './TransCardsMainComponent'
import SalesAndOrdersChart from './SalesAndOrdersChart'
import OrdersPieChart from './OrdersPieChart'
import ReturnsTransChart from './ReturnsTransChart'
import OrdersTransTable from './OrdersTransTable'

const TransDashboard = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Transactions Dashboard" isLink={false}/>
        </div>
        <TransCardsMainComponent />

        <div className="flex flex-row flex-wrap gap-8 w-full lg:justify-between">
          <SalesAndOrdersChart />
          <OrdersPieChart />
          <ReturnsTransChart />
          <OrdersTransTable />
        </div>
    </div>
  )
}

export default TransDashboard