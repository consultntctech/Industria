import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IProduct } from '@/lib/models/product.model';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IBatch } from '@/lib/models/batch.model';
import { ILineItem } from '@/lib/models/lineitem.model';
import { IPackage } from '@/lib/models/package.model';
import { IGood } from '@/lib/models/good.model';
import { useAuth } from '@/hooks/useAuth';
import { isSystemAdmin } from '@/Data/roles/permissions';
import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';

type LineItemsInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentLineItem: ILineItem | null;
    setCurrentLineItem:Dispatch<SetStateAction<ILineItem | null>>;
}

const LineItemsInfoModal = ({infoMode, setInfoMode, currentLineItem, setCurrentLineItem}:LineItemsInfoModalProps) => {
    const organization = currentLineItem?.org as IOrganization;
    const creator = currentLineItem?.createdBy as IUser;
    const pack = currentLineItem?.package as IPackage;
    const product = currentLineItem?.product as IProduct;
    const good = currentLineItem?.good as IGood;
    const batch = currentLineItem?.batch as IBatch;
    const {currency} = useCurrencyConfig();

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentLineItem(null);
    }

    if(!currentLineItem) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentLineItem?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Serial Number</span>
                <span className="mtext">{currentLineItem?.serialNumber || 'Not set'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Price</span>
                <span className="mtext">{currentLineItem?.price ? `${currency?.symbol||''}${currentLineItem?.price}` : 'Not set'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Status</span>
                <span className="mtext">{currentLineItem?.status}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Batch</span>
                <Link  href={`/dashboard/products/batches?Id=${batch?._id}`} className="mtext link">{batch?.code}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Product</span>
                <Link  href={`/dashboard/products/types?Id=${product?._id}`} className="mtext link">{product?.name}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Finished Good</span>
                <Link  href={`/dashboard/processing/goods?Id=${good?._id}`} className="mtext link">{good?.name}</Link>
            </div>  
            <div className="flex flex-col">
                <span className="mlabel">Package</span>
                <Link  href={`/dashboard/distribution/packaging/${pack?._id}`} className="mtext link">{pack?.name}</Link>
            </div>  

            
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentLineItem?.createdAt)}</span>
            </div>
            {
                isAdmin &&
                <div className="flex flex-col">
                    <span className="mlabel">Organization</span>
                    <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
                </div>
            }

            <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <Linker tableId='38' link={`/dashboard/users?Id=${creator?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default LineItemsInfoModal