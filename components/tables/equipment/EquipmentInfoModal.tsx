import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import {  isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { IEType } from '@/lib/models/etype.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'
import { IUser } from '@/lib/models/user.model';
import { IEquipment } from '@/lib/models/equipment.model';
import { IStorage } from '@/lib/models/storage.model';
import { IOriginalPrice } from '@/types/Types';
import { IOtherCurrency } from '@/lib/models/othercurrency.model';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';

type EquipmentInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentEquipment: IEquipment | null;
    setCurrentEquipment:Dispatch<SetStateAction<IEquipment | null>>;
}

const EquipmentInfoModal = ({infoMode, setInfoMode, currentEquipment, setCurrentEquipment}:EquipmentInfoModalProps) => {
    const organization = currentEquipment?.org as IOrganization;
    
    const creator = currentEquipment?.createdBy as IUser;
    const type = currentEquipment?.type as IEType;
    const location = currentEquipment?.location as IStorage;
    const orignial = currentEquipment?.original as IOriginalPrice;
    const otherCurrency = orignial?.currency as IOtherCurrency;

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {currency} = useCurrencyConfig();

    

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentEquipment(null);
    }

    if(!currentEquipment) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col w-full gap-4 mt-8' >

            

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentEquipment?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Type</span>
                <Linker tableId='92'  link={`/dashboard/equipment/types?Id=${type?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={type?.name || 'None'} />
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Brand</span>
                <span className="mtext">{currentEquipment?.brand}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Model</span>
                <span className="mtext">{currentEquipment?.model}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Asset Tag</span>
                <span className="mtext">{currentEquipment?.tag || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Serial Number</span>
                <span className="mtext">{currentEquipment?.serialNumber || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Status</span>
                <span className="mtext">{currentEquipment?.status}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Price</span>
                <span className="mtext">{`${otherCurrency?.symbol} ${currentEquipment?.price}` }</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">{`Price (${currency?.symbol || 'Primary currency'})`}</span>
                <span className="mtext">{`${currency?.symbol} ${currentEquipment?.price}` }</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Note</span>
                <span className="mtext">{currentEquipment?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Storage</span>
                {
                    location?  
                    <Linker tableId='77' link={`/dashboard/storage?Id=${location?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={location?.name || 'None'} />
                    :
                    <span className="mtext">Not set</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Purchase Date</span>
                <span className="mtext">{formatDate(currentEquipment?.purchaseDate)}</span>
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
                {
                    creator?
                    <Linker tableId='38'  link={`/dashboard/users?Id=${creator?._id}`}  linkStyle="mtext link" spanStyle='mtext' placeholder={creator?.name || 'None'} />:
                    <span className="mtext">{currentEquipment?.creator || 'Unknown'}</span>
                }
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentEquipment?.createdAt)}</span>
            </div>
        </div>
        
    </InfoModalContainer>
  )
}

export default EquipmentInfoModal