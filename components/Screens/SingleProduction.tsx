import { IProduction } from "@/lib/models/production.model"
import Title from "../misc/Title"
import SingleProductionComp from "../Views/SingleProductionComp"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"

type SingleProductionProps = {
    production:IProduction | null
}

const SingleProduction = ({production}:SingleProductionProps) => {

  if(!production) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Productions" isLink link="/dashboard/processing/production" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={production?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['8']} >
          <SingleProductionComp production={production}/>
        </PermissionGuard>
          
    </div>
  )
}

export default SingleProduction