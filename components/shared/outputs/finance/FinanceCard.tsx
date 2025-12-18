import Card from "@/components/misc/Card"
import { CardProps } from "@/types/Types";


const FinanceCard = ({item, ...props}:{item:Partial<CardProps>}) => {

  return (
    <Card {...props} >
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

export default FinanceCard