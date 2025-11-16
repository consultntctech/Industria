'use client'
import { IoMdAddCircle } from "react-icons/io"
import CustomerComp from "../Views/CustomerComp"
import Title from "../misc/Title"
import { useState } from "react";
import { useSettings } from "@/config/useSettings";
import { ICustomer } from "@/lib/models/customer.model";
import CustomersTable from "../tables/customers/CustomersTable";

const Customers = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<ICustomer | null>(null);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Customers" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <CustomerComp openNew={openNew} setOpenNew={setOpenNew} currentCustomer={currentCustomer} setCurrentCustomer={setCurrentCustomer} />
        <CustomersTable setOpenNew={setOpenNew} currentCustomer={currentCustomer} setCurrentCustomer={setCurrentCustomer} />
    </div>
  )
}

export default Customers