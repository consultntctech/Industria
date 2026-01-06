import InfoModalContainer from '@/components/shared/outputs/InfoModalContainer'
import { formatDate } from '@/functions/dates';
import { IOrganization } from '@/lib/models/org.model';
import Image from 'next/image';
import Link from 'next/link';
import  { Dispatch, SetStateAction } from 'react'

type OrganizationInfoModalProps = {
    infoMode:boolean,
    setInfoMode:Dispatch<SetStateAction<boolean>>;
    currentOrganization: IOrganization | null;
    setCurrentOrganization:Dispatch<SetStateAction<IOrganization | null>>;
}

const OrganizationInfoModal = ({infoMode, setInfoMode, currentOrganization, setCurrentOrganization}:OrganizationInfoModalProps) => {
    // const organization = currentOrganization?.org as IOrganization;
    const handleClose = ()=>{
        setInfoMode(false);
        setCurrentOrganization(null);
    }

    if(!currentOrganization) return null;
  return (
    <InfoModalContainer handleClose={handleClose} infoMode={infoMode}>
        <div className='flex flex-col gap-4 w-full' >

            <div className="flex-center w-full">
                <div className="flex-center w-fit bg-slate-300 rounded-full p-2">
                    <div className="h-20 w-20 relative rounded-full">
                        <Image fill className='rounded-full' alt='user' src={currentOrganization?.logo || "/images/bird-colorful-gradient-design-vector_343694-2506.jpg"} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <span className="mlabel">Name</span>
                <span className="mtext">{currentOrganization?.name}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Email</span>
                <Link target='_blank' href={`mailto:${currentOrganization?.email}`} className="mtext link">{currentOrganization?.email}</Link>
            </div>
            {
                currentOrganization?.website &&
                <div className="flex flex-col">
                    <span className="mlabel">Website</span>
                    <Link target='_blank' href={`${currentOrganization?.email}`} className="mtext link">{currentOrganization?.website}</Link>
                </div>
            }
            <div className="flex flex-col">
                <span className="mlabel">Phone</span>
                <span className="mtext">{currentOrganization?.phone || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Address</span>
                <span className="mtext">{currentOrganization?.address || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">App Name</span>
                <span className="mtext">{currentOrganization?.appName || 'Not set'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Description</span>
                <span className="mtext">{currentOrganization?.description || 'None'}</span>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Colours</span>
                <div className="flex flex-row items-center gap-3">
                    <div style={{backgroundColor:currentOrganization?.pcolor}} className="w-4 h-4 border rounded shadow" />
                    <div style={{backgroundColor:currentOrganization?.scolor}} className="w-4 h-4 border rounded shadow" />
                    <div style={{backgroundColor:currentOrganization?.tcolor}} className="w-4 h-4 border rounded shadow" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="mlabel">Created</span>
                <span className="mtext">{formatDate(currentOrganization?.createdAt)}</span>
            </div>
        </div>
    </InfoModalContainer>
  )
}

export default OrganizationInfoModal