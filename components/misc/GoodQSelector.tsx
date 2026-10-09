import { IBatch } from "@/lib/models/batch.model";
import { IGood } from "@/lib/models/good.model";
import { IProduct } from "@/lib/models/product.model";
import { ChangeEvent, ComponentProps } from "react"
// import { IoIosClose } from "react-icons/io"
// import TextInput from "../shared/inputs/TextInput"

type GoodQSelectorProps = {
    material: IGood;
    name:string;
    inputId:string;
    quantity?:number;
    weight?:number;
    onChangeInput: (e:ChangeEvent<HTMLInputElement>)=>void;
} & ComponentProps<"div">

const GoodQSelector = ({material, quantity, weight, inputId, onChangeInput, name, className, ...props}:GoodQSelectorProps) => {
    const product = material?.product as unknown as IProduct
    const batch = material?.batch as unknown as IBatch

  const qtyValue = quantity ? quantity : '';
  const wtValue = weight ? weight : '';

  return (
    <div className={`border-[0.5px] flex flex-row items-end gap-2 border-gray-200 p-2 rounded relative ${className}`} {...props}>
        <span className="smallText" >{`${product?.name || material?.serialName} (${batch?.code})`}</span>
        <input className="border-b border-gray-300 outline-none text-center w-24" required value={qtyValue} placeholder="Quantity" name={`qty-${inputId}`} id={`qty-${inputId}`} onChange={onChangeInput} type="number" step={0.01} max={material?.raw} min={0} />
        <input className="border-b border-gray-300 outline-none text-center w-24" required value={wtValue} placeholder="Weight" name={`wt-${inputId}`} id={`wt-${inputId}`} onChange={onChangeInput} type="number" min={0} step="0.01" />
    </div>
  )
}

export default GoodQSelector