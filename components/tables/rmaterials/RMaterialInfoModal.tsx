import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { useAuth } from '@/hooks/useAuth';
import { IBatch } from '@/lib/models/batch.model';
import { IOrganization } from '@/lib/models/org.model';
import { IProduct } from '@/lib/models/product.model';
import { IRMaterial } from '@/lib/models/rmaterial.mode';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type ProductInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentMaterial: IRMaterial | null;
    setCurrentMaterial:Dispatch<SetStateAction<IRMaterial | null>>;
}

const ProductInfoModal = ({infoMode, setInfoMode, currentMaterial, setCurrentMaterial}:ProductInfoModalProps) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const organization = currentMaterial?.org as IOrganization;
    const batch = currentMaterial?.batch as IBatch;
    const creator = currentMaterial?.createdBy as IUser;
    const supplier = currentMaterial?.supplier as ISupplier;
    const product = currentMaterial?.product as IProduct;
    const used = (currentMaterial?.qReceived || 0) - (currentMaterial?.qAccepted ||0) - (currentMaterial?.qRejected||0);
    const {currency} = useCurrencyConfig();

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentMaterial(null);
    }

    if(!currentMaterial) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Product Name</span>
                <span className="mtext">{currentMaterial?.materialName}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Product</span>
                <Linker  link={`/dashboard/products/types?Id=${product?._id}`} linkStyle="mtext link" spanStyle='mtext' tableId="28" placeholder={product?.name} />
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Batch</span>
                <Linker  link={`/dashboard/products/batches?Id=${batch?._id}`} linkStyle="mtext link" spanStyle='mtext' tableId="55" placeholder={batch?.code} />
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Supplier</span>
                <Linker  link={`/dashboard/suppliers?Id=${supplier?._id}`} linkStyle="mtext link" spanStyle='mtext' tableId="41" placeholder={supplier?.name} />
            </div>
            
            
            <div className="flex flex-col">
                <span className="mlabel">Quantity Received</span>
                <span className="mtext">{currentMaterial?.qReceived}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity Used</span>
                <span className="mtext">{used}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity Rejected</span>
                <span className="mtext">{currentMaterial?.qRejected}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Reason for Rejection</span>
                <span className="mtext">{currentMaterial?.reason || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Unit Price</span>
                <span className="mtext">{currency?.symbol}{currentMaterial?.unitPrice}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Discounts</span>
                <span className="mtext">{currency?.symbol}{currentMaterial?.discount}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Extra Charges</span>
                <span className="mtext">{currency?.symbol}{currentMaterial?.charges}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Price Paid</span>
                <span className="mtext">{currency?.symbol}{currentMaterial?.price}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Quality Status</span>
                <span className="mtext">{currentMaterial?.qStatus}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Date Received</span>
                <span className="mtext">{formatDate(currentMaterial?.dateReceived)}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentMaterial?.note || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentMaterial?.createdAt)}</span>
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

export default ProductInfoModal