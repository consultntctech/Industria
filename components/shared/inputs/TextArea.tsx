import  { ComponentProps } from 'react'

type TextAreaProps = ComponentProps<'textarea'>

const TextArea = ({className, ...props}: TextAreaProps) => {
  return (
   <textarea rows={4}  className={`${className} outline-none border-1 border-gray-300 rounded px-4 py-1`} {...props} />
  )
}

export default TextArea