'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs"
import { IProduction } from "@/lib/models/production.model";
import InputDetails from "../shared/outputs/productionDetails/InputDetails";
import OutputDetails from "../shared/outputs/productionDetails/OutputDetails";
import ProdRMTable from "../shared/outputs/productionDetails/ProdRMTable";
// import ProdItemsTable from "../shared/outputs/productionDetails/ProdItemsTable";
import ProductionContentModal from "../shared/outputs/productionDetails/ProductionContentModal";
import ProductionLabourersTable from '../shared/outputs/productionDetails/ProductionLabourersTable';
import ProdEmployeesTable from "../shared/outputs/productionDetails/ProdEmployeesTable";


type SingleProductionCompProps = {
  production: IProduction | null;
}

const SingleProductionComp = ({production}:SingleProductionCompProps) => {
  const [activeTab, setActiveTab] = useState<string>('first');
  const [openNew, setOpenNew] = useState(false);
  // const [openItem, setOpenItem] = useState(false);

  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
      <CustomTabs 
        FirstTabText="Details" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
        SecondTabText="Employees" onClickSecondTab={()=>setActiveTab('second')}
        // ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        ThirdTabText="Labourers" onClickThirdTab={()=>setActiveTab('third')}
        FourthTabText="Raw Materials" onClickFourthTab={()=>setActiveTab('fourth')}
        showSecondTab={true}  showThirdTab={true} showFourthTab={true}
        showFifthTab={true}
        FifthTabText="Output" onClickFifthTab={()=>setActiveTab('fifth')}
      />

      {
        activeTab === 'first' &&
        <InputDetails production={production} setActiveTab={setActiveTab} />
      }
      {
        activeTab === 'second' &&
        <ProdEmployeesTable production={production} />
      }
      {
        activeTab === 'fifth' &&
        <OutputDetails production={production} />
      }
      {
        activeTab === 'fourth' &&
        <ProdRMTable setOpenNew={setOpenNew}  production={production} />
      }
      {
        activeTab === 'third' &&
        <ProductionLabourersTable production={production} />
      }
      <ProductionContentModal openNew={openNew} setOpenNew={setOpenNew}  production={production} />
    </div>
  )
}

export default SingleProductionComp