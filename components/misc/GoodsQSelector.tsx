import { IGood } from "@/lib/models/good.model";
import { IProduction } from "@/lib/models/production.model";
import { ChangeEvent, ComponentProps } from "react";

type GoodsQSelectorProps = {
    item: IGood;
    name:string;
    inputId:string;
    quantity?:number;
    onChangeInput: (e:ChangeEvent<HTMLInputElement>)=>void;
} & ComponentProps<"div">

const GoodsQSelector = ({item, quantity, inputId, onChangeInput, name, className, ...props}:GoodsQSelectorProps) => {
    const prod = item?.production as IProduction;
 return (
    <div className={`border-[0.5px] flex flex-row items-end gap-2 border-gray-200 p-2 rounded relative ${className}`} {...props}>
        {/* <IoIosClose onClick={handleRemove} className="absolute top-0 right-0 cursor-pointer text-red-500" /> */}
        <span className="smallText" >{`${item?.name} (${prod?.name})`}</span>
        <input className="border-b border-gray-300 outline-none text-center" required defaultValue={quantity} placeholder="eg. 10" name={name} id={inputId} onChange={onChangeInput} type="number" max={item?.quantityLeftToPackage} min={0} />
    </div>
  )
}

export default GoodsQSelector