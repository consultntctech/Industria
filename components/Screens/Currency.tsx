import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import Title from '../misc/Title'
import CurrencyComp from '../Views/CurrencyComp'

const Currency = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Currency Setting" isLink={false}/>
        </div>
        <PermissionGuard tableId={['48']} >
          <CurrencyComp />
        </PermissionGuard>
    </div>
  )
}

export default Currency