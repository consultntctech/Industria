import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig';
import { IBatch } from '@/lib/models/batch.model';
import { IGood } from '@/lib/models/good.model';
import { IOrganization } from '@/lib/models/org.model';
import { IPackage } from '@/lib/models/package.model';
import { IProdItem } from '@/lib/models/proditem.model';
import { IStorage } from '@/lib/models/storage.model';
import { IUser } from '@/lib/models/user.model';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react'

type PackageInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentPackage: IPackage | null;
    setCurrentPackage:Dispatch<SetStateAction<IPackage | null>>;
}

const PackageInfoModal = ({infoMode, setInfoMode, currentPackage, setCurrentPackage}:PackageInfoModalProps) => {
    const organization = currentPackage?.org as IOrganization;
    const batch = currentPackage?.batch as IBatch;
    const creator = currentPackage?.createdBy as IUser;
    const proditems = currentPackage?.packagingMaterial as IProdItem[];
    const supervisor = currentPackage?.supervisor as IUser;
    const product = currentPackage?.good as IGood;
    const storage = currentPackage?.storage as IStorage;
    const approver = currentPackage?.approvedBy as IUser;

    const {currency} = useCurrencyConfig();

    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentPackage(null);
    }

    if(!currentPackage) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentPackage?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Type</span>
                <span className="mtext">{currentPackage?.packagingType}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Finished Good</span>
                <Link  href={`/dashboard/processing/goods?Id=${product?._id}`} className="mtext link">{product?.name}</Link>
            </div>
            
            <div className="flex flex-col">
                <span className="mlabel">Inherited Production Batch</span>
                <span className="mtext">{currentPackage?.useProdBatch ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Batch</span>
                <Link  href={`/dashboard/products/batches?Id=${batch?._id}`} className="mtext link">{batch?.code}</Link>
            </div>
            {
                proditems?.length > 0 &&
                <div className="flex flex-col">
                    <span className="mlabel">Packaging Materials</span>
                    <div className="flex flex-col gap-0.5">
                        {
                            proditems?.map((item, index) => (
                                <Link key={index} href={`/dashboard/distribution/packaging-materials?Id=${item?._id}`} className="link mtext">
                                    {item?.name}
                                </Link>
                            ))
                        }
                    </div>
                </div>
            }

            <div className="flex flex-col">
                <span className="mlabel">Quantity</span>
                <span className="mtext">{currentPackage?.quantity}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity Used</span>
                <span className="mtext">{currentPackage?.accepted}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quantity Rejected</span>
                <span className="mtext">{currentPackage?.rejected}</span>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Weight</span>
                <span className="mtext">{currentPackage?.weight}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Storage</span>
                <Link  href={`/dashboard/storage?Id=${storage?._id}`} className="mtext link">{storage?.name}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Quality Status</span>
                <span className="mtext">{currentPackage?.qStatus}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentPackage?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Cost</span>
                <span className="mtext">{`${currency?.symbol || ''}${currentPackage?.cost}`}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Approval Status</span>
                <span className="mtext">{currentPackage?.approvalStatus }</span>
            </div>
            {
                currentPackage?.approvalStatus !== 'Pending' &&
                <div className="flex flex-col">
                    <span className="mlabel">Approved By</span>
                    <Link href={`/dashboard/users?Id=${approver?._id}`} className="mtext link">{approver?.name || 'None'}</Link>
                </div>
            }
            {
                currentPackage?.approvalStatus !== 'Pending' && currentPackage?.comment &&
                <div className="flex flex-col">
                    <span className="mlabel">Comment</span>
                    <span className="mtext">{currentPackage?.comment}</span>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Started At</span>
                <span className="mtext">{formatDate(currentPackage?.createdAt)}</span>
            </div>
            {
                currentPackage?.approvalStatus !== 'Pending' &&
                <div className="flex flex-col">
                    <span className="mlabel">Ended At</span>
                    <span className="mtext">{formatDate(currentPackage?.updatedAt)}</span>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Organization</span>
                <Link href={`/dashboard/organizations?Id=${organization?._id}`} className="mtext link">{organization?.name || 'None'}</Link>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Started By</span>
                <Link href={`/dashboard/users?Id=${creator?._id}`} className="mtext link">{creator?.name || 'None'}</Link>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Supervised By</span>
                <Link href={`/dashboard/users?Id=${supervisor?._id}`} className="mtext link">{supervisor?.name || 'None'}</Link>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default PackageInfoModal