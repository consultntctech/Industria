'use client'
import  { useState } from 'react'
import RoletemplateComp from '../Views/RoletemplateComp'
import TopContent from '../misc/TopContent'
import RoletemplatesTable from '../tables/roletemplates/RoletemplatesTable'
import { IRoleTemplate } from '@/lib/models/roletemplate.model'
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'

const Roletemplate = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentRoletemplate, setCurrentRoletemplate] = useState<IRoleTemplate | null>(null);
  return (
    <TopContent isLink={false} title="Role Templates" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['23']} >
        <RoletemplateComp openNew={openNew} setOpenNew={setOpenNew} currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate}/>
        <RoletemplatesTable setOpenNew={setOpenNew} currentRoletemplate={currentRoletemplate} setCurrentRoletemplate={setCurrentRoletemplate} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Roletemplate