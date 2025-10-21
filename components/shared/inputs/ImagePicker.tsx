import React, { ComponentProps } from 'react'

type ImagePickerProps = {

} & ComponentProps<'div'>

const ImagePicker = ({className, ...props}: ImagePickerProps) => {
  return (
    <div className='w-[10rem] h-[10rem] border-dashed' >ImagePicker</div>
  )
}

export default ImagePicker