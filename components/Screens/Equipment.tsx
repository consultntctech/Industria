'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import {useCanUser } from "@/hooks/useAuth";
import { IEquipment } from "@/lib/models/equipment.model";
import EquipmentComp from "../Views/EquipmentComp";
import EuipmentTable from "../tables/equipment/EuipmentTable";
;

const Equipment = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState<IEquipment | null>(null);
    const isCreator = useCanUser('94', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="Equipment" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['94']} >
        <EquipmentComp currentEquipment={currentEquipment} setCurrentEquipment={setCurrentEquipment} openNew={openNew} setOpenNew={setOpenNew}/>
        <EuipmentTable currentEquipment={currentEquipment} setCurrentEquipment={setCurrentEquipment} setOpenNew={setOpenNew} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Equipment