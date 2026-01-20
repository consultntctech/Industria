import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { IProdItem } from '@/lib/models/proditem.model';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type ProdItemInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentProdItem: IProdItem | null;
    setCurrentProdItem:Dispatch<SetStateAction<IProdItem | null>>;
}

const ProdItemInfoModal = ({infoMode, setInfoMode, currentProdItem, setCurrentProdItem}:ProdItemInfoModalProps) => {
    const organization = currentProdItem?.org as IOrganization;
    const creator = currentProdItem?.createdBy as IUser;
    const suppliers = currentProdItem?.suppliers as ISupplier[];
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {currency} = useCurrencyConfig();

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentProdItem(null);
    }

    if(!currentProdItem) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Serial Name</span>
                <span className="mtext">{currentProdItem?.materialName}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentProdItem?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Category</span>
                <span className="mtext">{currentProdItem?.category}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Subcategory</span>
                <span className="mtext">{currentProdItem?.subcategory}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Unit of measure</span>
                <span className="mtext">{currentProdItem?.uom}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Reorder threshold</span>
                <span className="mtext">{currentProdItem?.threshold}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quality status</span>
                <span className="mtext">{currentProdItem?.qStatus}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity received</span>
                <span className="mtext">{currentProdItem?.quantity}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity in stock</span>
                <span className="mtext">{currentProdItem?.stock < 0 ? 0 : currentProdItem?.stock}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Unit price</span>
                <span className="mtext">{currency?.symbol || ''}${currentProdItem?.unitPrice}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Total price</span>
                <span className="mtext">{currency?.symbol || ''}${currentProdItem?.price}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Suppliers</span>
                <div className="flex flex-col gap-0.5">
                    {
                        suppliers?.map((supplier, index) => (
                            <Linker key={index} tableId='41' link={`/dashboard/suppliers?Id=${supplier?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={supplier?.name} />
                        ))
                    }
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentProdItem?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentProdItem?.createdAt)}</span>
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

export default ProdItemInfoModal