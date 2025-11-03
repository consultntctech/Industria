import { ICurrency } from "@/lib/models/currency.model"
import { useAuth } from "../useAuth";
import { getCurrencyByOrg } from "@/lib/actions/currency.action";
import { useQuery } from "@tanstack/react-query";

export const useCurrencyConfig = () => {
    const {user} = useAuth();
    const fetchCurrency = async ():Promise<ICurrency | null> =>{
        try {
            if(!user) return null;
            const result = await getCurrencyByOrg(user?.org);
            const currency =  result?.payload as ICurrency;
            return currency;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:currency, refetch, isPending:currencyLoading} = useQuery({
        queryKey:['currencyconf'],
        queryFn:fetchCurrency,
        enabled:!!user?.org
    })
    return {currency, refetch, currencyLoading}
}