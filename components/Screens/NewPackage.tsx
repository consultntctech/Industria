import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import Title from "../misc/Title"
import NewPackageComp from "../Views/NewPackageComp"

const NewPackage = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Packaging" isLink link="/dashboard/distribution/packaging" />
            <div className="title">/</div>
            <Title showback={false} title="New" isLink={false} />
        </div>
        <PermissionGuard tableId={['99']} >
          <NewPackageComp/>
        </PermissionGuard>
    </div>
  )
}

export default NewPackage