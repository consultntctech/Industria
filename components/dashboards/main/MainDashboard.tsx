'use client'
import Title from "@/components/misc/Title"
import MainDashCardMainComponent from "./MainDashCardMainComponent"
import { useFetchDashboardStats } from "@/hooks/fetch/useFetchStats"
import DashInventoryLineChart from "./DashInventoryLineChart"
import DashRejectionBarChart from "./DashRejectionBarChart"
import DashProductionBarChart from "./DashProductionBarChart"

const MainDashboard = () => {
  const {dashboardStats, isPending} = useFetchDashboardStats();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex flex-col">
            <Title title="Dashboard Overview" isLink={false}/>
            <span className="greyText ml-12">Comprehensive insights into manufacturing operations</span>
        </div>
        <MainDashCardMainComponent stats={dashboardStats} isPending={isPending} />

        <div className="flex flex-col gap-7">
          <span className="subtitle" >Operational Insights</span>
          <div className="flex flex-col w-full gap-6">
            <DashInventoryLineChart stats={dashboardStats} isPending={isPending} />
            <DashRejectionBarChart stats={dashboardStats} isPending={isPending} />
            <DashProductionBarChart stats={dashboardStats} isPending={isPending} />
          </div>
        </div>
    </div>
  )
}

export default MainDashboard