import PrimaryButton from '@/components/shared/buttons/PrimaryButton';
import SecondaryButton from '@/components/shared/buttons/SecondaryButton';
import GenericLabel from '@/components/shared/inputs/GenericLabel';
import TextAreaWithLabel from '@/components/shared/inputs/TextAreaWithLabel';
import ModalContainer from '@/components/shared/outputs/ModalContainer';
import { formatDate } from '@/functions/dates';
import { useAuth } from '@/hooks/useAuth';
import { updateProdApproval } from '@/lib/actions/prodapproval.action';
import { updateProduction } from '@/lib/actions/production.action';
import { IProdApproval } from '@/lib/models/prodapproval.model';
import { IProduct } from '@/lib/models/product.model';
import { IProduction } from '@/lib/models/production.model';
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
import { createGood } from '@/lib/actions/good.action';
// import { IBatch } from '@/lib/models/batch.model';

type ProdApprovalInfoModalProps = {
    openNew:boolean;
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentProdApproval: IProdApproval | null;
    setCurrentProdApproval:Dispatch<SetStateAction<IProdApproval | null>>;
    refetch:(options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IProdApproval[], Error>>
}


const ProdApprovalInfoModal = ({openNew, refetch, setOpenNew, currentProdApproval, setCurrentProdApproval}:ProdApprovalInfoModalProps) => {
    const [loading, setLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [notes, setNotes] = useState<string>('');
    const {user} = useAuth();

    const [opeApprove, setOpeApprove] = useState(false);
    const [opeReject, setOpeReject] = useState(false);

    const production = currentProdApproval?.production as IProduction;
    const product = production?.productToProduce as IProduct;
    const creator = currentProdApproval?.createdBy as IUser;
    const approver = currentProdApproval?.approver as IUser;
    const batch = production?.batch

    // console.log('Batch: ', batch)

    const handleClose = ()=>{
        setOpenNew(false);
        setCurrentProdApproval(null);
    }

    
    const handleApprove = async()=>{
        setLoading(true);
        
        try {
            const res = await updateProduction({...production, status:'Approved', approvedBy:user?._id, reviewNotes:notes});
            if(!res.error){
                const appRes = await updateProdApproval({...currentProdApproval, status:'Approved', approver:user?._id, notes});
                if(!appRes.error){
                    const goodsData: Partial<IGood> = {
                        name: product?.name,
                        quantity: production?.outputQuantity,
                        quantityLeftToPackage: production?.outputQuantity,
                        production: production?._id,
                        org: user?.org,
                        createdBy: user?._id,
                        product: product?._id,
                        batch
                    }

                    const goodsRes = await createGood(goodsData);
                    if(!goodsRes.error){
                        enqueueSnackbar('Production Approved', {variant:'success'});
                        refetch();
                        handleClose();
                        setOpeApprove(false);
                    }
                }
          }
          
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while approving production', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

    const handleReject = async()=>{
        setRejectLoading(true);
        
        try {
            const res = await updateProduction({...production, status:'Rejected', approvedBy:user?._id, reviewNotes:notes});
            if(!res.error){
                const appRes = await updateProdApproval({...currentProdApproval, status:'Rejected', approver:user?._id, notes});
                if(!appRes.error){
                    enqueueSnackbar('Production rejected successfully', {variant:'success'});
                    refetch();
                    handleClose();
                    setOpeReject(false);
                }
          }
          
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while rejecting production', {variant:'error'});
        }finally{
          setRejectLoading(false);
        }
    }

    const approveContent = `Are you sure you want to approve this production? This will create ${production?.outputQuantity} ${product?.uom?.toLowerCase() || 'units'} of ${product?.name} as finished goods.`;
    const rejectContent = `Are you sure you want to reject this production? This will send the production back to the production team for further work.`;

  return (
    <ModalContainer  open={openNew } handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] max-h-[95%]">
            <DialogueAlet open={opeApprove} handleClose={()=>setOpeApprove(false)} agreeClick={handleApprove} title="Approve Production" content={approveContent} />
            <DialogueAlet open={opeReject} handleClose={()=>setOpeReject(false)} agreeClick={handleReject} title="Reject Production" content={rejectContent} />
            <div    className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Approve Production Release</span>
                    <span className="greyText" >Release {production?.outputQuantity} {product?.uom?.toLowerCase() || 'units'} of {product?.name}</span>
                </div>
        
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-row items-center gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Production:</span>
                            <Link className="" href={`/dashboard/processing/production/${production?._id}`} >
                            <span className="text-blue-600 underline " >{production?.name}</span>
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
                            <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(currentProdApproval?.createdAt)}</span>
                        </div>
                        <div className="flex flex-row items-start gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Production Note:</span>
                            <span className="text-gray-600 flex-1 md:flex-5" >{production?.notes || 'None'}</span>
                        </div>

                        {
                            currentProdApproval?.status !=='Pending' &&
                            <>
                            <div className="flex flex-row items-center gap-4">
                                <span className="truncate w-1/2 md:w-1/5" >Action Taken By:</span>
                                    
                                    <Link className="" href={`/dashboard/users?Id=${approver?._id}`} >
                                        <span className="text-blue-600 underline " >{approver?.name}</span>
                                    </Link>
                            </div>
                            <div className="flex flex-row items-start gap-4">
                                <span className="truncate w-1/2 md:w-1/5" >Action Taken On:</span>
                                <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(currentProdApproval?.updatedAt)}</span>
                            </div>
                            </>
                        }
                        <GenericLabel 
                            input={<TextAreaWithLabel readOnly={currentProdApproval?.status !=='Pending'} defaultValue={currentProdApproval?.notes} name="notes" onChange={(e)=>setNotes(e.target.value)} placeholder="enter review note" label="Review Note" className="w-full" />}
                        />
                    </div>
                    {
                        currentProdApproval?.status === 'Pending' ?
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

export default ProdApprovalInfoModal