'use client'

import { useSettings } from "@/config/useSettings";
import { Tooltip } from "@mui/material";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";

type CustomCheckProps = {
  checked:boolean;
  setChecked:React.Dispatch<React.SetStateAction<boolean>>;
  checkedTip?:string;
  uncheckedTip?:string;
}

const CustomCheckV2 = ({checked, setChecked, checkedTip, uncheckedTip}:CustomCheckProps) => {
    const {primaryColour, isSuccess} = useSettings();
    if(!isSuccess) return null;
  return (
    <>
    {
        checked?
        <Tooltip title={checkedTip || 'Checked'} >
          <MdOutlineCheckBox  color={primaryColour} onClick={()=>setChecked(false)} className="cursor-pointer" />
        </Tooltip>
        :
        <Tooltip title={uncheckedTip || 'Unchecked'} >
          <MdOutlineCheckBoxOutlineBlank color={primaryColour} onClick={()=>setChecked(true)} className="cursor-pointer" />
        </Tooltip>
    }
    </>
  )
}

export default CustomCheckV2