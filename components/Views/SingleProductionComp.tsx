'use client'
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs"
import { IProduction } from "@/lib/models/production.model";
import InputDetails from "../shared/outputs/productionDetails/InputDetails";
import OutputDetails from "../shared/outputs/productionDetails/OutputDetails";
// import ProdItemsTable from "../shared/outputs/productionDetails/ProdItemsTable";
import ProdProductsComp from "../shared/outputs/productionDetails/ProdProductsComp";
import ProdWorkersComp from "../shared/outputs/productionDetails/ProdWorkersComp";
import OldProductionComp from "../shared/outputs/productionDetails/oldProd/OldProductionComp";


type SingleProductionCompProps = {
  production: IProduction | null;
}

const SingleProductionComp = ({production}:SingleProductionCompProps) => {
  const [activeTab, setActiveTab] = useState<string>('first');
    const [currentStep, setCurrentStep] = useState(1);
    const [showWizard, setShowWizard] = useState(false);
  
  // const [openItem, setOpenItem] = useState(false);
  const handleWizard = (screen: number) => {
    setShowWizard(true);
    setCurrentStep(screen);
  }

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
      <OldProductionComp production={production} setCurrentStep={setCurrentStep} currentStep={currentStep} showWizard={showWizard} setShowWizard={setShowWizard} />
      {
        activeTab === 'first' &&
        <InputDetails production={production} setActiveTab={setActiveTab} openWizard={handleWizard} />
      }
      {
        activeTab === 'second' &&
        <ProdWorkersComp production={production} openWizard={handleWizard} />
      }
      
      {
        activeTab === 'third' &&
        <ProdProductsComp production={production} openWizard={handleWizard} />
      }
      {
        activeTab === 'fourth' &&
        <OutputDetails production={production} openWizard={handleWizard} />
      }
      
    </div>
  )
}

export default SingleProductionComp