'use client'
import { IoMdAddCircle } from "react-icons/io"
import Title from "../misc/Title"
import OrgComp from "../Views/OrgComp"
import { useSettings } from "@/config/useSettings"
import { useState } from "react"
import { IOrganization } from "@/lib/models/org.model"
import OrganizationTable from "../tables/organizations/OrganizationTable"
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider"

const Organizations = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentOrganization, setCurrentOrganization] = useState<IOrganization | null>(null);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Organizations" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <PermissionGuard tableId={['100']} >
          <OrgComp currentOrganization={currentOrganization} setCurrentOrganization={setCurrentOrganization} openNew={openNew} setOpenNew={setOpenNew}/>
          <OrganizationTable currentOrganization={currentOrganization} setCurrentOrganization={setCurrentOrganization} setOpenNew={setOpenNew} />
        </PermissionGuard>
    </div>
  )
}

export default Organizations