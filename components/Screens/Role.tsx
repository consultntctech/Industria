'use client'
import  { useState } from 'react'
import RoleComp from '../Views/RoleComp'
import TopContent from '../misc/TopContent'
import { IRole } from '@/lib/models/role.model'
import RolesTable from '../tables/roles/RolesTable'
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import { useAuth } from '@/hooks/useAuth'
import { canUser } from '@/Data/roles/permissions'

const Role = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentRole, setCurrentRole] = useState<IRole | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '27', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="User roles" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['27']} >
        <RoleComp openNew={openNew} setOpenNew={setOpenNew} currentRole={currentRole} setCurrentRole={setCurrentRole}/>
        <RolesTable setOpenNew={setOpenNew} currentRole={currentRole} setCurrentRole={setCurrentRole} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Role