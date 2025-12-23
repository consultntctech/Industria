import { useSettings } from '@/config/useSettings';
import { IBatch } from '@/lib/models/batch.model';
import { IProduct } from '@/lib/models/product.model';
import { IProduction } from '@/lib/models/production.model';
import { IUser } from '@/lib/models/user.model';
import { Tooltip } from '@mui/material';
import Link from 'next/link';
import  { Dispatch, SetStateAction, useState } from 'react'
import { FaPenToSquare } from 'react-icons/fa6';
import InputDetailsModal from './InputDetailsModal';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
// import { formatDate } from '@/functions/dates';

type InputDetailsProps = {
    production: IProduction | null;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

const InputDetails = ({production, setActiveTab}:InputDetailsProps) => {
    const [openNew, setOpenNew] = useState(false);
    const productToProduce = production?.productToProduce as IProduct;
    const batch = production?.batch as IBatch;
    const supervisor = production?.supervisor as IUser;
    const creator = production?.createdBy as IUser;
    const {primaryColour} = useSettings();
    const {currency} = useCurrencyConfig();
  return (
    <div className="formBox p-3 flex-col gap-4 relative">
        {
            !(production?.status === 'Pending Approval' || production?.status === 'Approved') &&
            <Tooltip title="Edit Production Details">
                <FaPenToSquare onClick={()=>setOpenNew(true)} color={primaryColour} className='cursor-pointer absolute top-1 right-1' />
            </Tooltip>
        }
        <InputDetailsModal production={production} openNew={openNew} setOpenNew={setOpenNew} />
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Name:</span>
          <span className="text-gray-600 truncate " >{production?.name}</span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Product to produce:</span>
          <Link className="" href={`/dashboard/products/types?Id=${productToProduce?._id}`} >
            <span className="text-blue-600 underline " >{productToProduce?.name}</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Status:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{production?.status}</span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Batch:</span>
          <Link className="" href={`/dashboard/products/batches?Id=${batch?._id}`} >
            <span className="text-blue-600 underline " >{batch?.code}</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Raw Materials:</span>
          <span onClick={()=>setActiveTab('second')}  className="text-blue-600 underline cursor-pointer" >{production?.ingredients?.length}</span>
        </div>
{/* 
        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Production Materials:</span>
          <span onClick={()=>setActiveTab('third')}  className="text-blue-600 underline cursor-pointer" >{production?.proditems?.length}</span>
        </div> */}

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Expected Output:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{production?.xquantity}</span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Production Cost:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{`${currency?.symbol || ''}${production?.productionCost}`}</span>
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

export default InputDetails