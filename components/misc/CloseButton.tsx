import { ComponentProps } from "react";
import { IoIosClose } from "react-icons/io";
import { twMerge } from "tailwind-merge";

type CloseButtonProps = ComponentProps<'div'>

const CloseButton = ({className, ...props}:CloseButtonProps) => {
  return (
    <div className={twMerge(className, 'flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer')}  {...props} >
        <IoIosClose className="text-red-700" />
    </div>
  )
}

export default CloseButton