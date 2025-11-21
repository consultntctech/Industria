import { useSettings } from '@/config/useSettings';
import { IBatch } from '@/lib/models/batch.model';
import { IUser } from '@/lib/models/user.model';
import { Tooltip } from '@mui/material';
import Link from 'next/link';
import React, { Dispatch, SetStateAction, useState } from 'react'
import { FaPenToSquare } from 'react-icons/fa6';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IPackage } from '@/lib/models/package.model';
import { IGood } from '@/lib/models/good.model';
import { IStorage } from '@/lib/models/storage.model';
import PackInputDetailsModal from './PackInputDetailsModal';
// import { formatDate } from '@/functions/dates';

type PackInputDetailsProps = {
    pack: IPackage | null;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

const PackInputDetails = ({pack, setActiveTab}:PackInputDetailsProps) => {
    const [openNew, setOpenNew] = useState(false);
    
    const batch = pack?.batch as IBatch;
    const supervisor = pack?.supervisor as IUser;
    const creator = pack?.createdBy as IUser;
    const product = pack?.good as IGood;
    const storage = pack?.storage as IStorage;

    const {primaryColour} = useSettings();
    const {currency} = useCurrencyConfig();
  return (
    <div className="formBox p-3 flex-col gap-4 relative">
        {
            !(pack?.approvalStatus === 'Approved') &&
            <Tooltip title="Edit Package Details">
                <FaPenToSquare onClick={()=>setOpenNew(true)} color={primaryColour} className='cursor-pointer absolute top-1 right-1' />
            </Tooltip>
        }
        <PackInputDetailsModal pack={pack} openNew={openNew} setOpenNew={setOpenNew} />
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Name:</span>
          <span className="text-gray-600 truncate " >{pack?.name}</span>
        </div>
        
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Finished good:</span>
          <Link className="" href={`/dashboard/processing/goods?Id=${product?._id}`} >
            <span className="text-blue-600 underline " >{product?.name}</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Quanity:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.quantity}</span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Package Type:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.packagingType}</span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Accepted quantity:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.accepted}</span>
        </div>
        {
          (pack?.rejected ||0) > 0 &&
          <div className="flex flex-row items-center gap-4">
            <span className="truncate w-1/2 md:w-1/5" >Rejected quantity:</span>
            <span className="text-gray-600 flex-1 md:flex-5" >{pack?.rejected}</span>
          </div>
        }
        {
          pack?.weight &&
          <div className="flex flex-row items-center gap-4">
            <span className="truncate w-1/2 md:w-1/5" >Package weight:</span>
            <span className="text-gray-600 flex-1 md:flex-5" >{pack?.weight}</span>
          </div>
        }
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Quality Status</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.qStatus}</span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Storage:</span>
          <Link className="" href={`/dashboard/storage?Id=${storage?._id}`} >
            <span className="text-blue-600 underline " >{storage?.name}</span>
          </Link>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Batch:</span>
          <Link className="" href={`/dashboard/products/batches?Id=${batch?._id}`} >
            <span className="text-blue-600 underline " >{batch?.code}</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Used production batch:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.useProdBatch ? 'Yes' : 'No'}</span>
        </div>
        {
          (pack?.packagingMaterial?.length || 0) > 0 &&
          <div className="flex flex-row items-center gap-4">
            <span className="truncate w-1/2 md:w-1/5" >Packaging materials:</span>
            <span onClick={()=>setActiveTab('third')}  className="text-blue-600 underline cursor-pointer" >{pack?.packagingMaterial?.length}</span>
          </div>
        }


        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Packaging note:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{pack?.description || 'None'}</span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Packaging Cost:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{`${currency?.symbol || ''}${pack?.cost}`}</span>
        </div>


        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Started By:</span>
          <Link className="" href={`/dashboard/users?Id=${creator?._id}`} >
            <span className="text-blue-600 underline " >{creator?.name}</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Supervised By:</span>
          <Link className="" href={`/dashboard/users?Id=${supervisor?._id}`} >
            <span className="text-blue-600 underline " >{supervisor?.name}</span>
          </Link>
        </div>

      </div>
  )
}

export default PackInputDetails