import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
// import { TableData } from '@/Data/roles/table';
import { formatDate } from '@/functions/dates';
// import { getRoleTitles } from '@/functions/helpers';
import { IOrganization } from '@/lib/models/org.model';
import { IRole } from '@/lib/models/role.model';
import { IRoleTemplate } from '@/lib/models/roletemplate.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'

type RoletemplateInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentRoletemplate: IRoleTemplate | null;
    setCurrentRoletemplate:Dispatch<SetStateAction<IRoleTemplate | null>>;
}

const RoletemplateInfoModal = ({infoMode, setInfoMode, currentRoletemplate, setCurrentRoletemplate}:RoletemplateInfoModalProps) => {
    const creator = currentRoletemplate?.createdBy as IUser;
    const org = currentRoletemplate?.org as IOrganization;
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
                            <Link key={index} href={`/dashboard/users/roles?Id=${role?._id}`} className="link">{role?.name}</Link>
                            
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
                <Link href={`/dashboard/users?Id=${creator?._id}`} className="mtext link">{creator?.name || 'None'}</Link>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Organization</span>
                <Link href={`/dashboard/organization?Id=${org?._id}`} className="mtext link">{org?.name || 'None'}</Link>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default RoletemplateInfoModal