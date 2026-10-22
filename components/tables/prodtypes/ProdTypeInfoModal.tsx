import { Linker, ViewCreator } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { IOrganization } from '@/lib/models/org.model';
import { IProdType } from '@/lib/models/prodtype.model';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type ProdTypeInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentProdType: IProdType | null;
    setCurrentProdType:Dispatch<SetStateAction<IProdType | null>>;
}

const ProdTypeInfoModal = ({infoMode, setInfoMode, currentProdType, setCurrentProdType}:ProdTypeInfoModalProps) => {
    const organization = currentProdType?.org as IOrganization;
    const creator = currentProdType?.createdBy as IUser;
    const suppliers = currentProdType?.suppliers as ISupplier[];
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    // const rate = Number(original?.rate || 1);
    // console.log(rate, currentProdType?.unitPrice)
    // const ogUnit = Number(currentProdType?.unitPrice || 0) / rate;

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentProdType(null);
    }

    if(!currentProdType) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >
            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentProdType?.name}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Item code</span>
                <span className="mtext">{currentProdType?.code}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Category</span>
                <span className="mtext">{currentProdType?.category}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Subcategory</span>
                <span className="mtext">{currentProdType?.subcategory}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Unit of measure</span>
                <span className="mtext">{currentProdType?.uom}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Reorder level</span>
                <span className="mtext">{currentProdType?.threshold}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Resuable item</span>
                <span className="mtext">{currentProdType?.reusable ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity</span>
                <span className="mtext">{currentProdType?.stock}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity in stock</span>
                <span className="mtext">{currentProdType?.available}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity used</span>
                <span className="mtext">{currentProdType?.used}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Suppliers</span>
                <div className="flex flex-col gap-0.5">
                    {
                        suppliers?.map((supplier, index) => (
                            <Linker key={index} tableId='41' link={`/dashboard/suppliers/${supplier?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={supplier?.name} />
                        ))
                    }
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentProdType?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentProdType?.createdAt)}</span>
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
                <ViewCreator linkStyle='mtext link' creator={creator} creatorName={currentProdType?.creator} spanStyle='mtext' />
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default ProdTypeInfoModal