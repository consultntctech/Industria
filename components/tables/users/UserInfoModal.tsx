import CustomTabs from '@/components/misc/CustomTabs';
import DialogueAlet from '@/components/misc/DialogueAlet';
import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isDbGlobalAdmin,  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth, useIsGlobalAdmin } from '@/hooks/useAuth';
import { updateUser } from '@/lib/actions/user.action';
import { IOrganization } from '@/lib/models/org.model';
import { IRole } from '@/lib/models/role.model';
import { IUser } from '@/lib/models/user.model';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5';

type UserInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentUser: IUser | null;
    setCurrentUser:Dispatch<SetStateAction<IUser | null>>;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IUser[], Error>>
}

const UserInfoModal = ({infoMode, setInfoMode, currentUser, setCurrentUser, refetch}:UserInfoModalProps) => {
    const [showButton, setShowButton] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('first');
    const organization = currentUser?.org as IOrganization;
    const [roles, setRoles] = useState<IRole[]>([]);
    const userRoles = currentUser?.roles as IRole[];
    const [showDialog, setShowDialog] = useState(false);

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const isGlobal = useIsGlobalAdmin();
    const isG = isDbGlobalAdmin(currentUser?.roles);
    const canSeeActions = (isGlobal || isAdmin) || !isG;

    useEffect(()=>{
        if(currentUser){
            setRoles(userRoles);
        }
    },[currentUser])

    const handleRemove = (role:IRole) => {
        setRoles((pre)=> pre.filter(r=>r._id !== role._id));
        setShowButton(true)
    }

    const handleCancel = ()=>{
        setShowButton(false);
        setRoles(userRoles);
    }
    
    const handleSave = async()=>{
        try {
            const userData:Partial<IUser> = {
                ...currentUser,
                roles,
                hasRequestedUpdate:true
            }
            const res = await updateUser(userData);
            enqueueSnackbar(res.message, {variant: res?.error ? 'error':'success'});
            handleCancel();
            refetch();
            setShowDialog(false);
            handleClose();
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Failed to save user roles', {variant:'error'});
        }
    }

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentUser(null);
    }
    const content = `You're about to alter the roles of ${currentUser?.name}. Are you sure you want to proceed?`;

    if(!currentUser) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <DialogueAlet agreeClick={handleSave} title='Edit user roles' content={content} open={showDialog} handleClose={()=>setShowDialog(false)} />
        <CustomTabs FirstTabText='Details' activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')} SecondTabText='Roles' onClickSecondTab={()=>setActiveTab('second')}  showSecondTab={true} />
        {
            activeTab === 'first' &&
            <div className='flex flex-col w-full gap-4 mt-8' >

                <div className="w-full flex-center">
                    <div className="p-2 rounded-full flex-center w-fit bg-slate-300">
                        <div className="relative w-20 h-20 rounded-full">
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
                
                {
                    isAdmin &&
                    <div className="flex flex-col">
                        <span className="mlabel">Organization</span>
                        <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
                    </div>
                }
                <div className="flex flex-col">
                    <span className="mlabel">Description</span>
                    <span className="mtext">{currentUser?.description || 'None'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="mlabel">Created</span>
                    <span className="mtext">{formatDate(currentUser?.createdAt)}</span>
                </div>
            </div>
        }
        {
            activeTab === 'second' &&
            <div className="flex flex-col mt-8">
                <span className="mlabel">Roles</span>
                {
                    canSeeActions ? 
                    <>
                    {
                        roles?.length > 0 ?
                        <div className="flex flex-col gap-2.5">
                        {
                            roles.map((role, index)=>(
                                <div key={index}  className="flex flex-row items-center justify-between gap-4">
                                    <Linker tableId='27' link={`/dashboard/roles?Id=${role?._id}`}  linkStyle="link mtext" spanStyle='mtext' placeholder={role?.name} />
                                    <div onClick={()=>handleRemove(role)}  className="p-1 rounded-full cursor-pointer flex-center bg-slate-400">
                                        <IoClose />
                                    </div>
                                </div>
                            ))
                        }
                        </div>
                        :
                        <span className="mtext">None</span>
                    }
                    {
                        showButton &&
                        <div className="w-full gap-4 mt-6 flex-center">
                            <button onClick={()=>setShowDialog(true)}  className='w-full py-0.5 border border-blue-400 rounded-2xl hover:bg-blue-200 cursor-pointer' >Save</button>
                            <button onClick={handleCancel} className='w-full py-0.5 border border-slate-400 rounded-2xl hover:bg-slate-200 cursor-pointer' >Cancel</button>
                        </div>
                    }
                    </>
                    :
                    <span className="mtext">You don't have permission to edit this user's roles</span>
                }
            </div>
        }
    </InfoModalContainer>
  )
}

export default UserInfoModal