import { useSettings } from '@/config/useSettings';
import { IBatch } from '@/lib/models/batch.model';
import { IProduct } from '@/lib/models/product.model';
import { IProduction } from '@/lib/models/production.model';
import { IUser } from '@/lib/models/user.model';
import { Tooltip } from '@mui/material';
import  { Dispatch, SetStateAction, useState } from 'react'
import { FaPenToSquare } from 'react-icons/fa6';
import InputDetailsModal from './InputDetailsModal';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { useAuth } from '@/hooks/useAuth';
import { canUser } from '@/Data/roles/permissions';
import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import { enqueueSnackbar } from 'notistack';
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

    const {user} = useAuth();
    const isEditor = canUser(user, '8', 'UPDATE');
    const isRawReader = canUser(user, '87', 'READ');

    const handleClickOnRawMaterials = ()=>{
      if(isRawReader){
        setActiveTab('second');
      }else{
        enqueueSnackbar('You do not have permission to view raw materials', {variant:'error'});
      }
    }

  return (
    <div className="formBox p-3 flex-col gap-4 relative">
        {
            !(production?.status === 'Pending Approval' || production?.status === 'Approved') && isEditor &&
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
          <Linker tableId='28' linkStyle="link" spanStyle='text-gray-600 flex-1 md:flex-5' link={`/dashboard/products/types?Id=${productToProduce?._id}`} placeholder={productToProduce?.name} />
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Status:</span>
          <span className="text-gray-600 flex-1 md:flex-5" >{production?.status}</span>
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Batch:</span>
          <Linker linkStyle="link" link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code} tableId='55' spanStyle='text-gray-600 flex-1 md:flex-5' />
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Raw Materials:</span>
          <span onClick={handleClickOnRawMaterials}  className="text-blue-600 underline cursor-pointer" >{production?.ingredients?.length}</span>
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
          <Linker linkStyle="link" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId='38' spanStyle='text-gray-600 flex-1 md:flex-5' />
        </div>

        <div className="flex flex-row items-center gap-4">
          <span className="truncate w-1/2 md:w-1/5" >Supervised By:</span>
          <Linker linkStyle="link" link={`/dashboard/users?Id=${supervisor?._id}`} placeholder={supervisor?.name} tableId='38' spanStyle='text-gray-600 flex-1 md:flex-5' />
        </div>

      </div>
  )
}

export default InputDetails