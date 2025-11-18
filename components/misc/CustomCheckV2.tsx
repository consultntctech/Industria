'use client'

import { useSettings } from "@/config/useSettings";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";

type CustomCheckProps = {
  checked:boolean;
  setChecked:React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomCheckV2 = ({checked, setChecked}:CustomCheckProps) => {
    const {primaryColour, isSuccess} = useSettings();
    if(!isSuccess) return null;
  return (
    <>
    {
        checked?
        <MdOutlineCheckBox  color={primaryColour} onClick={()=>setChecked(false)} className="cursor-pointer" />
        :
        <MdOutlineCheckBoxOutlineBlank color={primaryColour} onClick={()=>setChecked(true)} className="cursor-pointer" />
    }
    </>
  )
}

export default CustomCheckV2