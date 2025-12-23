'use client'
import  { useState } from 'react'
import UsersComp from '../Views/Users.view'
import { IoMdAddCircle } from 'react-icons/io';
import { useSettings } from '@/config/useSettings';
import Title from '../misc/Title';
import UserTable from '../tables/users/UserTable';
import { IUser } from '@/lib/models/user.model';

const UsersScreen = () => {
    const [currentUser, setCurrentUser] = useState<IUser|null>(null);
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Users" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <UsersComp currentUser={currentUser} openNew={openNew} setOpenNew={setOpenNew} setCurrentUser={setCurrentUser}/>
        <UserTable setOpenNew={setOpenNew} currentUser={currentUser} setCurrentUser={setCurrentUser}/>
    </div>
  )
}

export default UsersScreen