'use client'
import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import { useState } from "react";
import { useSettings } from "@/config/useSettings";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useCanUser } from "@/hooks/useAuth";
import { IDepartment } from "@/lib/models/department.model";
import DepartmentTable from "../tables/departments/DepartmentTable";
import DepartmentComp from "../Views/DepartmentComp";

const Departments = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment | null>(null);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser( '95', 'CREATE');
  return (
    <div className="flex flex-col w-full gap-8 ml-4 md:ml-4">
        <div className="flex flex-row items-center justify-between w-full">
            <Title title="Departments" isLink={false}/>
            {
                isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['95']} >
          <DepartmentComp openNew={openNew} setOpenNew={setOpenNew} currentDepartment={currentDepartment} setCurrentDepartment={setCurrentDepartment} />
          <DepartmentTable setOpenNew={setOpenNew} currentDepartment={currentDepartment} setCurrentDepartment={setCurrentDepartment} />
        </PermissionGuard>
    </div>
  )
}

export default Departments