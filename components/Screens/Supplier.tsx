'use client'
import { IoMdAddCircle } from "react-icons/io"
import SupplierComp from "../Views/SupplierComp"
import Title from "../misc/Title"
import { useState } from "react";
import { useSettings } from "@/config/useSettings";

const Supplier = () => {
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Suppliers" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <SupplierComp openNew={openNew} setOpenNew={setOpenNew}/>
    </div>
  )
}

export default Supplier