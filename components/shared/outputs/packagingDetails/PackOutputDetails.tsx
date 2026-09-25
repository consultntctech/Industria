import { IPackage } from "@/lib/models/package.model";
// import { useState } from "react";
// import { FaPenToSquare } from "react-icons/fa6";
// import { useSettings } from "@/config/useSettings";
// import { Tooltip } from "@mui/material";
import { formatDate } from "@/functions/dates";
// import PackOutputDetailsModals from "./PackOutputDetailsModals";
import { IUser } from "@/lib/models/user.model";
import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import SecondaryButton from "../../buttons/SecondaryButton";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { updatePackageV2 } from "@/lib/actions/package.action";
import { IPackApproval } from "@/lib/models/packapproval.model";
import { useAuth } from "@/hooks/useAuth";
import { createPackApproval } from "@/lib/actions/packapproval.action";
import DialogueAlet from "@/components/misc/DialogueAlet";

type PackOutputDetailsProps = {
    pack: IPackage | null;
}

const PackOutputDetails = ({pack}:PackOutputDetailsProps) => {
    // const [openNew, setOpenNew] = useState(false);
    // const {primaryColour} = useSettings();
    const [showApprove, setShowApprove] = useState(false);
    const {user} = useAuth();
    
    const reviewer = pack?.approvedBy as IUser;

    const handleClose = ()=>{
        setShowApprove(false);
    }

    const handleSubmit = async()=>{
        setShowApprove(false);
        try {
            if(!pack) return;
            const appData:Partial<IPackApproval> = {
                package: pack?._id,
                createdBy: user?._id,
                status: 'Pending',
                creator: user?.name,
                name: pack?.name,
                org: user?.org,
            }
            await Promise.all([
                updatePackageV2({...pack, approvalStatus:'Pending'}),
                createPackApproval(appData)
            ]);
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while submitting packaging', {variant:'error'});
        }
    }


    const content = `Are you sure you want to resubmit this package for approval?`;

  return (
     <div className="formBox p-3 flex-col gap-4 relative">
        
        {/* <PackOutputDetailsModals pack={pack} openNew={openNew} setOpenNew={setOpenNew} /> */}
            {/* {
                (pack?.approvalStatus  !== 'Approved') &&
                <Tooltip title="Edit Secondary Details">
                    <FaPenToSquare onClick={()=>setOpenNew(true)} style={{color:primaryColour}} className='cursor-pointer absolute top-1 right-1' />
                </Tooltip>
            } */}
            <DialogueAlet open={showApprove} handleClose={handleClose} agreeClick={handleSubmit} title="Package Submission" content={content} />
            <>
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Quantity Sold:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{pack?.sold}</span>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Approval Status:</span>
                    <span className="text-gray-600 truncate " >{pack?.approvalStatus}</span>
                </div>

                

                <div className="flex flex-row items-center gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Started At:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(pack?.createdAt)}</span>
                </div>

                {
                    pack?.approvalStatus === 'Approved' &&
                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Ended At:</span>
                        <span className="text-gray-600 flex-1 md:flex-5" >{formatDate(pack?.updatedAt)}</span>
                    </div>
                }

                <div className="flex flex-row items-start gap-4">
                    <span className="truncate w-1/2 md:w-1/5" >Review Note:</span>
                    <span className="text-gray-600 flex-1 md:flex-5" >{pack?.comment || 'None'}</span>
                </div>
                {
                    pack?.approvalStatus !== 'Pending' &&
                    <div className="flex flex-row items-center gap-4">
                        <span className="truncate w-1/2 md:w-1/5" >Reviewer:</span>
                        <Linker tableId="38" placeholder={reviewer?.name} spanStyle="text-gray-600 flex-1 md:flex-5" linkStyle="link" link={`/dashboard/users?Id=${reviewer?._id}`} />
                    </div>
                }
                {
                    pack?.approvalStatus === 'Rejected' &&
                    <SecondaryButton onClick={()=>setShowApprove(true)} text="Resubmit for approval" type="button" className="md:w-fit md:px-6 md:self-end" />
                }

                
            </>
    
            
    
    </div>
  )
}

export default PackOutputDetails