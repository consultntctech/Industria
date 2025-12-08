'use client'
import Title from "../misc/Title"

import { useFetchOrgById } from "@/hooks/fetch/useFetchOrgs"
import SingleOrgComp from "../Views/SingleOrgComp"


const SingleOrganization = () => {
  const {org, isPending, refetch} = useFetchOrgById()

  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title={org?.name || ''} isLink={false}/>
            
        </div>
        <SingleOrgComp currentOrganization={org} isPending={isPending} refetch={refetch}/>
    </div>
  )
}

export default SingleOrganization