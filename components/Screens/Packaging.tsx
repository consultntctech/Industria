'use client'


import PackageTable from "../tables/packages/PackagesTable";
import Title from "../misc/Title";
import { Tooltip } from "@mui/material";
import { IoMdAddCircle } from "react-icons/io";
import { useSettings } from "@/config/useSettings";
import Link from "next/link";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const Packaging = () => {
  const {primaryColour} = useSettings()
  const {user} = useAuth();
  const isCreator = canUser(user, '99', 'CREATE');
    
  return (
     <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Packaging" isLink={false}/>
            {
              isCreator &&
              <Link  href={`/dashboard/distribution/packaging/new`} >
                <Tooltip title="Start packaging" placement="top">
                    <IoMdAddCircle style={{color:primaryColour}} size={30} className={`cursor-pointer`} />
                </Tooltip>
              </Link>
            }
        </div>
        {/* <ProductionComp/> */}
        <PermissionGuard tableId={['99']} >
          <PackageTable/>
        </PermissionGuard>
    </div>
  )
}

export default Packaging