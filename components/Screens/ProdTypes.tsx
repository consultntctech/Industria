'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";

import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import {  useCanUser } from "@/hooks/useAuth";
import ProdTypeComp from "../Views/ProdTypeComp";
import { IProdType } from "@/lib/models/prodtype.model";
import ProdTypesTable from "../tables/prodtypes/ProdTypesTable";

const ProdTypes = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentProdType, setCurrentProdType] = useState<IProdType | null>(null);
    const isCreator = useCanUser( '17', 'CREATE');

  return (
    <TopContent showAdd={isCreator} isLink={false} title="Packaging Material Types" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['17']} >
        <ProdTypeComp currentProdType={currentProdType} setCurrentProdType={setCurrentProdType} openNew={openNew} setOpenNew={setOpenNew}/>
        <ProdTypesTable setOpenNew={setOpenNew} currentProdType={currentProdType} setCurrentProdType={setCurrentProdType} />
      </PermissionGuard>
    </TopContent>
  )
}

export default ProdTypes