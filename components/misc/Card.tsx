import { ComponentProps, ReactNode } from "react"

type CardProps = {
    children:ReactNode;
} & ComponentProps<"div">;
const Card = ({children, ...props}:CardProps) => {
  return (
    <div {...props}  className="p-8 shadow rounded-xl w-72 h-44 flex justify-between flex-col gap-5" >{children}</div>
  )
}

export default Card