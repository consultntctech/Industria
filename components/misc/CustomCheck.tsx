import { useSettings } from '@/config/useSettings';
import React from 'react'

type CustomCheckProps = {
    checked:boolean;
    setChecked:React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomCheck = ({checked, setChecked}:CustomCheckProps) => {
    const {primaryColour} = useSettings()
  return (
    <div style={{backgroundColor:checked? primaryColour:'transparent'}}  className='w-3 h-3 border border-gray-500 rounded-[0.1rem] cursor-pointer' onClick={()=>setChecked(e=>!e)} ></div>
  )
}

export default CustomCheck