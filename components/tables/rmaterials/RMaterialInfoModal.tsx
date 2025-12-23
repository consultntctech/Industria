import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
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
                <Link  href={`/dashboard/products/types?Id=${product?._id}`} className="mtext link">{product?.name}</Link>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Batch</span>
                <Link  href={`/dashboard/products/batches?Id=${batch?._id}`} className="mtext link">{batch?.code}</Link>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Supplier</span>
                <Link  href={`/dashboard/suppliers?Id=${supplier?._id}`} className="mtext link">{supplier?.name}</Link>
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
            <div className="flex flex-col">
                <span className="mlabel">Organization</span>
                <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <Link href={`/dashboard/users?Id=${creator?._id}`} className="mtext link">{creator?.name || 'None'}</Link>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default ProductInfoModal