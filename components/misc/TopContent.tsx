import { ComponentProps, Dispatch, ReactNode, SetStateAction } from "react";
import Title from "./Title";
import { useSettings } from "@/config/useSettings";
import { IoMdAddCircle } from "react-icons/io";

type TopContentProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  children:ReactNode
  
} & ComponentProps<typeof Title>;
const TopContent = ({openNew, setOpenNew, title, isLink=false, children}:TopContentProps) => {
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title={title} isLink={isLink}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        {children}
    </div>
  )
}

export default TopContent