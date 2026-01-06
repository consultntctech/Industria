import { IPackage } from "@/lib/models/package.model"
import Title from "../misc/Title"
import SinglePackageComp from "../Views/SinglePackageComp"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"

type SinglePackageProps = {
    currentPackage:IPackage | null
}

const SinglePackage = ({currentPackage}:SinglePackageProps) => {

  if(!currentPackage) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Packages" isLink link="/dashboard/distribution/packaging" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={currentPackage?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['99']} >
          <SinglePackageComp currentPackage={currentPackage}/>
        </PermissionGuard>
    </div>
  )
}

export default SinglePackage