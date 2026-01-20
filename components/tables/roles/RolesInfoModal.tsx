import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
import { TableData } from '@/Data/roles/table';
import { formatDate } from '@/functions/dates';
import { getRoleTitles } from '@/functions/helpers';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { IRole } from '@/lib/models/role.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type RolesInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentRole: IRole | null;
    setCurrentRole:Dispatch<SetStateAction<IRole | null>>;
}

const RolesInfoModal = ({infoMode, setInfoMode, currentRole, setCurrentRole}:RolesInfoModalProps) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const creator = currentRole?.createdBy as IUser;
    const org = currentRole?.org as IOrganization;
    const titles = getRoleTitles(currentRole);
    const table = TableData.find(t=>t.id===currentRole?.permissions?.tableid);
    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentRole(null);
    }

    if(!currentRole) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentRole?.name}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Table/Collection</span>
                <span className="mtext">{table?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Permissions</span>
                <div className="flex flex-row gap-2 flex-wrap">
                    {
                        titles.map((title, index)=>(
                            <span key={index}>
                                <span className="mtext">{title}</span>
                                {index < titles.length - 1 && ', '}
                            </span>
                        ))
                    }
                </div>
            </div>
            
            
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentRole?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentRole?.createdAt)}</span>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <Linker tableId='28' link={`/dashboard/users?Id=${creator?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />
            </div>
            {
                isAdmin &&
                <div className="flex flex-col">
                    <span className="mlabel">Organization</span>
                    <Link href={`/dashboard/organization?Id=${org?._id}`} className="mtext link">{org?.name || 'None'}</Link>
                </div>
            }
        </div>
    </InfoModalContainer>
  )
}

export default RolesInfoModal