import Card from "@/components/misc/Card"
import { CardProps } from "@/types/Types"

const TransCard = ({ item, ...props }: { item: Partial<CardProps> }) => {
  return (
    <Card className="sm:w-52 h-28 p-4 gap-3" {...props} >
            <div className="flex flex-row justify-between items-center w-full">
                <span className="smallText2" >{item.title}</span>
                {item.titleIcon}
            </div>
    
            <div className="flex w-full">
                <span className="subtitle">{item.centerText}</span>
            </div>
            <div className="flex w-full">
                <span className="greyText2">{item.bottomText}</span>
            </div>
    </Card>
  )
}

export default TransCard