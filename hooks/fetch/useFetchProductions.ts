import { getLastSixMonthsProductions, getLastSixMonthsProductionsByOrg, getProductions, getProductionsByOrg, getProductionStats, getProductionStatsByOrg } from "@/lib/actions/production.action";
import { IProduction } from "@/lib/models/production.model";
import { IMonthlyStats, IProductionStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchProductions = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProductions = async ():Promise<IProduction[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getProductions() : await getProductionsByOrg(user?.org);
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
        enabled: !!user,
    })

    return {productions, isPending, refetch, isSuccess}
  
}


export const useFetchSixMonthProductions = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProductions = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getLastSixMonthsProductions() : await getLastSixMonthsProductionsByOrg(user?.org);
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
    enabled: !!user
  })
  return {productions, isPending, refetch, isSuccess}
}


export const useFetchProductionStats = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProductionStats = async ():Promise<IProductionStats | null> => {
        try {
            if(!user) return null;
            const res = isAdmin ? await getProductionStats() : await getProductionStatsByOrg(user?.org);
            const data = res.payload as IProductionStats;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:productionStats, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['productionStats'],
        queryFn: fetchProductionStats,
        enabled: !!user
    })

    return {productionStats, isPending, refetch, isSuccess}
}