import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatTimestamp } from '@/functions/dates';
import { ISales } from '@/lib/models/sales.model';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react'
import { ILineItem } from '@/lib/models/lineitem.model';
import { ICustomer } from '@/lib/models/customer.model';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';

type SalesInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentSale: ISales | null;
    setCurrentSale:Dispatch<SetStateAction<ISales | null>>;
}

const SalesInfoModal = ({infoMode, setInfoMode, currentSale, setCurrentSale}:SalesInfoModalProps) => {
    const creator = currentSale?.createdBy as IUser;
    const org = currentSale?.org as IOrganization;
    const lineitems = currentSale?.products as ILineItem[];
    const customer = currentSale?.customer as ICustomer;

    const {currency} = useCurrencyConfig();

    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentSale(null);
    }

    if(!currentSale) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >
            <div className="flex flex-col">
                <span className="mlabel">Sold On</span>
                <span className="mtext">{formatTimestamp(currentSale?.createdAt)}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Customer</span>
                <span className="mtext">{customer?.name}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Discounts</span>
                <span className="mtext">{currentSale?.discount || '0'} {currency?.symbol || ''}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Charges</span>
                <span className="mtext">{currentSale?.charges || '0'} {currency?.symbol || ''}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Total Price</span>
                <span className="mtext">{currentSale?.price || '0'} {currency?.symbol || ''}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Products ({lineitems?.length})</span>
                {
                    lineitems?.map((item) => (
                        <Link key={item?._id} href={`/dashboard/distribution/packaging/${item?.package?.toString()}`} className="mtext link">{item?.name}</Link>
                    ))
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Narration</span>
                <span className="mtext">{currentSale?.narration || 'None'}</span>
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

export default SalesInfoModal