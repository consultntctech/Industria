'use client'
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import Title from "../misc/Title"
import NewProductionComp from "../Views/NewProductionComp"

const NewProduction = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Productions" isLink link="/dashboard/processing/production" />
            <div className="title">/</div>
            <Title showback={false} title="New" isLink={false} />
        </div>
        <PermissionGuard tableId={['8']} operation="CREATE" >
          <NewProductionComp/>
        </PermissionGuard>
    </div>
  )
}

export default NewProduction