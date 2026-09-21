import { formatDate } from "@/functions/dates";
// import DepartmentInputDetailsModals from "./DepartmentInputDetailsModals";
import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { IDepartment } from "@/lib/models/department.model";
import { Dispatch, SetStateAction } from "react";
import { IEmployee } from "@/lib/models/employee.model";

type DepartmentInputDetailsProps = {
    department: IDepartment | null;
    setActiveTab: Dispatch<SetStateAction<string>>;
    employees: number;
}

const DepartmentInputDetails = ({department, setActiveTab, employees}:DepartmentInputDetailsProps) => {
    const hod = department?.head as IEmployee;

    const viewEmployees = ()=>{
        setActiveTab('second');
    }
    


  return (
     <div className="formBox p-3 flex-col gap-4 relative">
        
     
            <>
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Name:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{department?.name}</span>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Head:</span>
                    {
                        hod ?
                        <Linker tableId="96" placeholder={hod?.name} spanStyle="text-gray-600 flex-1 md:flex-5" linkStyle="link" link={`/dashboard/employees?Id=${hod?._id}`} />
                        :
                        <span className="text-gray-600 flex-1 md:flex-5" >{department?.headName || 'None'}</span>
                    }
                </div>

                


               
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Employees:</span>
                    <span onClick={viewEmployees} className="link flex-1 md:flex-5" >{employees}</span>
                </div>

                <div className="flex flex-row items-start gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Note:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{department?.description || 'None'}</span>
                </div>
               
                
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Created:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(department?.createdAt)}</span>
                </div>
            </>
    
            
    
    </div>
  )
}

export default DepartmentInputDetails