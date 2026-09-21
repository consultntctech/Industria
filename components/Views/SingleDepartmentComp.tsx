'use client'
import { IDepartment } from "@/lib/models/department.model";
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import DepartmentInputDetails from "../shared/outputs/departmentDetails/DepartmentInputDetails";
import DeptUserTable from "../shared/outputs/departmentDetails/departmentUsers/DeptUserTable";
import { useAuth } from "@/hooks/useAuth";
import DeptRolesTable from "../shared/outputs/departmentDetails/deptmentRoles/DeptRolesTable";
import { useFetchDepartmentEmployees } from "@/hooks/fetch/useFetchEmployees";
import { IEmployee } from "@/lib/models/employee.model";


type SingleDepartmentCompProps = {
    department:IDepartment | null
}

const SingleDepartmentComp = ({department}:SingleDepartmentCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {employees, isPending, refetch} = useFetchDepartmentEmployees(department?._id || '', false);
    const hod = department?.head as IEmployee;
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
          <DepartmentInputDetails   department={department} setActiveTab={setActiveTab} employees={employees?.length || 0} />
        }
        {
          activeTab === 'second' &&
          <DeptUserTable employees={employees} isPending={isPending} refetch={refetch} isHod={isHod} currentDepartment={department} />
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