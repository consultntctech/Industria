'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchStorageItems } from "@/hooks/fetch/useFetchStorages";
import { IStorage } from "@/lib/models/storage.model";

type SingleStorageCompProps = {
    storage:IStorage | null
}

const SingleStorageComp = ({storage}:SingleStorageCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {storageItems} = useFetchStorageItems(storage?._id || '');
    console.log(storageItems);
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Raw Materials" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Packages" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Packaging Materials" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
        {/* {
          activeTab === 'first' &&
          <PackInputDetails pack={currentPackage} setActiveTab={setActiveTab} />
        }
        {
          activeTab === 'second' &&
          <PackOutputDetails pack={currentPackage} />
        }
        {
          activeTab === 'third' &&
          <PackProdItemsTable setOpenItem={setOpenItem}   pack={currentPackage} />
        }
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       
        <PackageContentModal openNew={openItem} setOpenNew={setOpenItem}  pack={currentPackage} /> */}
      </div>
  )
}

export default SingleStorageComp