import { useFetchUserDashboardStats } from "@/hooks/fetch/useFetchStats";
import DashRMaterialPie from "./DashRMaterialPie"
import DashFinishedPie from "./DashFinishedPie";

const UserMainDashMainComponent = () => {
    const {isPending, dashboardStats} = useFetchUserDashboardStats();
  return (
    <div className="flex flex-col lg:flex-row flex-wrap gap-8 w-full lg:justify-between">
        <DashRMaterialPie isPending={isPending} stats={dashboardStats} />
        <DashFinishedPie isPending={isPending} stats={dashboardStats} />
    </div>
  )
}

export default UserMainDashMainComponent