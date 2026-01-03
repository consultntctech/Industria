import Card from "@/components/misc/Card"
import { CardProps } from "@/types/Types"
import { twMerge } from "tailwind-merge"

const MainDashCard = ({ item, ...props }: { item: Partial<CardProps> }) => {
  return (
    <Card className="sm:w-52 h-28 p-4 gap-3" {...props} >
        <div className="flex flex-row justify-between items-center w-full">
            <span className="smallText2" >{item?.title}</span>
            {item?.titleIcon}
        </div>

        <div className="flex w-full">
            <span className="subtitle">{item?.centerText}</span>
        </div>
        <div className="flex w-full">
            <span className={twMerge("greyText2", 'text-green-600')}>{item?.bottomText}</span>
        </div>
    </Card>
  )
}

export default MainDashCard