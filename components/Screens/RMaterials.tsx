'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import RMComp from "../Views/RMComp";
import RMaterialTable from "../tables/rmaterials/RMaterialTable";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";

const RMaterials = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState<IRMaterial | null>(null);
  return (
    <TopContent isLink={false} title="Raw Materials" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['87']} >
        <RMComp currentMaterial={currentMaterial} setCurrentMaterial={setCurrentMaterial} openNew={openNew} setOpenNew={setOpenNew}/>
        <RMaterialTable currentMaterial={currentMaterial} setCurrentMaterial={setCurrentMaterial} setOpenNew={setOpenNew} />
      </PermissionGuard>
    </TopContent>
  )
}

export default RMaterials