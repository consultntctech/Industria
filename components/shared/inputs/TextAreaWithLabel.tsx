import  { ComponentProps } from 'react'
import TextArea from './TextArea';

type TextAreaWithLabelProps = {
    label: string;
} & ComponentProps<typeof TextArea>

const TextAreaWithLabel = ({ label, className, ...props }: TextAreaWithLabelProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
        <span className="smallText">{label}</span>
        <TextArea className={`${className}`} {...props} />
    </div>
  )
}

export default TextAreaWithLabel