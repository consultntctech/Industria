'use client'

import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { IPackage } from "@/lib/models/package.model";
import PackInputDetails from "../shared/outputs/packagingDetails/PackInputDetails";
import PackOutputDetails from "../shared/outputs/packagingDetails/PackOutputDetails";
import PackProdItemsTable from "../shared/outputs/packagingDetails/PackProdItemsTable";
import PackageContentModal from "../shared/outputs/packagingDetails/PackageContentModal";
import LineItemsTable from "../shared/outputs/packagingDetails/lineitems/LineItemsTable";

type SinglePackageCompProps = {
    currentPackage: IPackage | null
}

const SinglePackageComp = ({currentPackage}:SinglePackageCompProps) => {
    const [activeTab, setActiveTab] = useState<string>('first');
    // const [openNew, setOpenNew] = useState(false);
    const [openItem, setOpenItem] = useState(false);
  
    return (
      <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Details" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Secondary Details" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Packaging Materials" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
          FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
        {
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
       
        <PackageContentModal openNew={openItem} setOpenNew={setOpenItem}  pack={currentPackage} />
      </div>
    )
}

export default SinglePackageComp