import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { IEType } from '@/lib/models/etype.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IUser } from '@/lib/models/user.model';
import { IECategory } from '@/lib/models/ecategory.model';

type ETypeInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentEType: IEType | null;
    setCurrentEType:Dispatch<SetStateAction<IEType | null>>;
}

const ETypeInfoModal = ({infoMode, setInfoMode, currentEType, setCurrentEType}:ETypeInfoModalProps) => {
    const organization = currentEType?.org as IOrganization;
    
    const creator = currentEType?.createdBy as IUser;
    const category = currentEType?.category as IECategory;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    

    
    

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentEType(null);
    }

    if(!currentEType) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col w-full gap-4 mt-8' >

            

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentEType?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Category</span>
                <Linker tableId='93'  link={`/dashboard/equipment/categories?Id=${category?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={category?.name || 'None'} />
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Total Quantity</span>
                <span className="mtext">{currentEType?.qTotal || '0'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity Available</span>
                <span className="mtext">{currentEType?.qAvailable || '0'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity In Use</span>
                <span className="mtext">{currentEType?.qInUse || '0'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity In Maintenance</span>
                <span className="mtext">{currentEType?.qMaintenance || '0'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Note</span>
                <span className="mtext">{currentEType?.description || 'None'}</span>
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
                    <span className="mtext">{currentEType?.creator || 'Unknown'}</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentEType?.createdAt)}</span>
            </div>
        </div>
        
    </InfoModalContainer>
  )
}

export default ETypeInfoModal