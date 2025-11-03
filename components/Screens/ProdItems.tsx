'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import ProdItemComp from "../Views/ProdItemComp";

const ProdItems = () => {
    const [openNew, setOpenNew] = useState(false);
  return (
    <TopContent isLink={false} title="Production Materials" openNew={openNew} setOpenNew={setOpenNew}>
        <ProdItemComp openNew={openNew} setOpenNew={setOpenNew}/>
    </TopContent>
  )
}

export default ProdItems