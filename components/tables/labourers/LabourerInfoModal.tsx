import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { ILabourer } from '@/lib/models/labourer.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IUser } from '@/lib/models/user.model';

type LabourerInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentLabourer: ILabourer | null;
    setCurrentLabourer:Dispatch<SetStateAction<ILabourer | null>>;
}

const LabourerInfoModal = ({infoMode, setInfoMode, currentLabourer, setCurrentLabourer}:LabourerInfoModalProps) => {
    const organization = currentLabourer?.org as IOrganization;
    
    const creator = currentLabourer?.createdBy as IUser;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    

    
    

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentLabourer(null);
    }

    if(!currentLabourer) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col w-full gap-4 mt-8' >

            

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentLabourer?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentLabourer?.email}`} className="mtext link">{currentLabourer?.email}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentLabourer?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentLabourer?.address || 'None'}</span>
            </div>
            
            {
                isAdmin &&
                <div className="flex flex-col">
                    <span className="mlabel">Organization</span>
                    <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Additional Note</span>
                <span className="mtext">{currentLabourer?.note || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                {
                    creator?
                    <Linker tableId='38'  link={`/dashboard/users?Id=${creator?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />:
                    <span className="mtext">{currentLabourer?.creator || 'Unknown'}</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentLabourer?.createdAt)}</span>
            </div>
        </div>
        
    </InfoModalContainer>
  )
}

export default LabourerInfoModal