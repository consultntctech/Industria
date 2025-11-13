import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { ICategory } from '@/lib/models/category.model';
import { IOrganization } from '@/lib/models/org.model';
import { IProduct } from '@/lib/models/product.model';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'

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
                <Link  href={`/dashboard/products/categories?${category?._id}`} className="mtext link">{category?.name}</Link>
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
                            <Link key={index} href={`/dashboard/suppliers?Id=${supplier?._id}`} className="link mtext">
                                {supplier?.name}
                            </Link>
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