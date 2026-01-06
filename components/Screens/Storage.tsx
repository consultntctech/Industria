'use client'
import  { useState } from 'react'
import StorageComp from '../Views/StorageComp'
import TopContent from '../misc/TopContent'
import StorageTable from '../tables/storage/StorageTable'
import { IStorage } from '@/lib/models/storage.model'
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'

const Storage = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentStorage, setCurrentStorage] = useState<IStorage | null>(null);
  return (
    <TopContent isLink={false} title="Storage" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['77']} >
        <StorageComp openNew={openNew} setOpenNew={setOpenNew} currentStorage={currentStorage} setCurrentStorage={setCurrentStorage}/>
        <StorageTable setOpenNew={setOpenNew} currentStorage={currentStorage} setCurrentStorage={setCurrentStorage} />
      </PermissionGuard>
    </TopContent>
  )
}

export default Storage