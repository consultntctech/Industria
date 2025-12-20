import { IPackageStats, QuanityOrPrice } from "@/types/Types"
import DistBarChart from "./DistBarChart"
import DistPieChart from "./DistPieChart"

type DistChartContentProps = {
    type: QuanityOrPrice;
    stats: IPackageStats | null | undefined;
    isPending: boolean;
}

const DistChartContent = ({type, stats, isPending}:DistChartContentProps) => {
  return (
    <div className="flex flex-col gap-2.5 md:flex-row" >
        <DistPieChart type={type} />
        <DistBarChart stats={stats} isPending={isPending} />
    </div>
  )
}

export default DistChartContent