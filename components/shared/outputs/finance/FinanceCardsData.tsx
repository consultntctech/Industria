import { useFetchStats } from "@/hooks/fetch/useFetchStats";
import { FinanceCardProps } from "./FinanceCard";
import { TbBrandCashapp } from "react-icons/tb";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { useSettings } from "@/config/useSettings";

export const FinanceCardsData = ():Partial<FinanceCardProps>[] => {
    const {stats} = useFetchStats();
    const {currency} = useCurrencyConfig();
    const {primaryColour} = useSettings();
    return [
        {
            title: "Total Cost of Productions",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.totalProductionsAmount}`,
            bottomText: "All-time production cost of products"
        },
        {
            title: "Total Cost of Packaging",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.totalPackagingAmount}`,
            bottomText: "All-time packaging cost of products"
        },
        {
            title: "Total Sales",
            titleIcon: <TbBrandCashapp color={primaryColour} />,
            centerText: ` ${currency?.symbol ||''} ${stats?.totalSalesAmount}`,
            bottomText: "All-time sales of products"
        },
    ]
}