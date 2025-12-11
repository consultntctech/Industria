'use client'
import React, { useState } from 'react'
import RoleComp from '../Views/RoleComp'
import TopContent from '../misc/TopContent'
import { IRole } from '@/lib/models/role.model'
import RolesTable from '../tables/roles/RolesTable'

const Role = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentRole, setCurrentRole] = useState<IRole | null>(null);
  return (
    <TopContent isLink={false} title="User roles" openNew={openNew} setOpenNew={setOpenNew}>
        <RoleComp openNew={openNew} setOpenNew={setOpenNew} currentRole={currentRole} setCurrentRole={setCurrentRole}/>
        <RolesTable setOpenNew={setOpenNew} currentRole={currentRole} setCurrentRole={setCurrentRole} />
    </TopContent>
  )
}

export default Role