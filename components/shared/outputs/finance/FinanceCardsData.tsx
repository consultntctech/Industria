// import { useFetchStats } from "@/hooks/fetch/useFetchStats";
import { TbBrandCashapp } from "react-icons/tb";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useSettings } from "@/config/useSettings";
import { CardProps, IStats } from "@/types/Types";

export const FinanceCardsData = (stats:IStats | null | undefined):Partial<CardProps>[] => {
    
    const {currency} = useCurrencyConfig();
    const {primaryColour} = useSettings();
    return [
        {
            title: "Total Cost of Productions",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.production?.amount}`,
            bottomText: "All-time production cost of products"
        },
        {
            title: "Total Cost of Packaging",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.packaging?.amount}`,
            bottomText: "All-time packaging cost of products"
        },
        {
            title: "Total Sales",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.sales?.amount}`,
            bottomText: "All-time sales of products"
        },
    ]
}