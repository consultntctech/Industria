import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { ICustomer } from '@/lib/models/customer.model';
import { IOrganization } from '@/lib/models/org.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'

type CustomersInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentCustomer: ICustomer | null;
    setCurrentCustomer:Dispatch<SetStateAction<ICustomer | null>>;
}

const CustomersInfoModal = ({infoMode, setInfoMode, currentCustomer, setCurrentCustomer}:CustomersInfoModalProps) => {
    const creator = currentCustomer?.createdBy as IUser;
    const org = currentCustomer?.org as IOrganization;
    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentCustomer(null);
    }

    if(!currentCustomer) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentCustomer?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentCustomer?.email}`}  className="mtext link">{currentCustomer?.email}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentCustomer?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentCustomer?.address || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Active</span>
                <span className="mtext">{currentCustomer?.isActive ?'Yes':'No'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Contact Person</span>
                <span className="mtext">{currentCustomer?.person || 'None'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentCustomer?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentCustomer?.createdAt)}</span>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Created By</span>
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

export default CustomersInfoModal