'use client'
import React, { useState } from 'react'
import StorageComp from '../Views/StorageComp'
import TopContent from '../misc/TopContent'

const Storage = () => {
    const [openNew, setOpenNew] = useState(false);
  return (
    <TopContent isLink={false} title="Storage Locations" openNew={openNew} setOpenNew={setOpenNew}>
        <StorageComp openNew={openNew} setOpenNew={setOpenNew}/>
    </TopContent>
  )
}

export default Storage