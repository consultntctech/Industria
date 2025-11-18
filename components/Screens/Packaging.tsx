'use client'

import { useState } from "react";
import PackagingComp from "../Views/PackagingComp";
import TopContent from "../misc/TopContent";
import PackageTable from "../tables/packages/PackagesTable";
import { IPackage } from "@/lib/models/package.model";

const Packaging = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<IPackage | null>(null);
  return (
    <TopContent isLink={false} title="Packaging" openNew={openNew} setOpenNew={setOpenNew}>
        <PackagingComp currentPackage={currentPackage} setCurrentPackage={setCurrentPackage} openNew={openNew} setOpenNew={setOpenNew} />
        <PackageTable setOpenNew={setOpenNew} currentPackage={currentPackage} setCurrentPackage={setCurrentPackage} />
    </TopContent>
  )
}

export default Packaging