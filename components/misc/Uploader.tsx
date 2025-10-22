'use client'

import { CldUploadWidget,  CloudinaryUploadWidgetResults } from "next-cloudinary"
import { ComponentProps } from "react"

type UploaderProps = {
    onSuccess: (result:CloudinaryUploadWidgetResults)=>Promise<void>
    text?:string
} & ComponentProps<'div'>


const Uploader = ({onSuccess, text='Upload Image', className, ...props}:UploaderProps) => {
    return(
        <CldUploadWidget onError={(e)=>console.log(e)} onSuccess={onSuccess} uploadPreset="industra_preset" >
            {({open})=>{
                return(
                    <div onClick={()=>open?.()} className={`rounded-full cursor-pointer hover:bg-gray-100 w-full flex items-center justify-center py-1 px-2 border border-gray-200 ${className}`} {...props} >{text}</div>
                )
            }}
        </CldUploadWidget>
    )
}

export default Uploader


