import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
// import { TableData } from '@/Data/roles/table';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
// import { getRoleTitles } from '@/functions/helpers';
import { IOrganization } from '@/lib/models/org.model';
import { IRole } from '@/lib/models/role.model';
import { IRoleTemplate } from '@/lib/models/roletemplate.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type RoletemplateInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentRoletemplate: IRoleTemplate | null;
    setCurrentRoletemplate:Dispatch<SetStateAction<IRoleTemplate | null>>;
}

const RoletemplateInfoModal = ({infoMode, setInfoMode, currentRoletemplate, setCurrentRoletemplate}:RoletemplateInfoModalProps) => {
    const creator = currentRoletemplate?.createdBy as IUser;
    const org = currentRoletemplate?.org as IOrganization;
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    // const titles = getRoleTitles(currentRoletemplate);
    // const table = TableData.find(t=>t.id===currentRoletemplate?.permissions?.tableid);
    // console.log('Creator:', creator);
    const roles = currentRoletemplate?.roles as IRole[];
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentRoletemplate(null);
    }

    if(!currentRoletemplate) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentRoletemplate?.name}</span>
            </div>
            
            
            <div className="flex flex-col">
                <span className="mlabel">Roles</span>
                <div className="flex flex-col gap-2.5">
                    {
                        roles.map((role, index)=>(
                            <Linker tableId='27' key={index} link={`/dashboard/roles?Id=${role?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={role?.name} />
                        ))
                    }
                </div>
            </div>
            
            
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentRoletemplate?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentRoletemplate?.createdAt)}</span>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <Linker tableId='38' link={`/dashboard/users?Id=${creator?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />
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

export default RoletemplateInfoModal