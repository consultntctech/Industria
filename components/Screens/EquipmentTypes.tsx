'use client'
import { useState } from "react";
import { useSettings } from "@/config/useSettings";
import Title from "../misc/Title";
import { IoMdAddCircle } from "react-icons/io";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import {useCanUser } from "@/hooks/useAuth";
import EqupmentTypesComp from "../Views/EqupmentTypesComp";
import ETypeTable from "../tables/etype/ETypeTable";
import { IEType } from "@/lib/models/etype.model";

const EquipmentTypes = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentEType, setCurrentEType] = useState<IEType | null>(null);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser('92', 'CREATE');
  return (
    <div className="flex flex-col w-full gap-8 ml-4 md:ml-4">
        <div className="flex flex-row items-center justify-between w-full">
            <Title title="Equipment Types" isLink={false}/>
            {
              isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['92']} >
          <EqupmentTypesComp openNew={openNew} setOpenNew={setOpenNew} currentEType={currentEType} setCurrentEType={setCurrentEType} />
          <ETypeTable setOpenNew={setOpenNew} currentEType={currentEType} setCurrentEType={setCurrentEType} />
        </PermissionGuard>
    </div>
  )
}

export default EquipmentTypes