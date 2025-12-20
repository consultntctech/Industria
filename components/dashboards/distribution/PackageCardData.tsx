import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { CardProps, IPackageStats } from "@/types/Types";
import { GoPackage } from "react-icons/go";

export const PackageCardData = (stats:IPackageStats|null=null, type:'quantity'|'price'):Partial<CardProps>[] => {
    const {currency} = useCurrencyConfig();
    const daily = stats?.daily?.at(-1);
    const today = daily?.quantity || 0;
    const weekly = stats?.weekly?.at(-1);
    const week = weekly?.quantity || 0;
    return [
        {
            title:'Total Packages ready for sale',
            titleIcon: <GoPackage />,
            bottomText:'Line items sold are not factored',
            centerText:type==='quantity'? `${stats?.pack || 0}` : `${currency?.symbol || ''} ${stats?.pack || 0}`
        },
        {
            title:'Value of Products packaged today',
            titleIcon: <GoPackage />,
            bottomText:'Packages made today',
            centerText:type==='quantity'? `${today}` : `${currency?.symbol || ''} ${today}`
        },
        {
            title:'Value of Products packaged this week',
            titleIcon: <GoPackage />,
            bottomText:'Packages made this week',
            centerText:type==='quantity'? `${week}` : `${currency?.symbol || ''} ${week}`
        }
    ]
}