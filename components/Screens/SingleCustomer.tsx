import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import Title from "../misc/Title";
import { ICustomer } from "@/lib/models/customer.model";
import SingleCustomerComp from "../Views/SingleCustomerComp";
// import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
// import SingleCustomerComp from "../Views/SingleCustomerComp";

type SingleCustomerProps = {
    customer:ICustomer | null
}

const SingleCustomer = ({customer}:SingleCustomerProps) => {

  if(!customer) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Customers" isLink link="/dashboard/distribution/customers" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={customer?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['33']} >
          <SingleCustomerComp customer={customer}/>
        </PermissionGuard>
    </div>
  )
}

export default SingleCustomer