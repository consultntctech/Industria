import Card from "@/components/misc/Card"
import { ComponentProps, ReactNode } from "react";

export interface FinanceCardProps extends ComponentProps<typeof Card>{
    title: string;
    titleIcon: ReactNode;
    centerText: string;
    bottomText: string;
};

const FinanceCard = ({item, ...props}:{item:Partial<FinanceCardProps>}) => {

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