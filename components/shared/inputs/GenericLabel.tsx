import  {  ComponentProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge';


type GenericLabelProps = {
    label?: string;
    input:ReactNode
} & ComponentProps<'div'>

const GenericLabel = ({ label, input, className, ...props}: GenericLabelProps) => {
  return (
    <div className={twMerge("flex flex-col w-full gap-1", className)} {...props}>
        <span className="smallText">{label}</span>
        {input}
    </div>
  )
}

export default GenericLabel