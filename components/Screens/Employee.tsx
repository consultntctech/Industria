'use client'
import  { useState } from 'react'
import { IoMdAddCircle } from 'react-icons/io';
import { useSettings } from '@/config/useSettings';
import Title from '../misc/Title';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';
import { useCanUser } from '@/hooks/useAuth';
import EmployeeComp from '../Views/EmployeeComp';
import { IEmployee } from '@/lib/models/employee.model';
import EmployeesTable from '../tables/employees/EmployeesTable';

const EmployeesScreen = () => {
    const [currentEmployee, setCurrentEmployee] = useState<IEmployee|null>(null);
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser('96', 'CREATE');
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Employees" isLink={false}/>
            {
                isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['96']} >
          <EmployeeComp currentEmployee={currentEmployee} openNew={openNew} setOpenNew={setOpenNew} setCurrentEmployee={setCurrentEmployee}/>
          <EmployeesTable setOpenNew={setOpenNew} currentEmployee={currentEmployee} setCurrentEmployee={setCurrentEmployee}/>
        </PermissionGuard>
    </div>
  )
}

export default EmployeesScreen