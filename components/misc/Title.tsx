'use client'

import { useRouter } from "next/navigation";
import { ComponentProps } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";

type TitleProps = {
    title:string,
    isLink:boolean,
    link?:string,
    showback?:boolean
} & ComponentProps<'div'>;
const Title = ({title, showback=true, isLink,link, className, ...props}:TitleProps) => {
    const router = useRouter();
    const handleClick = () => {
        if(link){
            router.push(link);
        }
    }

    const handleBack = () => {
        router.back();
    }

  return (
    <div className={`flex flex-row items-center gap-4 ${className}`} {...props}>
        {
            showback &&
            <IoIosArrowRoundBack size={30} onClick={handleBack} className=" cursor-pointer" />
        }
        <span onClick={handleClick} className={`${isLink && 'hover:underline cursor-pointer text-blue-600'} text-2xl font-bold`} >{title}</span>
    </div>
  )
}

export default Title