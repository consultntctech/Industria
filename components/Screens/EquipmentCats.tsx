'use client'
import  { useState } from 'react'
import Title from '../misc/Title'
import { IoMdAddCircle } from 'react-icons/io'
import { useSettings } from '@/config/useSettings';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';
import { useCanUser } from '@/hooks/useAuth';
import EquipCatComp from '../Views/EquipCatComp';
import ECategoryTable from '../tables/ecategories/ECategoryTable';
import { IECategory } from '@/lib/models/ecategory.model';

const EquipmentCats = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<IECategory | null>(null);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser('93', 'CREATE');
  return (
    <div className="flex flex-col w-full gap-8 ml-4 md:ml-4">
        <div className="flex flex-row items-center justify-between w-full">
            <Title title="Categories" isLink={false}/>
            {
              isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['93']} >
          <EquipCatComp openNew={openNew} setOpenNew={setOpenNew} currentCategory={currentCategory} setCurrentCategory={setCurrentCategory} />
          <ECategoryTable setCurrentCategory={setCurrentCategory} currentCategory={currentCategory} setOpenNew={setOpenNew} />
        </PermissionGuard>
    </div>
  )
}

export default EquipmentCats