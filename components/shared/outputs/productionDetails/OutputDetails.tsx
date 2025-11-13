import { IProduction } from "@/lib/models/production.model";
import PrimaryButton from "../../buttons/PrimaryButton";
import { useState } from "react";
import OutputDetailsModals from "./OutputDetailsModals";
import { FaPenToSquare } from "react-icons/fa6";
import { useSettings } from "@/config/useSettings";
import { Tooltip } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { updateProduction } from "@/lib/actions/production.action";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IProduct } from "@/lib/models/product.model";
import { useAuth } from "@/hooks/useAuth";
import { IProdApproval } from "@/lib/models/prodapproval.model";
import { createProdApproval } from "@/lib/actions/prodapproval.action";

type OutputDetailsProps = {
    production: IProduction | null;
}

const OutputDetails = ({production}:OutputDetailsProps) => {
    const [openNew, setOpenNew] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const {primaryColour} = useSettings();
    const {currency} = useCurrencyConfig();
    const productToProduce = production?.productToProduce as IProduct;
    const yieldRate =  ((production?.outputQuantity! / production?.xquantity!) * 100).toFixed(2);
    const {user} = useAuth();
    const extraCost = production?.extraCost || 0;
    const prodCost = production?.productionCost || 0;
    const totalCost = extraCost + prodCost;

    const title = 'Submit Production for Approval';
    const content = 'Are you sure you want to submit this production? You cannot edit the production after submitting for approval.';

    const handleAgreeClick = async() => {
        try {
            const updateData:Partial<IProduction> = {
                ...production,
                status:'Pending Approval',
            };
            const res = await updateProduction(updateData);
            if(!res.error){
                setOpenDialog(false);
                const approvalData:Partial<IProdApproval> = {
                    production: production?._id,
                    name: production?.name,
                    status: 'Pending',
                    createdBy: user?._id,
                    org: user?.org,
                };
                const approvalRes = await createProdApproval(approvalData);
                if (!approvalRes.error) {
                    enqueueSnackbar(approvalRes.message, {variant:approvalRes.error?'error':'success'});
                    window.location.reload();
                }
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while submitting approval request', {variant:'error'});
        }
    }


  return (
     <div className="formBox p-3 flex-col gap-4 relative">
        {
            production?.status === 'New' &&
            <>
            <div className="flex flex-col gap-1">
                <span className="title" >Production is still in progress</span>
                <span className="greyText" >You'll see the output of the production here after it's completed</span>
            </div>
            <PrimaryButton onClick={()=>setOpenNew(true)} className="w-fit px-3" type="button" text="Complete Production" />
            </>
        }
        <OutputDetailsModals production={production} openNew={openNew} setOpenNew={setOpenNew} />
        <DialogueAlet open={openDialog} handleClose={()=>setOpenDialog(false)} agreeClick={handleAgreeClick} title={title} content={content} />
            {
                (production?.status !== 'New' && production?.status !== 'Pending Approval') &&
                <Tooltip title="Edit Output Details">
                    <FaPenToSquare onClick={()=>setOpenNew(true)} style={{color:primaryColour}} className='cursor-pointer absolute top-1 right-1' />
                </Tooltip>
            }
            {
                production?.status !== 'New' &&
                <>
                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Output Quantity:</span>
                        <span className="text-gray-600 truncate " >{production?.outputQuantity} {productToProduce?.uom || ''}</span>
                    </div>
                    
                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Rejected Quantity:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{production?.rejQuantity || 0}</span>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Loss Quantity:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{production?.rejQuantity || 0}</span>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Yield Rate:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{`${yieldRate || 0}%`}</span>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Extra Cost:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{`${currency?.symbol || ''}${production?.extraCost || 0}`}</span>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Total Cost:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{`${currency?.symbol || ''}${totalCost || 0}`}</span>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Started At:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(production?.createdAt)}</span>
                    </div>

                    {
                        production?.status === 'Approved' &&
                        <div className="flex flex-row items-center gap-4">
                            <span className="truncate w-1/2 md:w-1/5" >Ended At:</span>
                            <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(production?.updatedAt)}</span>
                        </div>
                    }

                    <div className="flex flex-row items-start gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Production Note:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{production?.notes || 'None'}</span>
                    </div>

                    <div className="flex flex-row items-start gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Review Note:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{production?.reviewNotes || 'None'}</span>
                    </div>
                    {
                        production?.status !== 'Pending Approval' &&
                        <div className="flex w-full justify-end flex-row">
                            <PrimaryButton onClick={()=>setOpenDialog(true)} className="w-fit px-3" type="button" text="Submit for Approval" />
                        </div>
                    }
                </>
            }
    
            
    
    </div>
  )
}

export default OutputDetails