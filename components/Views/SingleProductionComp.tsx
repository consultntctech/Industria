'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs"
import { IProduction } from "@/lib/models/production.model";
import InputDetails from "../shared/outputs/productionDetails/InputDetails";
import OutputDetails from "../shared/outputs/productionDetails/OutputDetails";
import ProdRMTable from "../shared/outputs/productionDetails/ProdRMTable";
import ProdItemsTable from "../shared/outputs/productionDetails/ProdItemsTable";
import ProductionContentModal from "../shared/outputs/productionDetails/ProductionContentModal";

type SingleProductionCompProps = {
  production: IProduction | null;
}

const SingleProductionComp = ({production}:SingleProductionCompProps) => {
  const [activeTab, setActiveTab] = useState<string>('first');
  const [openNew, setOpenNew] = useState(false);
  const [openItem, setOpenItem] = useState(false);

  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
      <CustomTabs 
        FirstTabText="Details" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
        SecondTabText="Raw Materials" onClickSecondTab={()=>setActiveTab('second')}
        ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        FourthTabText="Output" onClickFourthTab={()=>setActiveTab('fourth')}
        showSecondTab={true} showThirdTab={true} showFourthTab={true}
      />

      {
        activeTab === 'first' &&
        <InputDetails production={production} setActiveTab={setActiveTab} />
      }
      {
        activeTab === 'fourth' &&
        <OutputDetails production={production} />
      }
      {
        activeTab === 'second' &&
        <ProdRMTable setOpenNew={setOpenNew} setOpenItem={setOpenItem} production={production} />
      }
      {
        activeTab === 'third' &&
        <ProdItemsTable setOpenNew={setOpenNew} setOpenItem={setOpenItem} production={production} />
      }
      <ProductionContentModal openNew={openNew} setOpenNew={setOpenNew} setOpenItem={setOpenItem} openItem={openItem} production={production} />
    </div>
  )
}

export default SingleProductionComp