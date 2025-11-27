'use client'
import React, { useState } from 'react'
import TopContent from '../misc/TopContent'

import SalesComp from '../Views/SalesComp'
import { ISales } from '@/lib/models/sales.model'

const Sales = () => {
    const [openNew, setOpenNew] = useState(true);
    const [currentSales, setCurrentSales] = useState<ISales | null>(null);
  return (
    <TopContent isLink={false} title="Sales" openNew={openNew} setOpenNew={setOpenNew}>
        <SalesComp openNew={openNew} setOpenNew={setOpenNew} currentSales={currentSales} setCurrentSales={setCurrentSales} />
        {/* <StorageTable setOpenNew={setOpenNew} currentStorage={currentStorage} setCurrentStorage={setCurrentStorage} /> */}
    </TopContent>
  )
}

export default Sales