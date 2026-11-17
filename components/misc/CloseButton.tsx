import { ComponentProps } from "react";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

type CloseButtonProps = { label?: string } & Omit<ComponentProps<'button'>, 'type' | 'children'>

/** Round "×" pinned to the top-right corner of the nearest `relative` container. */
const CloseButton = ({ className, label = "Close", ...props }: CloseButtonProps) => {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={twMerge(
        'absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600 focus-visible:outline-2',
        className
      )}
      {...props}
    >
      <IoClose size={18} />
    </button>
  )
}

export default CloseButton
