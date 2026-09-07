import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IUser } from '@/lib/models/user.model';
import { IDepartment } from '@/lib/models/department.model';

type DepartmentInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentDepartment: IDepartment | null;
    setCurrentDepartment:Dispatch<SetStateAction<IDepartment | null>>;
}

const DepartmentInfoModal = ({infoMode, setInfoMode, currentDepartment, setCurrentDepartment}:DepartmentInfoModalProps) => {
    const organization = currentDepartment?.org as IOrganization;
    
    const creator = currentDepartment?.createdBy as IUser;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    

    
    

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentDepartment(null);
    }

    if(!currentDepartment) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col w-full gap-4 mt-8' >

            

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <Linker tableId='95'  link={`/dashboard/departments/${currentDepartment?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={currentDepartment?.name || 'None'} />
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Head</span>
                {
                    creator?
                    <Linker tableId='38'  link={`/dashboard/users?Id=${creator?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />:
                    <span className="mtext">{currentDepartment?.creator || 'Unknown'}</span>
                }
            </div>

            
            <div className="flex flex-col">
                <span className="mlabel">Note</span>
                <span className="mtext">{currentDepartment?.description || 'None'}</span>
            </div>
            {
                isAdmin &&
                <div className="flex flex-col">
                    <span className="mlabel">Organization</span>
                    <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                {
                    creator?
                    <Linker tableId='38'  link={`/dashboard/users?Id=${creator?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />:
                    <span className="mtext">{currentDepartment?.creator || 'Unknown'}</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentDepartment?.createdAt)}</span>
            </div>
        </div>
        
    </InfoModalContainer>
  )
}

export default DepartmentInfoModal