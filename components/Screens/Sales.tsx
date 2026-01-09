'use client'
import  { useState } from 'react'
import TopContent from '../misc/TopContent'

import SalesComp from '../Views/SalesComp'
import { ISales } from '@/lib/models/sales.model'
import SalesTable from '../tables/sales/SalesTable'
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import { useAuth } from '@/hooks/useAuth'
import { canUser } from '@/Data/roles/permissions'

const Sales = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentSales, setCurrentSales] = useState<ISales | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '82', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="Sales" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['82']} >
        <SalesComp openNew={openNew} setOpenNew={setOpenNew} currentSales={currentSales} setCurrentSales={setCurrentSales} />
        <SalesTable currentSales={currentSales} setCurrentSales={setCurrentSales} setOpenNew={setOpenNew} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Sales