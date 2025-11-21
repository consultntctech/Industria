import { IProdItem } from "@/lib/models/proditem.model";
import { ChangeEvent, ComponentProps } from "react";

type ProdItemSelectorProps = {
    item: IProdItem;
    name:string;
    inputId:string;
    quantity?:number;
    onChangeInput: (e:ChangeEvent<HTMLInputElement>)=>void;
} & ComponentProps<"div">

const ProdItemSelector = ({item, quantity, inputId, onChangeInput, name, className, ...props}:ProdItemSelectorProps) => {
 return (
    <div className={`border-[0.5px] flex flex-row items-end gap-2 border-gray-200 p-2 rounded relative ${className}`} {...props}>
        {/* <IoIosClose onClick={handleRemove} className="absolute top-0 right-0 cursor-pointer text-red-500" /> */}
        <span className="smallText" >{`${item?.materialName} (${item?.name})`}</span>
        <input className="border-b border-gray-300 outline-none text-center" required defaultValue={quantity} placeholder="eg. 10" name={name} id={inputId} onChange={onChangeInput} type="number" max={item?.stock} min={0} />
    </div>
  )
}

export default ProdItemSelector