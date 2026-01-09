'use client'
import { useState } from "react";
import ProductTypesComp from "../Views/ProductTypesComp"
import { useSettings } from "@/config/useSettings";
import Title from "../misc/Title";
import { IoMdAddCircle } from "react-icons/io";
import ProductTable from "../tables/products/ProductTable";
import { IProduct } from "@/lib/models/product.model";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const ProductTypes = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<IProduct | null>(null);
    const {primaryColour} = useSettings();
    const {user} = useAuth();
    const isCreator = canUser(user, '28', 'CREATE');
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Products" isLink={false}/>
            {
              isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['28']} >
          <ProductTypesComp openNew={openNew} setOpenNew={setOpenNew} currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
          <ProductTable setOpenNew={setOpenNew} currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
        </PermissionGuard>
    </div>
  )
}

export default ProductTypes