import React, { ComponentProps } from 'react'
import TextInput from './TextInput'

type InputWithLabelProps = {
    label: string;
} & ComponentProps<typeof TextInput>

const InputWithLabel = ({ label, className, ...props }: InputWithLabelProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
        <span className="smallText">{label}</span>
        <TextInput className={`${className}`} {...props} />
    </div>
  )
}

export default InputWithLabel