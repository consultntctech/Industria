'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import ProdItemComp from "../Views/ProdItemComp";
import ProdItemTable from "../tables/proditems/ProdItemTable";
import { IProdItem } from "@/lib/models/proditem.model";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const ProdItems = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentProdItem, setCurrentProdItem] = useState<IProdItem | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '12', 'CREATE');

  return (
    <TopContent showAdd={isCreator} isLink={false} title="Packaging Materials" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['12']} >
        <ProdItemComp currentProdItem={currentProdItem} setCurrentProdItem={setCurrentProdItem} openNew={openNew} setOpenNew={setOpenNew}/>
        <ProdItemTable setOpenNew={setOpenNew} currentProdItem={currentProdItem} setCurrentProdItem={setCurrentProdItem} />
      </PermissionGuard>
    </TopContent>
  )
}

export default ProdItems