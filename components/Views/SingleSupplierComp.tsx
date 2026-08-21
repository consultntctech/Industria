'use client'
import { ISupplier } from "@/lib/models/supplier.model";
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchSupplierItems } from "@/hooks/fetch/useFetchSuppliers";
import SupplierRMTable from "../shared/outputs/SupplierDetails/SupplierRM/SupplierRMTable";
import SupplierPMTable from "../shared/outputs/SupplierDetails/ssupplierPackMaterials/SupplierPMTable";


type SingleSupplierCompProps = {
    supplier:ISupplier | null
}

const SingleSupplierComp = ({supplier}:SingleSupplierCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {rawMaterials, packItems, isPending} = useFetchSupplierItems(supplier?._id || '');
    // console.log(supplierItems);
    // if(!supplierItems) return null;
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Raw Materials" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Packaging Materials" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          // ThirdTabText="Returns" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
         {
          activeTab === 'first' &&
          <SupplierRMTable   isPending={isPending} materials={rawMaterials} />
        }
        {
          activeTab === 'second' &&
          <SupplierPMTable materials={packItems} isPending={isPending} />
        }
        {/*
         {
          activeTab === 'third' &&
          <SupplierReturnsTable isPending={isPending} returns={returns} />
        }
        
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       */}
      </div>
  )
}

export default SingleSupplierComp