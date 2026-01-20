import { IPackage } from "@/lib/models/package.model";
// import { useState } from "react";
// import { FaPenToSquare } from "react-icons/fa6";
// import { useSettings } from "@/config/useSettings";
// import { Tooltip } from "@mui/material";
import { formatDate } from "@/functions/dates";
// import PackOutputDetailsModals from "./PackOutputDetailsModals";
import { IUser } from "@/lib/models/user.model";
import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";

type PackOutputDetailsProps = {
    pack: IPackage | null;
}

const PackOutputDetails = ({pack}:PackOutputDetailsProps) => {
    // const [openNew, setOpenNew] = useState(false);
    // const {primaryColour} = useSettings();
    
    const reviewer = pack?.approvedBy as IUser;


  return (
     <div className="formBox p-3 flex-col gap-4 relative">
        
        {/* <PackOutputDetailsModals pack={pack} openNew={openNew} setOpenNew={setOpenNew} /> */}
            {/* {
                (pack?.approvalStatus  !== 'Approved') &&
                <Tooltip title="Edit Secondary Details">
                    <FaPenToSquare onClick={()=>setOpenNew(true)} style={{color:primaryColour}} className='cursor-pointer absolute top-1 right-1' />
                </Tooltip>
            } */}
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
                
            </>
    
            
    
    </div>
  )
}

export default PackOutputDetails