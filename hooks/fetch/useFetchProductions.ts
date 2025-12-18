import { getLastSixMonthsProductions, getProductions } from "@/lib/actions/production.action";
import { IProduction } from "@/lib/models/production.model";
import { IMonthlyStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";

export const useFetchProductions = () => {
    const fetchProductions = async ():Promise<IProduction[]> => {
        try {
            const res = await getProductions();
            const data = res.payload as IProduction[];
            return data.sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:productions=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['productions'],
        queryFn: fetchProductions,
        enabled: true,
    })

    return {productions, isPending, refetch, isSuccess}
  
}


export const useFetchSixMonthProductions = () => {
    const fetchProductions = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getLastSixMonthsProductions();
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:productions=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['sixmonthsproductions'],
    queryFn: fetchProductions,
  })
  return {productions, isPending, refetch, isSuccess}
}