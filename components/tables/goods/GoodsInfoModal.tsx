import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import { IGood } from '@/lib/models/good.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IProduction } from '@/lib/models/production.model';
import { IProduct } from '@/lib/models/product.model';
// import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IBatch } from '@/lib/models/batch.model';
import { useAuth } from '@/hooks/useAuth';
import { isSystemAdmin } from '@/Data/roles/permissions';
import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';

type GoodsInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentGood: IGood | null;
    setCurrentGood:Dispatch<SetStateAction<IGood | null>>;
}

const GoodsInfoModal = ({infoMode, setInfoMode, currentGood, setCurrentGood}:GoodsInfoModalProps) => {
    const organization = currentGood?.org as IOrganization;
    const creator = currentGood?.createdBy as IUser;
    const production = currentGood?.production as IProduction;
    const product = production?.productToProduce as IProduct;
    const batch = currentGood?.batch as IBatch;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    // const {currency} = useCurrencyConfig();

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentGood(null);
    }

    if(!currentGood) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentGood?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Serial Name</span>
                <span className="mtext">{currentGood?.serialName}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Batch</span>
                <Linker tableId='55' link={`/dashboard/products/batches?Id=${batch?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={batch?.code} />
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Product</span>
                <Linker tableId='28' spanStyle='mtext' placeholder={product?.name} link={`/dashboard/products/types?Id=${product?._id}`} linkStyle="mtext link" />
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Production</span>
                <Linker placeholder={production?.name} spanStyle='mtext' tableId='8' link={`/dashboard/processing/production/${production?._id}`} linkStyle="mtext link" />
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Quanity</span>
                <span className="mtext">{currentGood?.quantity}</span>
            </div>

            {/* <div className="flex flex-col">
                <span className="mlabel">Unit Price</span>
                <span className="mtext">{currentGood?.unitPrice ? `${currency?.symbol||''}${currentGood?.unitPrice}` : 'Not set'}</span>
            </div> */}

            {/* <div className="flex flex-col">
                <span className="mlabel">Threshold</span>
                <span className="mtext">{currentGood?.threshold}</span>
            </div> */}
            

            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentGood?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentGood?.createdAt)}</span>
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
                <Linker linkStyle='link mtext' spanStyle='mtext' tableId="38" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name || 'None'} />
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default GoodsInfoModal