import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import Title from "../misc/Title";
import { ISupplier } from "@/lib/models/supplier.model";
import SingleSupplierComp from "../Views/SingleSupplierComp";
// import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
// import SingleSupplierComp from "../Views/SingleSupplierComp";

type SingleSupplierProps = {
    supplier:ISupplier | null
}

const SingleSupplier = ({supplier}:SingleSupplierProps) => {

  if(!supplier) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Suppliers" isLink link="/dashboard/distribution/suppliers" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={supplier?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['41']} >
          <SingleSupplierComp supplier={supplier}/>
        </PermissionGuard>
    </div>
  )
}

export default SingleSupplier