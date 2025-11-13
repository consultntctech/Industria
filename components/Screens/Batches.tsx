'use client'

import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import BatchComp from "../Views/BatchComp"
import { useState } from "react"
import { useSettings } from "@/config/useSettings"
import { IBatch } from "@/lib/models/batch.model"
import BatchTable from "../tables/batches/BatchTable"

const Batches = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentBatch, setCurrentBatch] = useState<IBatch | null>(null);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Batches" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <BatchComp openNew={openNew} setOpenNew={setOpenNew} currentBatch={currentBatch} setCurrentBatch={setCurrentBatch}/>
        <BatchTable setOpenNew={setOpenNew} currentBatch={currentBatch} setCurrentBatch={setCurrentBatch} />
    </div>
  )
}

export default Batches