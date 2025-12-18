import { getReturns, getReturnsGroupedByMonth, getReturnsQuantityGroupedByMonth, getTodayReturns } from "@/lib/actions/returns.action";
import { IReturns } from "@/lib/models/returns.model"
import { IMonthlyStats } from "@/types/Types";
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


export const useFetchReturnsByMonth = () => {
    const fetchReturns = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getReturnsGroupedByMonth();
            const data = res.payload as IMonthlyStats[];
            return data.slice(-6);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['returnsbymonth'],
    queryFn: fetchReturns,
  })
  return {returns, isPending, refetch, isSuccess}

}


export const useFetchReturnsQuantityByMonth = () => {
    const fetchReturns = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getReturnsQuantityGroupedByMonth();
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
  
  const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['returnsquantitybymonth'],
    queryFn: fetchReturns,
  })
  return {returns, isPending, refetch, isSuccess}

}