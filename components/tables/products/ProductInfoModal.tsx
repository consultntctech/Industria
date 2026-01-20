import { Linker } from '@/components/PermisionHelpers/PermisionHelpers';
import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { isSystemAdmin } from '@/Data/roles/permissions';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { ICategory } from '@/lib/models/category.model';
import { IOrganization } from '@/lib/models/org.model';
import { IProduct } from '@/lib/models/product.model';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type ProductInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentProduct: IProduct | null;
    setCurrentProduct:Dispatch<SetStateAction<IProduct | null>>;
}

const ProductInfoModal = ({infoMode, setInfoMode, currentProduct, setCurrentProduct}:ProductInfoModalProps) => {
    const organization = currentProduct?.org as IOrganization;
    const category = currentProduct?.category as ICategory;
    const creator = currentProduct?.createdBy as IUser;
    const suppliers = currentProduct?.suppliers as ISupplier[];
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentProduct(null);
    }

    if(!currentProduct) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentProduct?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Type</span>
                <span className="mtext">{currentProduct?.type}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Category</span>
                <Linker placeholder={category?.name} tableId='32' link={`/dashboard/products/categories?Id=${category?._id}`} linkStyle="mtext link" spanStyle='mtext' />
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Unit of Measure</span>
                <span className="mtext">{currentProduct?.uom || 'None'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Suppliers</span>
                <div className="flex flex-col gap-0.5">
                    {
                        suppliers?.map((supplier, index) => (
                            <Linker tableId='41' key={index} link={`/dashboard/suppliers?Id=${supplier?._id}`} linkStyle="link mtext" spanStyle='mtext' placeholder={supplier?.name} />
                        ))
                    }
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentProduct?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentProduct?.createdAt)}</span>
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
                <Linker tableId='38' link={`/dashboard/users?Id=${creator?._id}`} linkStyle='mtext link' spanStyle='mtext' placeholder={creator?.name || 'None'} />
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default ProductInfoModal