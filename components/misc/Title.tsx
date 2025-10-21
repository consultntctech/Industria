'use client'

import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

type TitleProps = {
    title:string,
    isLink:boolean,
    link?:string,
}
const Title = ({title, isLink,link}:TitleProps) => {
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
    <div className="flex flex-row items-center gap-4">
        <IoIosArrowRoundBack size={30} onClick={handleBack} className=" cursor-pointer" />
        <span onClick={handleClick} className={`${isLink && 'hover:underline cursor-pointer text-blue-600'} text-2xl font-bold`} >{title}</span>
    </div>
  )
}

export default Title