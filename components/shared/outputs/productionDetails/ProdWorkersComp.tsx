import { IProduction } from "@/lib/models/production.model";
import { useState } from "react";
import CustomTabs from "@/components/misc/CustomTabs";
import ProdEmployeesTable from "./ProdEmployeesTable";
import ProductionLabourersTable from "./ProductionLabourersTable";
import ProdSupervisorsTable from "./ProdSupervisorsTable";

type ProdWorkersCompProps = {
    production: IProduction | null;
}

const ProdWorkersComp = ({ production }: ProdWorkersCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
  return (
    <div className="flex flex-col gap-5" >
        <span className='font-bold text-xl' >Production Workers</span>
        <CustomTabs
            FirstTabText="Supervisors" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
            SecondTabText="Employees" onClickSecondTab={()=>setActiveTab('second')} showSecondTab={true}
            showThirdTab={true} ThirdTabText="Labourers" onClickThirdTab={()=>setActiveTab('third')}
        />
       
        {
            activeTab === 'first' &&
            <ProdSupervisorsTable production={production} />
        }
        {
            activeTab === 'second' &&
            <ProdEmployeesTable production={production} />
        }
        {
            activeTab === 'third' &&
            <ProductionLabourersTable production={production} />
        }
    </div>
  )
}

export default ProdWorkersComp