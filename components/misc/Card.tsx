import { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge";

type CardProps = {
    children:ReactNode;
} & ComponentProps<"div">;
const Card = ({children, className, ...props}:CardProps) => {
  return (
    <div {...props}  className={twMerge(`p-8 shadow rounded-xl w-60 md:w-72 h-44 flex justify-between flex-col gap-5 ${className}`)} >{children}</div>
  )
}

export default Card