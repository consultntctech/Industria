'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs"
import { IProduction } from "@/lib/models/production.model";
import InputDetails from "../shared/outputs/productionDetails/InputDetails";
import OutputDetails from "../shared/outputs/productionDetails/OutputDetails";
// import ProdItemsTable from "../shared/outputs/productionDetails/ProdItemsTable";
import ProdProductsComp from "../shared/outputs/productionDetails/ProdProductsComp";
import ProdWorkersComp from "../shared/outputs/productionDetails/ProdWorkersComp";


type SingleProductionCompProps = {
  production: IProduction | null;
}

const SingleProductionComp = ({production}:SingleProductionCompProps) => {
  const [activeTab, setActiveTab] = useState<string>('first');
  
  // const [openItem, setOpenItem] = useState(false);

  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
      <CustomTabs 
        FirstTabText="Details" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
        SecondTabText="Workers" onClickSecondTab={()=>setActiveTab('second')}
        // ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        ThirdTabText="Products" onClickThirdTab={()=>setActiveTab('third')}
        FourthTabText="Output" onClickFourthTab={()=>setActiveTab('fourth')}
        showSecondTab={true}  showThirdTab={true} showFourthTab={true}
      />

      {
        activeTab === 'first' &&
        <InputDetails production={production} setActiveTab={setActiveTab} />
      }
      {
        activeTab === 'second' &&
        <ProdWorkersComp production={production} />
      }
      
      {
        activeTab === 'third' &&
        <ProdProductsComp production={production} />
      }
      {
        activeTab === 'fourth' &&
        <OutputDetails production={production} />
      }
      
    </div>
  )
}

export default SingleProductionComp