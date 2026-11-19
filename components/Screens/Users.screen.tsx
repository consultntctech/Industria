'use client'
import  { useState } from 'react'
import UsersComp from '../Views/Users.view'
import { IoMdAddCircle } from 'react-icons/io';
import { useCanCreateUsers, useSettings } from '@/config/useSettings';
import Title from '../misc/Title';
import UserTable from '../tables/users/UserTable';
import { IUser } from '@/lib/models/user.model';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';
import { useCanUser } from '@/hooks/useAuth';

const UsersScreen = () => {
    const [currentUser, setCurrentUser] = useState<IUser|null>(null);
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser('38', 'CREATE');
    // Org-level switch: when off, nobody here can create users (editing/deleting still works).
    const canCreateUsers = useCanCreateUsers();
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Users" isLink={false}/>
            {
                isCreator && canCreateUsers &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['38']} >
          {
            isCreator && !canCreateUsers &&
            <span className="greyText -mt-4">User account creation is turned off for your organization. You can still edit and delete existing users.</span>
          }
          <UsersComp currentUser={currentUser} openNew={openNew} setOpenNew={setOpenNew} setCurrentUser={setCurrentUser}/>
          <UserTable setOpenNew={setOpenNew} currentUser={currentUser} setCurrentUser={setCurrentUser}/>
        </PermissionGuard>
    </div>
  )
}

export default UsersScreen