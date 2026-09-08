'use client'
import { IDepartment } from "@/lib/models/department.model";
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchDepartmentUsers } from "@/hooks/fetch/useFetchUsers";
import DepartmentInputDetails from "../shared/outputs/departmentDetails/DepartmentInputDetails";
import DeptUserTable from "../shared/outputs/departmentDetails/departmentUsers/DeptUserTable";
import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/lib/models/user.model";
import DeptRolesTable from "../shared/outputs/departmentDetails/deptmentRoles/DeptRolesTable";


type SingleDepartmentCompProps = {
    department:IDepartment | null
}

const SingleDepartmentComp = ({department}:SingleDepartmentCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {users, isPending, refetch} = useFetchDepartmentUsers(department?._id || '', false);
    const hod = department?.head as IUser;
    const {user} = useAuth();
    const isHod = user?._id === hod?._id;
    // console.log(users, isPending);
    // if(!departmentItems) return null;
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Details" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Employees" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Permissions" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
         {
          activeTab === 'first' &&
          <DepartmentInputDetails   department={department} setActiveTab={setActiveTab} employees={users?.length || 0} />
        }
        {
          activeTab === 'second' &&
          <DeptUserTable users={users} isPending={isPending} refetch={refetch} isHod={isHod} currentDepartment={department} />
        }
        
         {
          activeTab === 'third' &&
          <DeptRolesTable department={department} />
        }
        {/*
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       */}
      </div>
  )
}

export default SingleDepartmentComp