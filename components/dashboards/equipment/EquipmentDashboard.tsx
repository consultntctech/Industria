'use client'

import Title from "@/components/misc/Title";
import { useFetchEquipmentStats } from "@/hooks/fetch/useFetchEquipment";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { EquipmentStatsGroup } from "@/types/EquipmentTypes";
import { QuanityOrPrice } from "@/types/Types";
import { useState } from "react";
import EquipCardComp from "./EquipCardComp";
import EquipGroupBarChart from "./EquipGroupBarChart";

const EquipmentDashboard = () => {
    const [limit, setLimit] = useState<number>(6);
    const [group, setGroup] = useState<EquipmentStatsGroup>("category");
    const [type, setType] = useState<QuanityOrPrice>("quantity");

    const {isPending, equipmentStats} = useFetchEquipmentStats(limit);
    // const alltime =  equipmentStats?.allTime;
    // console.log('Category: ', equipmentStats?.groupedByCategory)
    // console.log('Type: ', equipmentStats?.groupedByType)

  return (
    <PermissionGuard tableId={['92', '93', '94']} >
        <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
          <div className="flex w-full items-center flex-row justify-between">
              <Title title="Equipment Dashboard" isLink={false}/>
          </div>
          <div className="flex flex-col items-center gap-3 w-full">
              <select onChange={(e)=>setType(e.target.value as QuanityOrPrice)} className={`outline-none w-[8rem] self-end border-1 border-gray-300 rounded px-2 py-1`}  >
                  <option  value="quantity">Quantity</option>
                  <option value="price">Value</option>
              </select>
              <EquipCardComp data={equipmentStats?.allTime} isPending={isPending} type={type} />
          </div>

          <div className="flex flex-col gap-4 w-full border border-gray-400 rounded-lg p-5">
            <div className="flex items-center w-full justify-end gap-4">
                <select onChange={(e)=>setGroup(e.target.value as EquipmentStatsGroup)} className={`outline-none w-[8rem] border-1 border-gray-300 rounded px-2 py-1`}  >
                  <option  value="catergory">Category</option>
                  <option value="type">Type</option>
                </select>
                <input onChange={(e)=>setLimit(Number(e.target.value))} min={1} value={limit} type="number" className="outline-none w-[8rem] border-1 border-gray-300 rounded px-2 py-1" />
            </div>

            <div className="flex flex-col gap-8 w-full">
                <EquipGroupBarChart isPending={isPending} group={equipmentStats?.groupedByType} category={equipmentStats?.groupedByCategory} type={type} groupType={group} limit={limit} />
            </div>
          </div>
      </div>
    </PermissionGuard>
  )
}

export default EquipmentDashboard