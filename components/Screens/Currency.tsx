'use client';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider'
import Title from '../misc/Title'
import CurrencyComp from '../Views/CurrencyComp'
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import OtherCurrencyTable from '../tables/othercurrency/OtherCurrencyTable';
const Currency = () => {
  const {currency, refetch, currencyLoading, isSuccess} = useCurrencyConfig();
  
  
  
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Currency Setting" isLink={false}/>
        </div>
        <PermissionGuard tableId={['48']} >
          <CurrencyComp currency={currency} refetch={refetch} currencyLoading={currencyLoading} />
        </PermissionGuard>

        <PermissionGuard tableId={['48']} >
          <OtherCurrencyTable  isSuccess={isSuccess} currency={currency} />
        </PermissionGuard>
    </div>
  )
}

export default Currency