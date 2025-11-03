import { IRMaterial } from "@/lib/models/rmaterial.mode"
import { ChangeEvent, ComponentProps } from "react"
// import { IoIosClose } from "react-icons/io"
// import TextInput from "../shared/inputs/TextInput"

type RMQSelectorProps = {
    material: IRMaterial;
    name:string;
    inputId:string;
    onChangeInput: (e:ChangeEvent<HTMLInputElement>)=>void;
} & ComponentProps<"div">

const RMQSelector = ({material, inputId, onChangeInput, name, className, ...props}:RMQSelectorProps) => {
    const product = material?.product as unknown as {name:string}
    const batch = material?.batch as unknown as {code:string}

    // const handleRemove = () => {
    //     setRmaterials( pre => pre.filter(rm=>rm._id !== material._id))
    // }

  return (
    <div className={`border-[0.5px] flex flex-row items-end gap-2 border-gray-200 p-2 rounded relative ${className}`} {...props}>
        {/* <IoIosClose onClick={handleRemove} className="absolute top-0 right-0 cursor-pointer text-red-500" /> */}
        <span className="smallText" >{`${product?.name || material?.materialName} (${batch?.code})`}</span>
        <input className="border-b border-gray-300 outline-none text-center" required placeholder="eg. 10" name={name} id={inputId} onChange={onChangeInput} type="number" max={material?.qAccepted} min={0} />
    </div>
  )
}

export default RMQSelector