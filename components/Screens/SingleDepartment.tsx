import { IDepartment } from "@/lib/models/department.model";
import Title from "../misc/Title";
import SingleDepartmentComp from "../Views/SingleDepartmentComp";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";

type SingleDepartmentProps = {
    department:IDepartment | null
}

const SingleDepartment = ({department}:SingleDepartmentProps) => {

  if(!department) return null;
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center gap-1 flex-row">
            <Title showback={false} title="Departments" isLink link="/dashboard/departments" />
            <div className="title hidden md:block">/</div>
            <Title className="hidden md:flex" showback={false} title={department?.name} isLink={false} />
        </div>
        <PermissionGuard tableId={['95']} >
          <SingleDepartmentComp department={department}/>
        </PermissionGuard>
    </div>
  )
}

export default SingleDepartment