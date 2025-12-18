import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
// import { useFetchTransactMonthly } from "@/hooks/fetch/useFetchStats";
import { CardProps, ITransactMontly } from "@/types/Types";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { LuClock4 } from "react-icons/lu";
import { RiClockwiseLine } from "react-icons/ri";

export const TransCardsData = (transactMontly: ITransactMontly | null = null, month?:number, year?:number, type:"quantity" | "price" = "quantity"):Partial<CardProps>[] => {
    
    const {currency} = useCurrencyConfig();
    return [
        {
            title: "Current Orders",
            titleIcon: <IoCartOutline className="text-blue-600" />,
            centerText: type === 'quantity' ? `${transactMontly?.order?.pending || 0}` : `${currency?.symbol ||''} ${transactMontly?.order?.pending || 0}`,
            bottomText: `Orders for ${month ? `${month}-${year}` : 'this month'}`
        },
        {
            title: 'Completed Orders',
            titleIcon: <IoMdCheckmarkCircleOutline className="text-green-600" />,
            centerText: type === 'quantity' ? `${transactMontly?.order?.fulfilled || 0}` : `${currency?.symbol ||''} ${transactMontly?.order?.fulfilled || 0}`,
            bottomText: `Completed orders for ${month ? `${month}-${year}` : 'this month'}`
        },
        {
            title: "Delayed Orders",
            titleIcon: <LuClock4 className="text-red-600" />,
            centerText: type === 'quantity' ? `${transactMontly?.order?.delayed || 0}` : `${currency?.symbol ||''} ${transactMontly?.order?.delayed || 0}`,
            bottomText: `Delayed orders for ${month ? `${month}-${year}` : 'this month'}`
        },
        {
            title: 'Returns',
            titleIcon: <RiClockwiseLine className="text-orange-600" />,
            centerText: type === 'quantity' ? `${transactMontly?.return || 0}` : `${currency?.symbol ||''} ${transactMontly?.return || 0}`,
            bottomText: `Returned goods for ${month ? `${month}-${year}` : 'this month'}`
        }
    ]
}


