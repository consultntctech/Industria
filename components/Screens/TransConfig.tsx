'use client';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import Title from '../misc/Title'
import TransConfigComp from '../Views/TransConfigComp';
const TransConfig = () => {  
  
  
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4 items-start">
        <div className="flex w-full md:w-4/5">
            <Title title="Transaction Configuration" isLink={false}/>
        </div>
        <PermissionGuard tableId={['48']} >
          <TransConfigComp />
        </PermissionGuard>
    </div>
  )
}

export default TransConfig