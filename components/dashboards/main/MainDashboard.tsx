'use client'
import Title from "@/components/misc/Title"
import MainDashCardMainComponent from "./MainDashCardMainComponent"
import { useFetchDashboardStats } from "@/hooks/fetch/useFetchStats"
import DashInventoryLineChart from "./DashInventoryLineChart"
import DashRejectionBarChart from "./DashRejectionBarChart"
import DashProductionBarChart from "./DashProductionBarChart"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import { canUser } from "@/Data/roles/permissions"
import { useAuth } from "@/hooks/useAuth"
import UserMainDashMainComponent from "./UserMainDashMainComponent"

const MainDashboard = () => {
  const {dashboardStats, isPending} = useFetchDashboardStats();
  const {user} = useAuth();
  const finance = canUser(user, '97', 'READ');
  return (
    <PermissionGuard tableId= {['0']} >
      <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
          <div className="flex flex-col">
              <Title showback={false} title="Dashboard Overview" isLink={false}/>
              <span className="greyText">Comprehensive insights into manufacturing operations</span>
          </div>
          {
            finance &&
            <MainDashCardMainComponent stats={dashboardStats} isPending={isPending} />
          }

          <div className="flex flex-col gap-7">
            <span className="subtitle" >Operational Insights</span>
            <div className="flex flex-col w-full gap-6">
              {
                finance ?
                <>
                  <DashInventoryLineChart stats={dashboardStats} isPending={isPending} />
                  <DashRejectionBarChart stats={dashboardStats} isPending={isPending} />
                </>
                :
                <UserMainDashMainComponent  />
              }
              <DashProductionBarChart stats={dashboardStats} isPending={isPending} />
            </div>
          </div>
      </div>
    </PermissionGuard>
  )
}

export default MainDashboard