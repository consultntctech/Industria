import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { useFetchRawMaterialsBySupplier } from '@/hooks/fetch/useRMaterials';
import { ISupplier } from '@/lib/models/supplier.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react'

type SuppliersInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentSupplier: ISupplier | null;
    setCurrentSupplier:Dispatch<SetStateAction<ISupplier | null>>;
}

const SuppliersInfoModal = ({infoMode, setInfoMode, currentSupplier, setCurrentSupplier}:SuppliersInfoModalProps) => {
    const creator = currentSupplier?.createdBy as IUser;
    const {materials, isPending} = useFetchRawMaterialsBySupplier(currentSupplier?._id as string);
    const quantity = materials?.reduce((acc, material) => acc + material?.qReceived, 0);
    const rejected = materials?.reduce((acc, material) => acc + material?.qRejected, 0);

    const accepted = quantity - rejected;
    const percentage = Math.round((accepted / quantity) * 100);

    // console.log('Creator:', creator);
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentSupplier(null);
    }

    if(!currentSupplier) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentSupplier?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quality Rate</span>
                <span className="mtext">{isPending ? 'Loading...' : `${percentage}%`}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentSupplier?.email}`}  className="mtext link">{currentSupplier?.email}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentSupplier?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentSupplier?.address || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Active</span>
                <span className="mtext">{currentSupplier?.isActive ?'Yes':'No'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Contact Person</span>
                <span className="mtext">{currentSupplier?.person || 'None'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentSupplier?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentSupplier?.createdAt)}</span>
            </div>
             <div className="flex flex-col">
                <span className="mlabel">Created By</span>
                <Link href={`/dashboard/users?Id=${creator?._id}`} className="mtext link">{creator?.name || 'None'}</Link>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default SuppliersInfoModal