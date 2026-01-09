'use client'
import  { useState } from 'react'
import RoletemplateComp from '../Views/RoletemplateComp'
import TopContent from '../misc/TopContent'
import RoletemplatesTable from '../tables/roletemplates/RoletemplatesTable'
import { IRoleTemplate } from '@/lib/models/roletemplate.model'
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import { useAuth } from '@/hooks/useAuth'
import { canUser } from '@/Data/roles/permissions'

const Roletemplate = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentRoletemplate, setCurrentRoletemplate] = useState<IRoleTemplate | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '23', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="Role Templates" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['23']} >
        <RoletemplateComp openNew={openNew} setOpenNew={setOpenNew} currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate}/>
        <RoletemplatesTable setOpenNew={setOpenNew} currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Roletemplate