'use client'
import { Settings } from '@/config/Settings';
import React, { ComponentProps } from 'react'

type PrimaryButtonProps = {
    text:string;
} & ComponentProps<'button'>

const PrimaryButton = ({text, className, ...props}: PrimaryButtonProps) => {
  return (
    <button
    style={{backgroundColor:Settings().primaryColour}}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Settings().tertiaryColour)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Settings().primaryColour)} 
    className={`${className} cursor-pointer text-white font-semibold rounded p-1`} {...props} >{text}</button>
  )
}

export default PrimaryButton