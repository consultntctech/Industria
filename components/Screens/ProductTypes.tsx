'use client'
import { useState } from "react";
import ProductTypesComp from "../Views/ProductTypesComp"
import { useSettings } from "@/config/useSettings";
import Title from "../misc/Title";
import { IoMdAddCircle } from "react-icons/io";

const ProductTypes = () => {
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Products" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <ProductTypesComp openNew={openNew} setOpenNew={setOpenNew}/>
    </div>
  )
}

export default ProductTypes