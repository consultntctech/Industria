import { useSettings } from '@/config/useSettings';
import { IBatch } from '@/lib/models/batch.model';
import { IUser } from '@/lib/models/user.model';
import { Tooltip } from '@mui/material';
import  { Dispatch, SetStateAction, useState } from 'react'
import { FaPenToSquare } from 'react-icons/fa6';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IGoodsPopulate, IPackage } from '@/lib/models/package.model';
import { IGood } from '@/lib/models/good.model';
import { IStorage } from '@/lib/models/storage.model';
import PackInputDetailsModal from './PackInputDetailsModal';
import { IProduction } from '@/lib/models/production.model';
import { useAuth } from '@/hooks/useAuth';
import { canUser } from '@/Data/roles/permissions';
import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
// import { formatDate } from '@/functions/dates';

type PackInputDetailsProps = {
    pack: IPackage | null;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

const PackInputDetails = ({pack, setActiveTab}:PackInputDetailsProps) => {
    const [openNew, setOpenNew] = useState(false);
    const {user} = useAuth();
    const isEditor = canUser(user, '99', 'UPDATE');
    
    const batch = pack?.batch as IBatch;
    const supervisor = pack?.supervisor as IUser;
    const creator = pack?.createdBy as IUser;
    const products = pack?.goods as IGoodsPopulate[]
    const storage = pack?.storage as IStorage;

    // console.log('Package: ', pack)

    const {primaryColour} = useSettings();
    const {currency} = useCurrencyConfig();
  return (
    <div className="formBox p-3 flex-col gap-4 relative">
        {
            !(pack?.approvalStatus === 'Approved') && isEditor &&
            <Tooltip title="Edit Package Details">
                <FaPenToSquare onClick={()=>setOpenNew(true)} color={primaryColour} className='cursor-pointer absolute top-1 right-1' />
            </Tooltip>
        }
        <PackInputDetailsModal pack={pack} openNew={openNew} setOpenNew={setOpenNew} />
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Name:</span>
          <span className="text-gray-600 truncate " >{pack?.name}</span>
        </div>
        
        <div className="flex flex-row items-start gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Finished good:</span>
          {
            products.length > 0 &&
            products?.map((item, index)=>{
              const product = item?.goodId as IGood;
              const production = product?.production as IProduction;
              // console.log('Good: ', product)
              return (
                <span key={index} >
                  <Linker tableId='88' linkStyle="link" spanStyle='text-gray-600 truncate' link={`/dashboard/processing/goods?Id=${product?._id}`} placeholder={`${item?.quantity} x ${product?.name} (${production?.name})`} />
                  {index < products.length -1 && ', '}
                </span>
              )
            })
          }
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
          <Linker tableId='77' linkStyle="link" spanStyle='text-gray-600 flex-1 md:flex-5' link={`/dashboard/storage?Id=${storage?._id}`} placeholder={storage?.name} />
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Batch:</span>
          <Linker tableId='55' spanStyle='text-gray-600 flex-1 md:flex-5' linkStyle="link" link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code} />
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
          <Linker tableId='38' linkStyle="link" spanStyle='text-gray-600 flex-1 md:flex-5' link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} />
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Supervised By:</span>
          <Linker tableId='38' linkStyle="link" spanStyle='text-gray-600 flex-1 md:flex-5' link={`/dashboard/users?Id=${supervisor?._id}`} placeholder={supervisor?.name} />
        </div>

      </div>
  )
}

export default PackInputDetails