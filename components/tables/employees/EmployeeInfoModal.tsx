import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IDepartment } from '@/lib/models/department.model';
import { IEmployee } from '@/lib/models/employee.model';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Image from 'next/image';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type EmployeeInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentEmployee: IEmployee | null;
    setCurrentEmployee:Dispatch<SetStateAction<IEmployee | null>>;
}

const EmployeeInfoModal = ({infoMode, setInfoMode, currentEmployee, setCurrentEmployee}:EmployeeInfoModalProps) => {
    const organization = currentEmployee?.org as IOrganization;
    const department = currentEmployee?.department as IDepartment;
    const account = currentEmployee?.userAccount as IUser;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

  
    
   
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentEmployee(null);
    }

    if(!currentEmployee) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col w-full gap-4 mt-8' >

            <div className="w-full flex-center">
                <div className="p-2 rounded-full flex-center w-fit bg-slate-300">
                    <div className="relative w-20 h-20 rounded-full">
                        <Image fill className='rounded-full' alt='user' src={currentEmployee?.photo} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentEmployee?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentEmployee?.email}`} className="mtext link">{currentEmployee?.email}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentEmployee?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentEmployee?.address || 'None'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">User Account</span>
                {
                    account ? 
                    <Linker tableId='38' link={`/dashboard/users?Id=${account?._id}`}  linkStyle="link mtext" spanStyle='mtext' placeholder={account?.name} />
                    :
                    <span className="mtext">None</span>
                }
            </div>
            {
                isAdmin &&
                <div className="flex flex-col">
                    <span className="mlabel">Organization</span>
                    <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentEmployee?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Department</span>
                {
                    department ? 
                    <Linker tableId='95' link={`/dashboard/departments/${department?._id}`}  linkStyle="link mtext" spanStyle='mtext' placeholder={department?.name} />
                    :
                    <span className="mtext">Not assigned</span>
                }
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <span className="mtext">{currentEmployee?.creator || 'Unknown'}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentEmployee?.createdAt)}</span>
            </div>
        </div>       
    </InfoModalContainer>
  )
}

export default EmployeeInfoModal