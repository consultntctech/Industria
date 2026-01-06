'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import ProdItemComp from "../Views/ProdItemComp";
import ProdItemTable from "../tables/proditems/ProdItemTable";
import { IProdItem } from "@/lib/models/proditem.model";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";

const ProdItems = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentProdItem, setCurrentProdItem] = useState<IProdItem | null>(null);
  return (
    <TopContent isLink={false} title="Packaging Materials" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['12']} >
        <ProdItemComp currentProdItem={currentProdItem} setCurrentProdItem={setCurrentProdItem} openNew={openNew} setOpenNew={setOpenNew}/>
        <ProdItemTable setOpenNew={setOpenNew} currentProdItem={currentProdItem} setCurrentProdItem={setCurrentProdItem} />
      </PermissionGuard>
    </TopContent>
  )
}

export default ProdItems