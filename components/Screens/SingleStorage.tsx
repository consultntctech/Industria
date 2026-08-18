import { IStorage } from "@/lib/models/storage.model";
import Title from "../misc/Title";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import SingleStorageComp from "../Views/SingleStorageComp";

type SingleStorageProps = {
    storage:IStorage | null
}

const SingleStorage = ({storage}:SingleStorageProps) => {

  if(!storage) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Storage" isLink link="/dashboard/storage" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={storage?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['71']} >
          <SingleStorageComp storage={storage}/>
        </PermissionGuard>
    </div>
  )
}

export default SingleStorage