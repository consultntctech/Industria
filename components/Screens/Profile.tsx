import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import Title from "../misc/Title"
import ProfileComp from "../Views/ProfileComp"

const Profile = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Account Setting" isLink={false}/>
        </div>
        <PermissionGuard tableId={['8']} >
          <ProfileComp />
        </PermissionGuard>
    </div>
  )
}

export default Profile