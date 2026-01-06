'use client'
import  { useState } from 'react'
import Title from '../misc/Title'
import { IGood } from '@/lib/models/good.model';
import GoodsComp from '../Views/GoodsComp';
import GoodTable from '../tables/goods/GoodsTable';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';

const FinishedGoods = () => {
    const [currentGood, setCurrentGood] = useState<IGood | null>(null);
    const [openNew, setOpenNew] = useState(false);
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Finshed Goods" isLink={false}/>
        </div>
        <PermissionGuard tableId={['88']} >
          <GoodsComp openNew={openNew} setOpenNew={setOpenNew} currentGood={currentGood} setCurrentGood={setCurrentGood}/>
          <GoodTable setOpenNew={setOpenNew} currentGood={currentGood} setCurrentGood={setCurrentGood} />
        </PermissionGuard>
    </div>
  )
}

export default FinishedGoods