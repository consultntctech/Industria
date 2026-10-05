'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs"
import { IProduction } from "@/lib/models/production.model";
import InputDetails from "../shared/outputs/productionDetails/InputDetails";
import OutputDetails from "../shared/outputs/productionDetails/OutputDetails";
// import ProdItemsTable from "../shared/outputs/productionDetails/ProdItemsTable";
import ProductionLabourersTable from '../shared/outputs/productionDetails/ProductionLabourersTable';
import ProdEmployeesTable from "../shared/outputs/productionDetails/ProdEmployeesTable";
import ProdProductsComp from "../shared/outputs/productionDetails/ProdProductsComp";


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
        SecondTabText="Employees" onClickSecondTab={()=>setActiveTab('second')}
        // ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        ThirdTabText="Labourers" onClickThirdTab={()=>setActiveTab('third')}
        FourthTabText="Products" onClickFourthTab={()=>setActiveTab('fourth')}
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
        <ProdProductsComp production={production} />
      }
      {
        activeTab === 'third' &&
        <ProductionLabourersTable production={production} />
      }
      
    </div>
  )
}

export default SingleProductionComp