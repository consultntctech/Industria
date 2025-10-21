'use client'
import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import OrgComp from "../Views/OrgComp"
import { Settings } from "@/config/Settings"
import { useState } from "react"

const Organizations = () => {
    const [openNew, setOpenNew] = useState(false);
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Organizations" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:Settings().primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <OrgComp openNew={openNew} setOpenNew={setOpenNew}/>
    </div>
  )
}

export default Organizations