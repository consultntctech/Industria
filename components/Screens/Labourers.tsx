'use client'
import  { useState } from 'react'
import LabourersComp from '../Views/LabourersComp'
import { IoMdAddCircle } from 'react-icons/io';
import { useSettings } from '@/config/useSettings';
import Title from '../misc/Title';
import LabourerTable from '../tables/labourers/LabourerTable';
import { ILabourer } from '@/lib/models/labourer.model';
import { PermissionGuard } from '@/hooks/permissions/PermissionProvider';
import { useCanUser } from '@/hooks/useAuth';

const LabourersScreen = () => {
    const [currentLabourer, setCurrentLabourer] = useState<ILabourer|null>(null);
    const [openNew, setOpenNew] = useState(false);
    const {primaryColour} = useSettings();
    const isCreator = useCanUser('91', 'CREATE');
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Labourers" isLink={false}/>
            {
                isCreator &&
              <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
            }
        </div>
        <PermissionGuard tableId={['91']} >
          <LabourersComp currentLabourer={currentLabourer} openNew={openNew} setOpenNew={setOpenNew} setCurrentLabourer={setCurrentLabourer}/>
          <LabourerTable setOpenNew={setOpenNew} currentLabourer={currentLabourer} setCurrentLabourer={setCurrentLabourer}/>
        </PermissionGuard>
    </div>
  )
}

export default LabourersScreen