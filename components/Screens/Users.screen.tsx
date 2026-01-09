'use client'
import  { useState } from 'react'
import UsersComp from '../Views/Users.view'
import { IoMdAddCircle } from 'react-icons/io';
import { useSettings } from '@/config/useSettings';
import Title from '../misc/Title';
import UserTable from '../tables/users/UserTable';
import { IUser } from '@/lib/models/user.model';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';
import { useAuth } from '@/hooks/useAuth';
import { canUser } from '@/Data/roles/permissions';

const UsersScreen = () => {
    const [currentUser, setCurrentUser] = useState<IUser|null>(null);
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
    const {user} = useAuth();
    const isCreator = canUser(user, '38', 'CREATE');
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Users" isLink={false}/>
            {
                isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['38']} >
          <UsersComp currentUser={currentUser} openNew={openNew} setOpenNew={setOpenNew} setCurrentUser={setCurrentUser}/>
          <UserTable setOpenNew={setOpenNew} currentUser={currentUser} setCurrentUser={setCurrentUser}/>
        </PermissionGuard>
    </div>
  )
}

export default UsersScreen