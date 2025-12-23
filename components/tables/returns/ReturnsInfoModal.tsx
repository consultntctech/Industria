import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatTimestamp } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react'
import { ILineItem } from '@/lib/models/lineitem.model';
import { ICustomer } from '@/lib/models/customer.model';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IReturns } from '@/lib/models/returns.model';

type ReturnsInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentReturn: IReturns | null;
    setCurrentReturn:Dispatch<SetStateAction<IReturns | null>>;
}

const ReturnsInfoModal = ({infoMode, setInfoMode, currentReturn, setCurrentReturn}:ReturnsInfoModalProps) => {
    const creator = currentReturn?.createdBy as IUser;
    const org = currentReturn?.org as IOrganization;
    const lineitems = currentReturn?.products as ILineItem[];
    const customer = currentReturn?.customer as ICustomer;

    const {currency} = useCurrencyConfig();

    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentReturn(null);
    }

    if(!currentReturn) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >
            <div className="flex flex-col">
                <span className="mlabel">Return On</span>
                <span className="mtext">{formatTimestamp(currentReturn?.createdAt)}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Customer</span>
                <span className="mtext">{customer?.name}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Discounts</span>
                <span className="mtext">{currentReturn?.discount || '0'} {currency?.symbol || ''}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Charges</span>
                <span className="mtext">{currentReturn?.charges || '0'} {currency?.symbol || ''}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Total Price</span>
                <span className="mtext">{currentReturn?.price || '0'} {currency?.symbol || ''}</span>
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
                <span className="mlabel">Sales narration</span>
                <span className="mtext">{currentReturn?.narration || 'None'}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Return reason</span>
                <span className="mtext">{currentReturn?.reason || 'None'}</span>
            </div>
           
            
             <div className="flex flex-col">
                <span className="mlabel">Returned by</span>
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

export default ReturnsInfoModal