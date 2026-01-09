'use client'
import { Tooltip } from "@mui/material"
// import ProductionComp from "../Views/ProductionComp"
import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import { useSettings } from "@/config/useSettings"
import { useRouter } from "next/navigation"
import ProductionTable from "../tables/productions/ProductionTable"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"
import { useAuth } from "@/hooks/useAuth"
import { canUser } from "@/Data/roles/permissions"

const Production = () => {
    const {primaryColour} = useSettings();
    const router = useRouter();
    const {user} = useAuth();
    const isCreator = canUser(user, '8', 'CREATE');

    const handleClick = () => {
        router.push('/dashboard/processing/production/new');
    }
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Productions" isLink={false}/>
            {
                isCreator &&
                <Tooltip onClick={handleClick} title="Start new production" placement="top">
                    <IoMdAddCircle style={{color:primaryColour}} size={30} className={`cursor-pointer`} />
                </Tooltip>
            }
        </div>
        {/* <ProductionComp/> */}
        <PermissionGuard tableId={['8']} >
            <ProductionTable/>
        </PermissionGuard>
    </div>
  )
}

export default Production