'use client'

import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import BatchComp from "../Views/BatchComp"
import { useState } from "react"
import { useSettings } from "@/config/useSettings"
import { IBatch } from "@/lib/models/batch.model"
import BatchTable from "../tables/batches/BatchTable"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import {  useCanUser } from "@/hooks/useAuth"

const Batches = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentBatch, setCurrentBatch] = useState<IBatch | null>(null);
    const {primaryColour} = useSettings();
    const isBatchAdmin = useCanUser('55', 'CREATE');
  return (
    <div className="flex flex-col w-full gap-8 ml-4 md:ml-4">
        <div className="flex flex-row items-center justify-between w-full">
            <Title title="Batches" isLink={false}/>
            {
                isBatchAdmin &&
                <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['55']} >
          <BatchComp openNew={openNew} setOpenNew={setOpenNew} currentBatch={currentBatch} setCurrentBatch={setCurrentBatch}/>
          <BatchTable setOpenNew={setOpenNew} currentBatch={currentBatch} setCurrentBatch={setCurrentBatch} />
        </PermissionGuard>
    </div>
  )
}

export default Batches