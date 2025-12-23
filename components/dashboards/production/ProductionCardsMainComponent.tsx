import { IProductionStats } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { ProductionCardData } from "./ProductionDashData";
import ProductionCard from "./ProductionCard";

type ProductionCardsMainComponentProps = {
    stats: IProductionStats | null | undefined;
    isPending: boolean;
}

const ProductionCardsMainComponent = ({stats, isPending}:ProductionCardsMainComponentProps) => {
    const data = ProductionCardData(stats);
  return (
    <div className="flex w-[86vw] sm:w-full flex-col gap-2.5 border border-slate-200 shadow p-4 rounded-xl">
        <span className="semibold">Overall Production Overview</span>
        
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <div className="w-full flex-col flex lg:flex-row items-center flex-wrap gap-4 justify-between" >
                {
                    data?.map((item, index)=>(
                        <ProductionCard key={index} item={item} />
                    ))
                }
            </div>
        }
    </div>
  )
}

export default ProductionCardsMainComponent