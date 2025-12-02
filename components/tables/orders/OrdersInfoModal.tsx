import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatTimestamp } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'
import { ICustomer } from '@/lib/models/customer.model';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IOrder } from '@/lib/models/order.model';
import { IProduct } from '@/lib/models/product.model';
import { isDeadlinePast } from '@/functions/helpers';

type OrdersInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentOrder: IOrder | null;
    setCurrentOrders:Dispatch<SetStateAction<IOrder | null>>;
}

const OrdersInfoModal = ({infoMode, setInfoMode, currentOrder, setCurrentOrders}:OrdersInfoModalProps) => {
    const creator = currentOrder?.createdBy as IUser;
    const org = currentOrder?.org as IOrganization;
    const product = currentOrder?.product as IProduct;
    const customer = currentOrder?.customer as ICustomer;

    const {currency} = useCurrencyConfig();

    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentOrders(null);
    }

    if(!currentOrder) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >
            <div className="flex flex-col">
                <span className="mlabel">Ordered On</span>
                <span className="mtext">{formatTimestamp(currentOrder?.createdAt)}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Customer</span>
                <span className="mtext">{customer?.name}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Product</span>
                <Link href={`/dashboard/products/types?Id=${product?._id}`} className="mtext link">{product?.name}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity</span>
                <span className="mtext">{currentOrder?.quantity || 0}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Amount Received</span>
                <span className="mtext">{currency?.symbol || ''} {currentOrder?.price || '0'} </span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Status</span>
                <span className="mtext">{currentOrder?.status}</span>
            </div>
            {
                currentOrder?.status === 'Fulfilled' &&
                <div className="flex flex-col">
                    <span className="mlabel">Response time</span>
                    <span className="mtext">{isDeadlinePast(currentOrder) ? 'Late' : 'On time'}</span>
                </div>
            }
           
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentOrder?.description || 'None'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Sales Personnel</span>
                <Link href={`/dashboard/users?Id=${creator?._id}`} className="mtext link">{creator?.name || 'None'}</Link>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Organization</span>
                <Link href={`/dashboard/organization?Id=${org?._id}`} className="mtext link">{org?.name || 'None'}</Link>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default OrdersInfoModal