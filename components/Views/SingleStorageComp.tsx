'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchStorageItems } from "@/hooks/fetch/useFetchStorages";
import { IStorage } from "@/lib/models/storage.model";
import StorageRMTable from "../shared/outputs/storageDetails/storageRM/StorageRMTable";
import StoragePackagesTable from "../shared/outputs/storageDetails/storagePackages/StoragePackagesTable";
import StoragePMTable from "../shared/outputs/storageDetails/storagePackMaterials/StoragePMTable";

type SingleStorageCompProps = {
    storage:IStorage | null
}

const SingleStorageComp = ({storage}:SingleStorageCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {storageItems, isPending} = useFetchStorageItems(storage?._id || '');
    // console.log(storageItems);
    if(!storageItems) return null;
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Raw Materials" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Packaging" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Packaging Materials" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
        {
          activeTab === 'first' &&
          <StorageRMTable isPending={isPending} materials={storageItems?.rawMaterials ?? []} />
        }
         {
          activeTab === 'second' &&
          <StoragePackagesTable packs={storageItems?.packages ?? []} isPending={isPending} />
        }
        
        {
          activeTab === 'third' &&
          <StoragePMTable isPending={isPending} materials={storageItems?.packItems ?? []} />
        }
        {/*
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       */}
      </div>
  )
}

export default SingleStorageComp