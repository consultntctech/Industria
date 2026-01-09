'use client'
import { IoMdAddCircle } from "react-icons/io"
import SupplierComp from "../Views/SupplierComp"
import Title from "../misc/Title"
import { useState } from "react";
import { useSettings } from "@/config/useSettings";
import SuppliersTable from "../tables/suppliers/SuppliersTable";
import { ISupplier } from "@/lib/models/supplier.model";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const Supplier = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier | null>(null);
    const {primaryColour} = useSettings();
    const {user} = useAuth();
    const isCreator = canUser(user, '41', 'CREATE');
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Suppliers" isLink={false}/>
            {
                isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['41']} >
          <SupplierComp openNew={openNew} setOpenNew={setOpenNew} currentSupplier={currentSupplier} setCurrentSupplier={setCurrentSupplier} />
          <SuppliersTable setOpenNew={setOpenNew} currentSupplier={currentSupplier} setCurrentSupplier={setCurrentSupplier} />
        </PermissionGuard>
    </div>
  )
}

export default Supplier