import { IProductCardData, IProductStats } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import ProductCard from "./ProductCard";

type ProductLowStockCardProps = {
    stats: IProductStats[] | null | undefined;
    isPending: boolean;
}

const ProductLowStockCard = ({stats, isPending}:ProductLowStockCardProps) => {
    const data = stats?.filter(item=>item?.outOfStock) || [];
    if(!data?.length) return null;
  return (
    <div className="flex w-[86vw] md:w-full flex-col gap-4 p-2.5 shadow flex-2 rounded-2xl" >
        <span className="semibold text-center md:text-left">Low Stock Alerts</span>
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <div className="w-full flex flex-col md:flex-row items-center flex-wrap gap-4">
                {
                    data?.map((item, index)=>{
                        const card:IProductCardData = {
                            name: item?.name,
                            stock: item?.stock?.toString(),
                            threshold: item?.threshold?.toString(),
                        }
                        return (
                            <ProductCard key={index} item={card} />
                        )
                    })
                }
            </div>
        }
    </div>
  )
}

export default ProductLowStockCard