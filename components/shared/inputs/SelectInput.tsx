import  {  ComponentProps } from 'react'

type SelectInputProps =  ComponentProps<'select'>

const SelectInput = ({className, ...props}: SelectInputProps) => {
  return (
    <select className={`${className} outline-none border-1 border-gray-300 rounded px-4 py-1`} {...props} >
        <option  value="Raw Materials">Raw Material</option>
        <option value="Unfinished Goods">Unfinished Good</option>
    </select>
  )
}

export default SelectInput