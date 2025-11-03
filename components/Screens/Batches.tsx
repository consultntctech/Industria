'use client'

import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import BatchComp from "../Views/BatchComp"
import { useState } from "react"
import { useSettings } from "@/config/useSettings"

const Batches = () => {
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Batches" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <BatchComp openNew={openNew} setOpenNew={setOpenNew}/>
    </div>
  )
}

export default Batches