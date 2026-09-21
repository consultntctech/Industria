import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { useAuth } from "../useAuth";
import { getOtherCurrencyByOrg } from "@/lib/actions/othercurrency.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchOtherCurrencyByOrg = (showDefault:boolean = true) => {
    const {user} = useAuth();
    const fetchOtherCurrency = async ():Promise<IOtherCurrency[]> => {
        try {
            if(!user) return [];
            const res = await getOtherCurrencyByOrg(user?.org);
            const payload = res.payload as IOtherCurrency[];
            return payload
            .filter((currency)=>showDefault ? currency : currency.type !== 'default')
            .sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:currencies=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['other-currencies-by-org', user?.org, showDefault],
        queryFn: fetchOtherCurrency,
        enabled: !!user
    });
    return {currencies, isPending, refetch, isSuccess}
}