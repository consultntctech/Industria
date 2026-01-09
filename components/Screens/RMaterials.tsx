'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import RMComp from "../Views/RMComp";
import RMaterialTable from "../tables/rmaterials/RMaterialTable";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const RMaterials = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState<IRMaterial | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '87', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="Raw Materials" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['87']} >
        <RMComp currentMaterial={currentMaterial} setCurrentMaterial={setCurrentMaterial} openNew={openNew} setOpenNew={setOpenNew}/>
        <RMaterialTable currentMaterial={currentMaterial} setCurrentMaterial={setCurrentMaterial} setOpenNew={setOpenNew} />
      </PermissionGuard>
    </TopContent>
  )
}

export default RMaterials