import  {  ComponentProps } from 'react'

type TextInputProps =  ComponentProps<'input'>

const TextInput = ({className, ...props}: TextInputProps) => {
  return (
    <input className={`${className} outline-none border-1 border-gray-300 rounded px-4 py-1`} {...props} />
  )
}

export default TextInput