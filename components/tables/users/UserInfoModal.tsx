import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import { IRole } from '@/lib/models/role.model';
import { IUser } from '@/lib/models/user.model';
import Image from 'next/image';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'

type UserInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentUser: IUser | null;
    setCurrentUser:Dispatch<SetStateAction<IUser | null>>;
}

const UserInfoModal = ({infoMode, setInfoMode, currentUser, setCurrentUser}:UserInfoModalProps) => {
    const organization = currentUser?.org as IOrganization;
    const roles = currentUser?.roles as IRole[];
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentUser(null);
    }

    if(!currentUser) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex-center w-full">
                <div className="flex-center w-fit bg-slate-300 rounded-full p-2">
                    <div className="h-20 w-20 relative rounded-full">
                        <Image fill className='rounded-full' alt='user' src={currentUser?.photo} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentUser?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentUser?.email}`} className="mtext link">{currentUser?.email}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentUser?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentUser?.address || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Roles</span>
                {
                    roles?.length > 0 ?
                    <div className="flex flex-col gap-2.5">
                    {
                        roles.map((role, index)=>(
                            <Link key={index} href={`/dashboard/users/roles?Id=${role?._id}`}  className="link">{role.name}</Link>
                        ))
                    }
                    </div>
                    :
                    <span className="mtext">None</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Organization</span>
                <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentUser?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentUser?.createdAt)}</span>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default UserInfoModal