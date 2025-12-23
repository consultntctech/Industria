import  { ComponentProps } from 'react'
// import TextInput from './TextInput'
import ImagePicker from './ImagePicker';

type ImagePickerWithLabelProps = {
    label: string;
} & ComponentProps<typeof ImagePicker>

const ImagePickerWithLabel = ({ label, className, ...props }: ImagePickerWithLabelProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
        <span className="smallText">{label}</span>
        <ImagePicker className={`${className}`} {...props} />
    </div>
  )
}

export default ImagePickerWithLabel