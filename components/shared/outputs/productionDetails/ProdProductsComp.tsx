import { IProduction } from "@/lib/models/production.model";
import { useState } from "react";
import ProductionContentModal from "./ProductionContentModal";
import ProdRMTable from "./ProdRMTable";
import CustomTabs from "@/components/misc/CustomTabs";
import ProdGoodTable from "./ProdGoodTable";
import ProductionGoodsModal from "./ProductionGoodsModal";

type ProdProductsCompProps = {
    production: IProduction | null;
}

const ProdProductsComp = ({ production }: ProdProductsCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const [openNew, setOpenNew] = useState(false);
    const [openGoods, setOpenGoods] = useState(false);
  return (
    <div className="flex flex-col gap-5" >
        <span className='font-bold text-xl' >Products</span>
        <CustomTabs
            FirstTabText="Raw" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
            SecondTabText="Unfinished" onClickSecondTab={()=>setActiveTab('second')} showSecondTab={true}
        />
        <ProductionContentModal openNew={openNew} setOpenNew={setOpenNew}  production={production} />
        <ProductionGoodsModal openGoods={openGoods} setOpenGoods={setOpenGoods}  production={production} />
        {
            activeTab === 'first' &&
            <ProdRMTable setOpenNew={setOpenNew}  production={production} />
        }
        {
            activeTab === 'second' &&
            <ProdGoodTable setOpenGoods={setOpenGoods}  production={production} />
        }
    </div>
  )
}

export default ProdProductsComp