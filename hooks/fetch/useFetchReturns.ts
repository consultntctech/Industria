import { getReturns, getTodayReturns } from "@/lib/actions/returns.action";
import { IReturns } from "@/lib/models/returns.model"
import { useQuery } from "@tanstack/react-query";

export const useFetchReturns = (isToday?:boolean) => {
    const fetchReturns = async ():Promise<IReturns[]> => {
        try {
            const res = isToday ? await getTodayReturns() : await getReturns();
            const data = res.payload as IReturns[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    

    const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Returns', isToday],
        queryFn: fetchReturns,
    })
    return {returns, isPending, refetch, isSuccess}
}