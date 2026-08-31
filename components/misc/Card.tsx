import { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge";

type CardProps = {
    children:ReactNode;
} & ComponentProps<"div">;
const Card = ({children, className, ...props}:CardProps) => {
  return (
    <div {...props}  className={twMerge(`p-8 shadow rounded-lg w-[78vw] sm:w-72 h-44 flex justify-between border border-gray-200 flex-col gap-5 ${className}`)} >{children}</div>
  )
}

export default Card