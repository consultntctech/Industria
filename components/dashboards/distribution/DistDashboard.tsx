'use client'
import Title from "@/components/misc/Title"
import DistCardsMainComponent from "./DistCardsMainComponent"
import DistChartContent from "./DistChartContent"
import { useState } from "react";
import { QuanityOrPrice } from "@/types/Types";
import { useFetchPackageStats } from "@/hooks/fetch/useFetchPackages";
import DisDashTable from "./DisDashTable";

const DistDashboard = () => {
    const [type, setType] = useState<QuanityOrPrice>("quantity");
    const {isPending, stats} = useFetchPackageStats(type);

  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Packaging Dashboard" isLink={false}/>
        </div>
        <div className="flex flex-col items-center gap-3 w-full">
            <select onChange={(e)=>setType(e.target.value as QuanityOrPrice)} className={`outline-none w-[8rem] self-end border-1 border-gray-300 rounded px-2 py-1`}  >
                <option  value="quantity">Quantity</option>
                <option value="price">Value</option>
            </select>
            <DistCardsMainComponent stats={stats} isPending={isPending} type={type} />
        </div>

        <div className="flex flex-col gap-8 w-full">
          <DistChartContent stats={stats} isPending={isPending} type={type} />
          <DisDashTable />
        </div>
    </div>
  )
}

export default DistDashboard