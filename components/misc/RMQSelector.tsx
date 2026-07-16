import { IRMaterial } from "@/lib/models/rmaterial.mode"
import { ChangeEvent, ComponentProps } from "react"
// import { IoIosClose } from "react-icons/io"
// import TextInput from "../shared/inputs/TextInput"

type RMQSelectorProps = {
    material: IRMaterial;
    name:string;
    inputId:string;
    quantity?:number;
    weight?:number;
    onChangeInput: (e:ChangeEvent<HTMLInputElement>)=>void;
} & ComponentProps<"div">

const RMQSelector = ({material, quantity, weight, inputId, onChangeInput, name, className, ...props}:RMQSelectorProps) => {
    const product = material?.product as unknown as {name:string}
    const batch = material?.batch as unknown as {code:string}

  const qtyValue = quantity ?? 0;
  const wtValue = weight ?? 0;

  return (
    <div className={`border-[0.5px] flex flex-row items-end gap-2 border-gray-200 p-2 rounded relative ${className}`} {...props}>
        <span className="smallText" >{`${product?.name || material?.materialName} (${batch?.code})`}</span>
        <input className="border-b border-gray-300 outline-none text-center w-24" required value={qtyValue} placeholder="Qty" name={`qty-${inputId}`} id={`qty-${inputId}`} onChange={onChangeInput} type="number" max={material?.qAccepted} min={0} />
        <input className="border-b border-gray-300 outline-none text-center w-24" required value={wtValue} placeholder="Weight" name={`wt-${inputId}`} id={`wt-${inputId}`} onChange={onChangeInput} type="number" min={0} step="0.01" />
    </div>
  )
}

export default RMQSelector