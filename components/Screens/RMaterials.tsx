'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import RMComp from "../Views/RMComp";

const RMaterials = () => {
    const [openNew, setOpenNew] = useState(false);
  return (
    <TopContent isLink={false} title="Raw Materials" openNew={openNew} setOpenNew={setOpenNew}>
        <RMComp openNew={openNew} setOpenNew={setOpenNew}/>
    </TopContent>
  )
}

export default RMaterials