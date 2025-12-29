import Card from "@/components/misc/Card"
import { IProductCardData } from "@/types/Types"

const ProductCard = ({item, ...props}:{item:IProductCardData}) => {
  return (
    <Card className="h-36 w-52 p-4 gap-3 border border-slate-200 " {...props} >
        <div className="flex flex-row justify-between items-center w-full">
            <span className="semibold" >{item?.name}</span>
        </div>
        <div className="flex flex-col gap-0.5 w-full">
            <span className="greyText2">Current Stock: {item?.stock} {Number(item?.stock || 0) > 1 ? 'units' : 'unit'}</span>
            <span className="greyText2">Threshold Point: {item?.threshold} {Number(item?.threshold || 0) > 1 ? 'units' : 'unit'}</span>
        </div>
        
        <span className="rounded-2xl text-[0.7rem] font-semibold bg-red-800 px-2 w-fit text-slate-200">Low Stock</span>        
    </Card>
  )
}

export default ProductCard