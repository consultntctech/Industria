import React, {  ReactNode } from 'react'


type GenericLabelProps = {
    label: string;
    input:ReactNode
} 

const GenericLabel = ({ label, input}: GenericLabelProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
        <span className="smallText">{label}</span>
        {input}
    </div>
  )
}

export default GenericLabel