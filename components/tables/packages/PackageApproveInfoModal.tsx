import PrimaryButton from '@/components/shared/buttons/PrimaryButton';
import SecondaryButton from '@/components/shared/buttons/SecondaryButton';
import GenericLabel from '@/components/shared/inputs/GenericLabel';
import TextAreaWithLabel from '@/components/shared/inputs/TextAreaWithLabel';
import ModalContainer from '@/components/shared/outputs/ModalContainer';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
// import { updateProduction } from '@/lib/actions/production.action';

import { IUser } from '@/lib/models/user.model';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import React, { Dispatch, SetStateAction,  useState } from 'react'
import { FaChevronUp } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import '@/styles/customscroll.css'
import DialogueAlet from '@/components/misc/DialogueAlet';
import { IGood } from '@/lib/models/good.model';
import { IPackage } from '@/lib/models/package.model';
// import { IBatch } from '@/lib/models/batch.model';
import { updatePackApproval } from '@/lib/actions/packapproval.action';
import { updatePackageV2 } from '@/lib/actions/package.action';
import { IPackApproval } from '@/lib/models/packapproval.model';
// import { IBatch } from '@/lib/models/batch.model';

type ApprovalsApprovalInfoModalProps = {
    openNew:boolean;
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentApproval: IPackApproval | null;
    setCurrentApproval:Dispatch<SetStateAction<IPackApproval | null>>;
    refetch:(options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IPackApproval[], Error>>
}


const ApprovalsApprovalInfoModal = ({openNew, refetch, setOpenNew, currentApproval, setCurrentApproval}:ApprovalsApprovalInfoModalProps) => {
    const [loading, setLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [notes, setNotes] = useState<string>('');
    const {user} = useAuth();

    const [opeApprove, setOpeApprove] = useState(false);
    const [opeReject, setOpeReject] = useState(false);

    const pack = currentApproval?.package as IPackage;
    const good = pack?.good as IGood;
    const creator = currentApproval?.createdBy as IUser;
    const approver = currentApproval?.approver as IUser;
    // const batch = pack?.batch as IBatch;

    // console.log('Batch: ', batch)

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentApproval(null);
    }

    const handleApprove = async()=>{
        setLoading(true);
        
        try {
            const res = await updatePackageV2({...pack, approvalStatus:'Approved', approvedBy:user?._id, comment:notes});
            if(!res.error){
                const appRes = await updatePackApproval({...currentApproval, status:'Approved', approver:user?._id, notes});
                if(!appRes.error){
                    enqueueSnackbar('Package Approved', {variant:'success'});
                    refetch();
                    handleClose();
                    setOpeApprove(false);
                }
          }
          
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while approving packaging', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleReject = async()=>{
        setRejectLoading(true);
        
        try {
            const res = await updatePackageV2({...pack, approvalStatus:'Rejected', approvedBy:user?._id, comment:notes});
            if(!res.error){
                const appRes = await updatePackApproval({...currentApproval, status:'Rejected', approver:user?._id, notes});
                if(!appRes.error){
                    enqueueSnackbar('Package rejected successfully', {variant:'success'});
                    refetch();
                    handleClose();
                    setOpeReject(false);
                }
          }
          
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while rejecting package', {variant:'error'});
        }finally{
          setRejectLoading(false);
        }
    }

    const approveContent = `Are you sure you want to approve this package? This will create ${pack?.accepted} ${pack?.accepted > 1 ? 'quanities':'quantity'} of ${good?.name} (${pack?.weight?.toLowerCase() || 'units'}) in your warehouse.`;
    const rejectContent = `Are you sure you want to reject this package? This will send the package for further work.`;

  return (
    <ModalContainer  open={openNew } handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] max-h-[95%]">
            <DialogueAlet open={opeApprove} handleClose={()=>setOpeApprove(false)} agreeClick={handleApprove} title="Approve Package" content={approveContent} />
            <DialogueAlet open={opeReject} handleClose={()=>setOpeReject(false)} agreeClick={handleReject} title="Reject Package" content={rejectContent} />
            <div    className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Approve Package Release</span>
                    <span className="greyText" >Release {pack?.accepted} {pack?.weight?.toLowerCase() || 'units'} of {good?.name}</span>
                </div>
        
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-row items-center gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Package:</span>
                            <Link className="" href={`/dashboard/distribution/packaging/${pack?._id}`} >
                            <span className="text-blue-600 underline " >{pack?.name}</span>
                            </Link>
                        </div>
                        <div className="flex flex-row items-center gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Submitted By:</span>
                            <Link className="" href={`/dashboard/users?Id=${creator?._id}`} >
                            <span className="text-blue-600 underline " >{creator?.name}</span>
                            </Link>
                        </div>
                        <div className="flex flex-row items-start gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Submitted On:</span>
                            <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(currentApproval?.createdAt)}</span>
                        </div>
                        <div className="flex flex-row items-start gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Production Note:</span>
                            <span className="text-gray-600 flex-1 md:flex-5" >{pack?.description || 'None'}</span>
                        </div>

                        {
                            currentApproval?.status !=='Pending' &&
                            <>
                            <div className="flex flex-row items-center gap-4">
                                <span className="truncate w-1/2 md:w-1/5" >Action Taken By:</span>
                                    
                                    <Link className="" href={`/dashboard/users?Id=${approver?._id}`} >
                                        <span className="text-blue-600 underline " >{approver?.name}</span>
                                    </Link>
                            </div>
                            <div className="flex flex-row items-start gap-4">
                                <span className="truncate w-1/2 md:w-1/5" >Action Taken On:</span>
                                <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(currentApproval?.updatedAt)}</span>
                            </div>
                            </>
                        }
                        <GenericLabel 
                            input={<TextAreaWithLabel readOnly={currentApproval?.status !=='Pending'} defaultValue={currentApproval?.notes} name="notes" onChange={(e)=>setNotes(e.target.value)} placeholder="enter review note" label="Review Note" className="w-full" />}
                        />
                    </div>
                    {
                        currentApproval?.status === 'Pending' ?
                        <div className="flex flex-col md:flex-row w-full gap-6 items-center">
                            <PrimaryButton onClick={()=>setOpeApprove(true)} loading={loading} type="button" text={loading?"loading" : "Approve"} className="w-full mt-4" />
                            <SecondaryButton onClick={()=>setOpeReject(true)} loading={rejectLoading} type="button" text={rejectLoading?"loading" : "Reject"} className="w-full mt-4" />
                        </div>
                        :
                        <span className='mtext' >You have already attended to this request</span>
                    }

                </div>
        
                <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <IoIosClose className="text-red-700" />
                </div>
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </div>
        </div>
    </ModalContainer>
  )
}

export default ApprovalsApprovalInfoModal